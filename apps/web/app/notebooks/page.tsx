"use client";

import { useState, useEffect } from "react";
import { NotebookCard } from "@/components/library/NotebookCard";
import { ExerciseCard } from "@/components/practice/ExerciseCard";
import { Card } from "@/components/ui/Card";
import { books } from "@/lib/data";
import { AINotebook } from "@/lib/ai-schemas";
import { useAuth } from "@/lib/AuthContext";
import { getUserErrors } from "@/lib/persistence";
import { saveReviewItem, ReviewItem } from "@/lib/spaced-repetition";
import { Brain, Sparkles, BookOpen, List, HelpCircle, FileText, RefreshCw } from "lucide-react";

export default function NotebooksPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("B2");
  const [domain, setDomain] = useState("Econometrics");
  const [targetSkill, setTargetSkill] = useState("writing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNotebook, setGeneratedNotebook] = useState<AINotebook | null>(null);

  // Spaced Repetition states for dynamically generated items
  const [addedVocabs, setAddedVocabs] = useState<Record<string, boolean>>({});
  const [addedPhrases, setAddedPhrases] = useState<Record<string, boolean>>({});
  const [addedGrammar, setAddedGrammar] = useState<Record<number, boolean>>({});

  const handleAddVocabToSRS = async (vocab: { word: string; translation: string; definition: string; example: string }) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-vocab-ai-${vocab.word}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "vocabulary",
      item_id: vocab.word,
      prompt: `Vocabulario: "${vocab.word}"`,
      answer_hint: `${vocab.translation}\n\nDefinición: ${vocab.definition}\n\nEjemplo:\n${vocab.example}`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "ai_notebook",
      source_id: vocab.word,
      notebook_title: generatedNotebook?.title || "AI Notebook",
      domain: generatedNotebook?.domain || domain,
      level: generatedNotebook?.level || level,
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedVocabs(prev => ({ ...prev, [vocab.word]: true }));
  };

  const handleAddPhraseToSRS = async (phrase: string) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-phrase-${phrase.replace(/\s+/g, '-').toLowerCase()}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "phrase",
      item_id: phrase,
      prompt: `Expresión académica: "${phrase}"`,
      answer_hint: `Uso académico/economía.`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "ai_notebook",
      source_id: phrase,
      notebook_title: generatedNotebook?.title || "AI Notebook",
      domain: generatedNotebook?.domain || domain,
      level: generatedNotebook?.level || level,
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedPhrases(prev => ({ ...prev, [phrase]: true }));
  };

  const handleAddGrammarToSRS = async (block: string, index: number) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-grammar-${index}-${block.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "grammar",
      item_id: `grammar-${index}`,
      prompt: `Regla gramatical / Estilo:`,
      answer_hint: block,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "ai_notebook",
      source_id: `grammar-${index}`,
      notebook_title: generatedNotebook?.title || "AI Notebook",
      domain: generatedNotebook?.domain || domain,
      level: generatedNotebook?.level || level,
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedGrammar(prev => ({ ...prev, [index]: true }));
  };

  const notebooks = books.flatMap((book) =>
    book.notebooks.map((notebook) => ({ ...notebook, bookTitle: book.title }))
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reviewMistakes") === "true") {
        const fetchAndGenerate = async () => {
          setLoading(true);
          setError(null);
          try {
            const errs = await getUserErrors(user?.id);
            const pending = errs
              .filter((e) => e.retry_status === "pendiente")
              .map((e) => e.user_answer);

            if (pending.length === 0) {
              setError("No tienes errores pendientes para repasar.");
              setLoading(false);
              return;
            }

            const res = await fetch("/api/generate-notebook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                topic: "Repaso de Errores Personales",
                level: "B2",
                domain: "Economía y Redacción Científica",
                targetSkill: "grammar",
                userMistakes: pending.slice(0, 5),
                userId: user?.id,
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error ? JSON.stringify(data.error) : "Error al generar cuaderno.");
            }

            setGeneratedNotebook(data.notebook);
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al generar el cuaderno de repaso.");
          } finally {
            setLoading(false);
          }
        };

        fetchAndGenerate();
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("academic-english-lab-imported-notebook");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setGeneratedNotebook(parsed);
          localStorage.removeItem("academic-english-lab-imported-notebook");
        } catch (e) {
          console.error("Failed to load imported notebook", e);
        }
      }
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedNotebook(null);

    try {
      const res = await fetch("/api/generate-notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          level,
          domain,
          targetSkill,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ? JSON.stringify(data.error) : "Error al generar cuaderno.");
      }

      setGeneratedNotebook(data.notebook);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cuadernos de Estudio</h1>
        <p className="mt-2 text-slate-600">Revisa la biblioteca de temas predeterminados o genera cuadernos personalizados con Inteligencia Artificial.</p>
      </div>

      {/* AI Notebook Generator Form */}
      <Card className="border-slate-300 shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-2xl bg-slate-950 p-2 text-white">
            <Sparkles size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Generador de Cuadernos con IA</h2>
            <p className="text-xs text-slate-500 font-medium">Define tu tema de interés y la IA creará teoría, vocabulario y ejercicios.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid gap-5 md:grid-cols-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Tema de interés (Inglés Académico)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Probit models coefficients, Writing introduction section..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Dominio Académico</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500 bg-white"
            >
              <option value="Econometrics">Econometría</option>
              <option value="Public Policy">Políticas Públicas</option>
              <option value="Research Writing">Escritura de Papers</option>
              <option value="Conference Speaking">Presentaciones y Conferencias</option>
              <option value="Academic Teaching">Docencia Universitaria</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Nivel</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500 bg-white"
            >
              <option value="A2">A2 (Elementary)</option>
              <option value="B1">B1 (Intermediate)</option>
              <option value="B2">B2 (Upper-Intermediate)</option>
              <option value="C1">C1 (Advanced)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Habilidad</label>
            <select
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500 bg-white"
            >
              <option value="writing">Escritura (Writing)</option>
              <option value="speaking">Habla (Speaking)</option>
              <option value="grammar">Gramática (Grammar)</option>
              <option value="vocabulary">Vocabulario (Vocabulary)</option>
              <option value="econometrics">Econometría (Econometrics)</option>
              <option value="classroom English">Inglés de Clase (Classroom)</option>
            </select>
          </div>

          <div className="md:col-span-4 mt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full sm:w-auto rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Generando Cuaderno Académico...
                </>
              ) : (
                <>
                  <Brain size={16} className="text-amber-400" />
                  Generar Cuaderno
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            <p className="font-semibold">Error de validación o generación:</p>
            <p className="text-xs font-mono mt-1 whitespace-pre-wrap">{error}</p>
          </div>
        )}
      </Card>

      {/* Preview Section for Generated Notebook */}
      {generatedNotebook && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <FileText className="text-slate-800" size={24} />
            <h2 className="text-2xl font-bold text-slate-800">Vista Previa: {generatedNotebook.title}</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Theory, Vocabulary & Phrase Bank */}
            <div className="lg:col-span-2 space-y-6">
              {/* Theory Blocks */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Teoría y Reglas Pedagógicas</h3>
                </div>
                <div className="space-y-3">
                  {generatedNotebook.theoryBlocks.map((block, idx) => {
                    const isAdded = addedGrammar[idx];
                    return (
                      <div key={idx} className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-50 last:border-b-0">
                        <p className="text-sm text-slate-700 leading-relaxed flex-1">{block}</p>
                        <button
                          onClick={() => handleAddGrammarToSRS(block, idx)}
                          disabled={isAdded}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition shrink-0 mt-0.5 ${
                            isAdded
                              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isAdded ? "✓ Repaso" : "+ Repasar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Phrase Bank */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <List size={18} className="text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Phrase Bank (Banco de Frases)</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {generatedNotebook.phraseBank.map((phrase, idx) => {
                    const isAdded = addedPhrases[phrase];
                    return (
                      <li key={idx} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 select-none">•</span>
                          <span className="font-medium italic">"{phrase}"</span>
                        </div>
                        <button
                          onClick={() => handleAddPhraseToSRS(phrase)}
                          disabled={isAdded}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition shrink-0 ${
                            isAdded
                              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isAdded ? "✓ Repaso" : "+ Repasar"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              {/* Vocabulary Items */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Vocabulario Clave</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {generatedNotebook.vocabularyItems.map((vocab, idx) => {
                    const isAdded = addedVocabs[vocab.word];
                    return (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {vocab.word} <span className="text-xs text-slate-400 font-normal">({vocab.translation})</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{vocab.definition}</p>
                          <p className="text-xs text-slate-700 italic mt-1.5">"{vocab.example}"</p>
                        </div>
                        <button
                          onClick={() => handleAddVocabToSRS(vocab)}
                          disabled={isAdded}
                          className={`mt-3 w-full rounded-lg py-1 text-[10px] font-bold border transition ${
                            isAdded
                              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isAdded ? "✓ En Mazo de Repaso" : "+ Agregar a Repaso"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Practice Exercises Cards */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-slate-800" />
                <h3 className="text-lg font-bold text-slate-900">Práctica Activa</h3>
              </div>
              <div className="space-y-4">
                {generatedNotebook.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={{
                      id: exercise.id,
                      type: exercise.type === "translate_to_english" ? "translation" : exercise.type === "correct_the_mistake" ? "correction" : "active-recall",
                      prompt: exercise.prompt,
                      expectedAnswer: exercise.expectedAnswer,
                      feedback: exercise.feedback,
                    }}
                    notebookTitle={generatedNotebook.title}
                    domain={generatedNotebook.domain}
                    level={generatedNotebook.level}
                  />
                ))}
              </div>

              {/* Review Points */}
              <Card className="bg-slate-900 text-white border-none">
                <h4 className="font-bold text-sm text-slate-200">Recomendaciones del Pedagogo</h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  {generatedNotebook.reviewItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Preset Library Notebooks */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Biblioteca de Cuadernos</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {notebooks.map((notebook) => (
            <NotebookCard key={notebook.id} notebook={notebook} />
          ))}
        </div>
      </div>
    </div>
  );
}
