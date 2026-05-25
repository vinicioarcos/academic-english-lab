"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ExerciseCard } from "@/components/practice/ExerciseCard";
import { useAuth } from "@/lib/AuthContext";
import { saveReviewItem, ReviewItem } from "@/lib/spaced-repetition";
import {
  FileText,
  Sparkles,
  BookOpen,
  SpellCheck,
  Brain,
  Mic,
  Plus,
  Loader2,
  CheckCircle2,
  ArrowRight,
  BookMarked
} from "lucide-react";
import { ImportedContent } from "@/lib/ai-schemas";

export default function ImporterPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form states
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<"Spanish" | "English" | "Mixed">("Spanish");
  const [domain, setDomain] = useState("Econometrics");
  const [level, setLevel] = useState("B2-C1");

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImportedContent, setActiveImportedContent] = useState<ImportedContent | null>(null);

  // UI Active Tab
  const [activeTab, setActiveTab] = useState<"summary" | "vocab" | "grammar" | "phrases" | "exercises" | "speaking">("summary");

  // SRS addition status tracking
  const [addedVocabs, setAddedVocabs] = useState<Record<string, boolean>>({});
  const [addedPhrases, setAddedPhrases] = useState<Record<string, boolean>>({});
  const [addedGrammar, setAddedGrammar] = useState<Record<string, boolean>>({});
  const [addedSpeaking, setAddedSpeaking] = useState<Record<string, boolean>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 20) {
      setError("El contenido a importar debe tener al menos 20 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setActiveImportedContent(null);
    setAddedVocabs({});
    setAddedPhrases({});
    setAddedGrammar({});
    setAddedSpeaking({});

    try {
      const res = await fetch("/api/import-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          language,
          domain,
          level,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ? JSON.stringify(data.error) : "Error al procesar el contenido.");
      }

      setActiveImportedContent(data.importedContent);
      setActiveTab("summary");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al intentar importar y estructurar tu contenido.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVocabToSRS = async (vocab: { word: string; translation: string; definition: string; example: string }) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-vocab-import-${vocab.word}`;
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
      notebook_title: `Import: ${activeImportedContent?.detectedTopic || "Contenido Importado"}`,
      domain: domain,
      level: level.split("-")[1] || "B2",
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedVocabs(prev => ({ ...prev, [vocab.word]: true }));
  };

  const handleAddPhraseToSRS = async (phrase: string) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-phrase-import-${phrase.replace(/\s+/g, '-').toLowerCase()}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "phrase",
      item_id: phrase,
      prompt: `Expresión académica: "${phrase}"`,
      answer_hint: `Uso bilingüe en ${domain}.`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "ai_notebook",
      source_id: phrase,
      notebook_title: `Import: ${activeImportedContent?.detectedTopic || "Contenido Importado"}`,
      domain: domain,
      level: level.split("-")[1] || "B2",
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedPhrases(prev => ({ ...prev, [phrase]: true }));
  };

  const handleAddGrammarToSRS = async (gNote: { title: string; explanation: string; rule: string; examples: string[] }) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-grammar-import-${gNote.title.replace(/\s+/g, '-').toLowerCase()}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "grammar",
      item_id: gNote.title,
      prompt: `Gramática: ${gNote.title}`,
      answer_hint: `${gNote.explanation}\n\nRegla: ${gNote.rule}\n\nEjemplos:\n${gNote.examples.join("\n")}`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "ai_notebook",
      source_id: gNote.title,
      notebook_title: `Import: ${activeImportedContent?.detectedTopic || "Contenido Importado"}`,
      domain: domain,
      level: level.split("-")[1] || "B2",
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedGrammar(prev => ({ ...prev, [gNote.title]: true }));
  };

  const handleAddSpeakingToSRS = async (sp: { prompt: string; translation: string; context: string }) => {
    const timestamp = new Date().toISOString();
    const id = `local-review-speaking-import-${sp.prompt.replace(/\s+/g, '-').toLowerCase()}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "phrase",
      item_id: sp.prompt,
      prompt: `Speaking Prompt: "${sp.prompt}"`,
      answer_hint: `Traducción: ${sp.translation}\n\nContexto: ${sp.context}`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "ai_notebook",
      source_id: sp.prompt,
      notebook_title: `Import: ${activeImportedContent?.detectedTopic || "Contenido Importado"}`,
      domain: domain,
      level: level.split("-")[1] || "B2",
    };
    await saveReviewItem(reviewItem, user?.id);
    setAddedSpeaking(prev => ({ ...prev, [sp.prompt]: true }));
  };

  const handleGenerateNotebook = () => {
    if (!activeImportedContent) return;

    // Convert ImportedContent to transient AINotebook schema format
    const notebookData = {
      title: `Imported: ${activeImportedContent.detectedTopic}`,
      description: activeImportedContent.academicSummary.slice(0, 160) + "...",
      level: level,
      domain: domain,
      theoryBlocks: activeImportedContent.grammarNotes.map(
        gn => `### ${gn.title}\n\n${gn.explanation}\n\n**Regla:** ${gn.rule}\n\n**Ejemplos:**\n${gn.examples.map(e => `- ${e}`).join("\n")}${gn.commonMistake ? `\n\n**Error común:** ${gn.commonMistake}` : ""}`
      ),
      vocabularyItems: activeImportedContent.vocabularyItems,
      phraseBank: activeImportedContent.phraseBank,
      exercises: activeImportedContent.exercises,
      reviewItems: activeImportedContent.suggestedReviewItems,
    };

    localStorage.setItem("academic-english-lab-imported-notebook", JSON.stringify(notebookData));
    router.push("/notebooks");
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <SectionHeader
        title="Importador de Contenido"
        description="Transforma notas, apuntes de clase o abstracts de economía en cuadernos y materiales interactivos con IA."
      />

      <div className="grid gap-8 lg:grid-cols-5 items-start">
        {/* Left Column: paste input & settings form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" fill="currentColor" />
              Entrada de Contenido
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contenido de Texto (Notas/Papers)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pega apuntes en español, papers en inglés o extractos de políticas públicas aquí..."
                  rows={8}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Idioma Original
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Spanish">Español</option>
                    <option value="English">Inglés</option>
                    <option value="Mixed">Mixto (Spanglish)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nivel Objetivo
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="A2-B1">A2 - B1 (Intermedio)</option>
                    <option value="B1-B2">B1 - B2 (Intermedio Alto)</option>
                    <option value="B2-C1">B2 - C1 (Avanzado Académico)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Dominio Académico
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Econometrics">Econometría y Modelos</option>
                  <option value="Academic Writing">Escritura de Papers / Abstracts</option>
                  <option value="Classroom English">Clases y Docencia Universitaria</option>
                  <option value="Public Policy">Políticas Públicas y Evaluación de Impacto</option>
                  <option value="Research Presentation">Presentaciones y Conferencias</option>
                  <option value="Data Science">Ciencia de Datos y Programación</option>
                </select>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-[11px] text-red-600 font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-amber-400" />
                    Procesando materiales...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-400" fill="currentColor" />
                    Generar materiales didácticos
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column: Displaying Generated Outputs */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <LoadingState message="La IA está analizando y estructurando tu contenido académico... Esto puede tomar unos segundos." />
          ) : !activeImportedContent ? (
            <EmptyState
              title="Ningún contenido procesado"
              description="Pega tus notas o apuntes y presiona el botón para transformarlos en una estructura didáctica completa con Inteligencia Artificial."
              icon={FileText}
            />
          ) : (
            <Card className="border-slate-300 shadow-md p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
                <div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                    TEMA DETECTADO
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {activeImportedContent.detectedTopic}
                  </h2>
                </div>

                <button
                  onClick={handleGenerateNotebook}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm"
                >
                  <BookMarked size={14} className="text-amber-400" />
                  Abrir como Cuaderno
                </button>
              </div>

              {/* Sub navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2">
                {[
                  { id: "summary", label: "Resumen", icon: FileText },
                  { id: "vocab", label: "Vocabulario", icon: BookOpen },
                  { id: "grammar", label: "Gramática", icon: SpellCheck },
                  { id: "phrases", label: "Expresiones", icon: Brain },
                  { id: "exercises", label: "Ejercicios", icon: CheckCircle2 },
                  { id: "speaking", label: "Habla", icon: Mic }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <Icon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Rendering */}
              <div className="pt-2">
                {/* 1. Summary */}
                {activeTab === "summary" && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                      {activeImportedContent.academicSummary}
                    </p>
                    <div className="rounded-2xl bg-amber-50/50 border border-amber-100/50 p-4 space-y-2">
                      <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Puntos Clave para Repaso</h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                        {activeImportedContent.suggestedReviewItems.map((item, idx) => (
                          <li key={idx} className="leading-relaxed italic">“{item}”</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 2. Vocabulary */}
                {activeTab === "vocab" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {activeImportedContent.vocabularyItems.map((vocab, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-150 p-4 flex flex-col justify-between space-y-3 bg-white">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-sm">
                              {vocab.word} <span className="text-xs text-slate-400 font-normal">({vocab.translation})</span>
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Def: {vocab.definition}</p>
                            <p className="text-[11px] text-emerald-800 italic leading-relaxed pt-1">
                              Ex: "{vocab.example}"
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddVocabToSRS(vocab)}
                            disabled={addedVocabs[vocab.word]}
                            className={`w-full rounded-xl py-2 text-xs font-bold border transition ${
                              addedVocabs[vocab.word]
                                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {addedVocabs[vocab.word] ? "✓ En Mazo de Repaso" : "+ Agregar a Repaso"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Grammar */}
                {activeTab === "grammar" && (
                  <div className="space-y-4">
                    {activeImportedContent.grammarNotes.map((gNote, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-150 p-5 space-y-4 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h3 className="font-bold text-slate-900 text-sm">{gNote.title}</h3>
                          <button
                            onClick={() => handleAddGrammarToSRS(gNote)}
                            disabled={addedGrammar[gNote.title]}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition ${
                              addedGrammar[gNote.title]
                                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {addedGrammar[gNote.title] ? "✓ En Repaso" : "+ Agregar a Repaso"}
                          </button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <p className="text-slate-600 leading-relaxed font-semibold">{gNote.explanation}</p>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-700">
                            <strong>Fórmula/Regla:</strong> {gNote.rule}
                          </div>
                          <div className="space-y-1">
                            <strong className="text-[10px] text-slate-500 uppercase font-bold">Ejemplos Académicos:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-700 italic">
                              {gNote.examples.map((ex, exIdx) => (
                                <li key={exIdx}>"{ex}"</li>
                              ))}
                            </ul>
                          </div>
                          {gNote.commonMistake && (
                            <p className="text-red-600 font-semibold pt-1">
                              <strong>Error Común:</strong> {gNote.commonMistake}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Phrase Bank */}
                {activeTab === "phrases" && (
                  <div className="space-y-3 bg-white rounded-2xl border border-slate-100 p-4">
                    {activeImportedContent.phraseBank.map((phrase, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                        <p className="italic font-medium text-slate-800 text-xs flex-1">
                          “{phrase}”
                        </p>
                        <button
                          onClick={() => handleAddPhraseToSRS(phrase)}
                          disabled={addedPhrases[phrase]}
                          className={`rounded-xl px-3 py-1.5 text-[10px] font-bold border transition shrink-0 ${
                            addedPhrases[phrase]
                              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {addedPhrases[phrase] ? "✓ Repaso" : "+ SRS"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Exercises */}
                {activeTab === "exercises" && (
                  <div className="space-y-6 pt-2">
                    {activeImportedContent.exercises.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={{
                          id: exercise.id,
                          type: exercise.type === "translate_to_english" ? "translation" : exercise.type === "correct_the_mistake" ? "correction" : "active-recall",
                          prompt: exercise.prompt,
                          expectedAnswer: exercise.expectedAnswer,
                          feedback: exercise.feedback,
                        }}
                        notebookTitle={`Import: ${activeImportedContent.detectedTopic}`}
                        domain={domain}
                        level={level.split("-")[1] || "B2"}
                      />
                    ))}
                  </div>
                )}

                {/* 6. Speaking prompts */}
                {activeTab === "speaking" && (
                  <div className="space-y-4">
                    {activeImportedContent.suggestedSpeakingPrompts.map((sp, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-150 p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                              PROMPT {idx + 1}
                            </span>
                            <p className="text-xs font-bold text-slate-900 pt-1 leading-relaxed">
                              {sp.prompt}
                            </p>
                            <p className="text-[11px] text-slate-500 font-semibold">
                              Traducción: {sp.translation}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                              Contexto: {sp.context}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddSpeakingToSRS(sp)}
                            disabled={addedSpeaking[sp.prompt]}
                            className={`rounded-xl px-3 py-1.5 text-[10px] font-bold border transition shrink-0 ${
                              addedSpeaking[sp.prompt]
                                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {addedSpeaking[sp.prompt] ? "✓ Repaso" : "+ SRS"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
