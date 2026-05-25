"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgressBadge } from "@/components/ui/ProgressBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/AuthContext";
import { saveSpeakingAttempt, getSpeakingAttempts, SpeakingAttempt, saveSpeakingFeedback, getSpeakingFeedbackList, PersistedSpeakingFeedback } from "@/lib/persistence";
import { saveReviewItem, getUserReviews, ReviewItem } from "@/lib/spaced-repetition";
import { SpeakingFeedback } from "@/lib/ai-schemas";
import { Mic, Square, Play, Trash2, Save, Sparkles, AlertCircle, Calendar, Star, BookOpen, Volume2, Plus, Info } from "lucide-react";

// Predefined academic speaking prompts by category
const SPEAKING_PROMPTS = [
  {
    id: "sp1",
    category: "Econometrics",
    prompt: "Explain this econometric strategy: 'We estimate the model using Ordinary Least Squares, controlling for individual fixed effects.'",
    translation: "Explica esta estrategia econométrica: 'Estimamos el modelo usando Mínimos Cuadrados Ordinarios, controlando por efectos fijos individuales.'",
    context: "Úsalo para justificar tu especificación ante preguntas sobre sesgo de variables omitidas."
  },
  {
    id: "sp2",
    category: "Econometrics",
    prompt: "Present this result: 'The coefficient is statistically significant at the one percent level, which rejects the null hypothesis.'",
    translation: "Presenta este resultado: 'El coeficiente es estadísticamente significativo al nivel del uno por ciento, lo cual rechaza la hipótesis nula.'",
    context: "Práctica del fraseo estándar para reportar significancia estadística rigurosa."
  },
  {
    id: "sp3",
    category: "Classroom English",
    prompt: "Opening lecture: 'Today we are going to explore the concept of market equilibrium. Let me start by outlining the main assumptions.'",
    translation: "Inicio de clase: 'Hoy vamos a explorar el concepto de equilibrio de mercado. Permítanme comenzar resumiendo los supuestos principales.'",
    context: "Excelente para transiciones y estructura de la presentación frente a estudiantes."
  },
  {
    id: "sp4",
    category: "Classroom English",
    prompt: "Interactive query: 'If you look at the board, you will see the demand curve shifting to the right. What could cause this shift?'",
    translation: "Pregunta interactiva: 'Si miran la pizarra, verán que la curva de demanda se desplaza a la derecha. ¿Qué podría causar este desplazamiento?'",
    context: "Fomenta la participación activa usando inglés de aula natural y fluido."
  },
  {
    id: "sp5",
    category: "Research Presentation",
    prompt: "Introductory hook: 'Our research aims to address the causal relationship between early childhood education and long-term earnings.'",
    translation: "Gancho introductorio: 'Nuestra investigación tiene como objetivo abordar la relación causal entre la educación de la primera infancia y los ingresos a largo plazo.'",
    context: "Útil para resumir el objetivo central de tu paper en un congreso."
  },
  {
    id: "sp6",
    category: "Research Presentation",
    prompt: "Referencing figures: 'To illustrate this point, let's examine the transition matrix shown in Table 4.'",
    translation: "Referenciar figuras: 'Para ilustrar este punto, examinemos la matriz de transición que se muestra en la Tabla 4.'",
    context: "Práctica verbal para guiar visualmente al auditorio durante las diapositivas."
  },
  {
    id: "sp7",
    category: "Conference Q&A",
    prompt: "Robustness reply: 'Thank you for that insightful question. We did run a robustness check using a different lag structure, and the results remained consistent.'",
    translation: "Respuesta sobre robustez: 'Gracias por esa pregunta tan perspicaz. Realizamos una prueba de robustez usando una estructura de rezagos diferente, y los resultados se mantuvieron consistentes.'",
    context: "Estructura defensiva y educada para responder preguntas difíciles de revisores."
  },
  {
    id: "sp8",
    category: "Conference Q&A",
    prompt: "Addressing endogeneity: 'That is an interesting point. While we cannot rule out endogeneity completely, our instrumental variable approach mitigates this concern.'",
    translation: "Abordar endogeneidad: 'Ese es un punto interesante. Si bien no podemos descartar la endogeneidad por completo, nuestro enfoque de variables instrumentales mitiga esta preocupación.'",
    context: "Frase diplomática clave para justificar limitaciones del diseño empírico."
  },
  {
    id: "sp9",
    category: "Academic Writing Oral Summary",
    prompt: "Abstract summary: 'In this paper, we document a persistent gap in wages across different sectors, even after controlling for education.'",
    translation: "Resumen del abstract: 'En este artículo, documentamos una brecha persistente en los salarios a través de diferentes sectores, incluso después de controlar por educación.'",
    context: "Práctica de elevator pitch para presentarse con colegas de investigación."
  },
  {
    id: "sp10",
    category: "Public Policy",
    prompt: "Policy prediction: 'The proposed carbon tax is expected to reduce emissions by fifteen percent over the next decade.'",
    translation: "Predicción de política: 'Se espera que el impuesto al carbono propuesto reduzca las emisiones en un quince por ciento durante la próxima década.'",
    context: "Forma pasiva académica ('is expected to') para detallar evaluaciones de impacto."
  },
  {
    id: "sp11",
    category: "Public Policy",
    prompt: "Evaluation strategy: 'We evaluate the impact of the cash transfer program using a randomized controlled trial design.'",
    translation: "Estrategia de evaluación: 'Evaluamos el impacto del programa de transferencia de efectivo utilizando un diseño de ensayo controlado aleatorizado.'",
    context: "Descripción verbal precisa del método econométrico de evaluación."
  }
];

const CATEGORIES = [
  "Classroom English",
  "Econometrics",
  "Research Presentation",
  "Conference Q&A",
  "Academic Writing Oral Summary",
  "Public Policy"
];

export default function SpeakingPracticePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Econometrics");
  const [selectedPrompt, setSelectedPrompt] = useState(SPEAKING_PROMPTS[0]);
  const [history, setHistory] = useState<SpeakingAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Recording states
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "recorded">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Self assessment states
  const [fluency, setFluency] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [vocabulary, setVocabulary] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sessionAttemptsCount, setSessionAttemptsCount] = useState(0);

  // SRS States
  const [srsAdded, setSrsAdded] = useState<Record<string, boolean>>({});

  // Speaking Feedback States
  const [userText, setUserText] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<SpeakingFeedback | null>(null);
  const [addedSRSItems, setAddedSRSItems] = useState<Record<string, boolean>>({});

  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Filter prompts by category
  const promptsForCategory = SPEAKING_PROMPTS.filter(p => p.category === selectedCategory);

  // Set first prompt when category changes
  useEffect(() => {
    if (promptsForCategory.length > 0) {
      setSelectedPrompt(promptsForCategory[0]);
      discardRecording();
    }
  }, [selectedCategory]);

  const loadHistory = async () => {
    try {
      const data = await getSpeakingAttempts(user?.id);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load speaking attempts history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  useEffect(() => {
    async function checkStatus() {
      if (!selectedPrompt) return;
      const reviews = await getUserReviews(user?.id);
      const exists = reviews.some(r => r.item_id === selectedPrompt.id && r.item_type === "phrase");
      setSrsAdded(prev => ({ ...prev, [selectedPrompt.id]: exists }));
    }
    checkStatus();
  }, [selectedPrompt?.id, user?.id]);


  // Handle browser audio recording
  const startRecording = async () => {
    setMicError(null);
    chunksRef.current = [];
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setRecordingState("recording");
    } catch (err: any) {
      console.error("Mic permission denied or error:", err);
      setMicError("No se pudo acceder al micrófono. Asegúrate de dar los permisos correspondientes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setRecordingState("recorded");
    }
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingState("idle");
    setSaveSuccess(false);
  };

  const handleSaveAttempt = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveSpeakingAttempt({
        prompt: selectedPrompt.prompt,
        category: selectedPrompt.category,
        selfRating: { fluency, clarity, confidence, vocabulary },
        notes: notes.trim(),
        audioUrl: audioUrl || undefined,
      }, user?.id);

      setSaveSuccess(true);
      setSessionAttemptsCount(prev => prev + 1);
      setNotes("");
      loadHistory();
    } catch (err) {
      console.error("Failed to save speaking practice attempt:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddToSRS = async () => {
    const timestamp = new Date().toISOString();
    const cleanId = `local-speaking-${selectedPrompt.id}`;
    const reviewItem: ReviewItem = {
      id: cleanId,
      item_type: "phrase",
      item_id: selectedPrompt.id,
      prompt: `Speaking Prompt (${selectedPrompt.category}): "${selectedPrompt.prompt}"`,
      answer_hint: `Traducción: ${selectedPrompt.translation}\n\nContexto: ${selectedPrompt.context}`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "phrase_bank",
      source_id: selectedPrompt.id,
      domain: selectedPrompt.category,
      level: "Advanced",
    };

    await saveReviewItem(reviewItem, user?.id);
    setSrsAdded(prev => ({ ...prev, [selectedPrompt.id]: true }));
  };

  const handleGetFeedback = async () => {
    if (!userText.trim()) return;
    setLoadingFeedback(true);
    setFeedbackError(null);
    try {
      const res = await fetch("/api/speaking-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selectedPrompt.prompt,
          category: selectedPrompt.category,
          userText,
          level: "C1",
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ? JSON.stringify(data.error) : "Error al obtener feedback.");
      }
      setActiveFeedback(data.feedback);
      
      await saveSpeakingFeedback({
        prompt: selectedPrompt.prompt,
        category: selectedPrompt.category,
        userText,
        correctedVersion: data.feedback.correctedVersion,
        academicVersion: data.feedback.academicVersion,
        grammarIssues: data.feedback.grammarIssues,
        vocabularySuggestions: data.feedback.vocabularySuggestions,
        strongerAcademicPhrases: data.feedback.strongerAcademicPhrases,
        suggestedReviewItems: data.feedback.suggestedReviewItems,
        overallFeedback: data.feedback.overallFeedback,
        nextPracticePrompt: data.feedback.nextPracticePrompt,
      }, user?.id);
    } catch (err: any) {
      console.error(err);
      setFeedbackError(err.message || "No se pudo obtener el feedback de la IA.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleAddSuggestionToSRS = async (item: {
    type: "vocabulary" | "phrase";
    prompt: string;
    answerHint: string;
    itemId: string;
  }) => {
    const timestamp = new Date().toISOString();
    const cleanId = `local-feedback-${item.type}-${item.itemId.replace(/\s+/g, '-').toLowerCase()}`;
    const reviewItem: ReviewItem = {
      id: cleanId,
      item_type: item.type,
      item_id: item.itemId,
      prompt: item.prompt,
      answer_hint: item.answerHint,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: item.type === "vocabulary" ? "vocabulary" : "phrase_bank",
      source_id: item.itemId,
      domain: selectedPrompt.category,
      level: "Advanced",
    };

    await saveReviewItem(reviewItem, user?.id);
    setAddedSRSItems(prev => ({ ...prev, [item.itemId]: true }));
  };

  const calculateOverallRating = (attempt: SpeakingAttempt) => {
    const r = attempt.self_rating;
    if (!r) return 0;
    return parseFloat(((r.fluency + r.clarity + r.confidence + r.vocabulary) / 4).toFixed(1));
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <SectionHeader
        title="Expresión Oral y Pronunciación"
        description="Practica tu discurso en inglés académico. Graba tu voz, escúchate, califica tu desempeño y guarda notas detalladas de mejora."
        action={
          <ProgressBadge
            value={sessionAttemptsCount}
            max={3}
            label="Grabaciones hoy"
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Recording and Prompt Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-300 shadow-md">
            {/* Category Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 border-b border-slate-100">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                    selectedCategory === cat
                      ? "bg-slate-950 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prompt Selector Dropdown or List */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Selecciona una frase o prompt académico para practicar:
                </label>
                <select
                  value={selectedPrompt.id}
                  onChange={(e) => {
                    const prompt = SPEAKING_PROMPTS.find(p => p.id === e.target.value);
                    if (prompt) setSelectedPrompt(prompt);
                    discardRecording();
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500 bg-white"
                >
                  {promptsForCategory.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.prompt.length > 80 ? p.prompt.substring(0, 80) + "..." : p.prompt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt display */}
              <div className="rounded-3xl bg-slate-950 p-6 text-white space-y-4 relative overflow-hidden shadow-lg border border-slate-800">
                <div className="absolute top-0 right-0 bg-slate-800 px-4 py-1.5 rounded-bl-3xl text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {selectedPrompt.category}
                </div>
                <div className="space-y-2 pr-12">
                  <div className="flex gap-2 text-amber-400 items-center">
                    <Volume2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Pronunciar en voz alta</span>
                  </div>
                  <p className="text-xl font-bold leading-snug">{selectedPrompt.prompt}</p>
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <p className="text-xs text-slate-400 italic font-medium">Traducción: {selectedPrompt.translation}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Info size={12} className="text-amber-400 shrink-0" />
                    <span>{selectedPrompt.context}</span>
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddToSRS}
                    disabled={srsAdded[selectedPrompt.id]}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                      srsAdded[selectedPrompt.id]
                        ? "bg-emerald-950 border-emerald-900 text-emerald-300 cursor-default"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {srsAdded[selectedPrompt.id] ? "✓ Agregado al Mazo" : "+ Agregar a Repaso (SRS)"}
                  </button>
                </div>
              </div>
            </div>

            {/* Microphone Recording controls */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-6">
              {micError && (
                <div className="w-full flex items-center gap-2 rounded-2xl bg-red-50 p-4 border border-red-100 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="font-semibold text-xs">{micError}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                {recordingState === "idle" && (
                  <button
                    onClick={startRecording}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition shadow-lg relative group"
                  >
                    <Mic size={28} />
                    <span className="absolute -bottom-8 scale-0 group-hover:scale-100 text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded text-white transition whitespace-nowrap">Grabar voz</span>
                  </button>
                )}

                {recordingState === "recording" && (
                  <button
                    onClick={stopRecording}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white hover:bg-slate-900 active:scale-95 transition shadow-lg animate-pulse relative group"
                  >
                    <Square size={24} />
                    <span className="absolute -bottom-8 scale-0 group-hover:scale-100 text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded text-white transition whitespace-nowrap">Detener grabación</span>
                  </button>
                )}

                {recordingState === "recorded" && (
                  <div className="flex gap-4">
                    <button
                      onClick={discardRecording}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition shadow-sm relative group"
                    >
                      <Trash2 size={20} />
                      <span className="absolute -bottom-8 scale-0 group-hover:scale-100 text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded text-white transition whitespace-nowrap">Descartar</span>
                    </button>
                    <button
                      onClick={startRecording}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 border border-red-200 text-red-700 hover:bg-red-200 transition shadow-sm relative group"
                    >
                      <Mic size={20} />
                      <span className="absolute -bottom-8 scale-0 group-hover:scale-100 text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded text-white transition whitespace-nowrap">Grabar de nuevo</span>
                    </button>
                  </div>
                )}
              </div>

              {recordingState === "recording" && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Grabando Audio...
                </div>
              )}

              {audioUrl && (
                <div className="w-full max-w-md rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escuchar Grabación:</p>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
            </div>
          </Card>

          {/* User Written Text (Optional for AI Feedback) */}
          {recordingState === "recorded" && (
            <Card className="border-slate-300 shadow-md space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="rounded-xl bg-slate-900 p-1.5 text-white">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Feedback de Escritura Académica y Estilo</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Para recibir feedback de la IA, escribe a continuación lo que intentaste decir, tu propia transcripción o el texto resumido de tu discurso:
                </p>
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Escribe aquí tu discurso o frase en inglés..."
                  className="min-h-24 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-slate-500 bg-slate-50 focus:bg-white transition"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleGetFeedback}
                    disabled={loadingFeedback || !userText.trim()}
                    className="rounded-2xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {loadingFeedback ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Analizando texto...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-400" />
                        Obtener feedback académico
                      </>
                    )}
                  </button>
                  {activeFeedback && (
                    <button
                      onClick={() => {
                        setUserText("");
                        setActiveFeedback(null);
                        setAddedSRSItems({});
                      }}
                      className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Limpiar Feedback
                    </button>
                  )}
                </div>
              </div>

              {feedbackError && (
                <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-xs text-red-700 font-medium">
                  {feedbackError}
                </div>
              )}
            </Card>
          )}

          {/* AI Feedback Results Card */}
          {activeFeedback && (
            <Card className="border-slate-300 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-slate-950 p-1.5 text-white">
                    <Sparkles size={16} className="text-amber-400" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Feedback de la IA</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Análisis en tiempo real de tu discurso.</p>
                  </div>
                </div>
              </div>

              {/* Overall Feedback */}
              <div className="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Evaluación General</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">“{activeFeedback.overallFeedback}”</p>
              </div>

              {/* Version Comparison */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100">VERSIÓN CORREGIDA</span>
                    <p className="text-xs text-slate-700 pt-1 leading-relaxed">“{activeFeedback.correctedVersion}”</p>
                  </div>
                  <button
                    onClick={() => handleAddSuggestionToSRS({
                      type: "phrase",
                      itemId: `corrected-${selectedPrompt.id}`,
                      prompt: `Expresión corregida: "${activeFeedback.correctedVersion}"`,
                      answerHint: `Original: "${userText}"`,
                    })}
                    disabled={addedSRSItems[`corrected-${selectedPrompt.id}`]}
                    className={`mt-2 w-full rounded-xl py-1.5 text-[10px] font-bold border transition ${
                      addedSRSItems[`corrected-${selectedPrompt.id}`]
                        ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {addedSRSItems[`corrected-${selectedPrompt.id}`] ? "✓ Agregada al Mazo" : "+ Agregar Frase Corregida"}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">VERSIÓN ACADÉMICA SUGERIDA</span>
                    <p className="text-xs text-slate-700 pt-1 leading-relaxed font-semibold">“{activeFeedback.academicVersion}”</p>
                  </div>
                  <button
                    onClick={() => handleAddSuggestionToSRS({
                      type: "phrase",
                      itemId: `academic-${selectedPrompt.id}`,
                      prompt: `Expresión académica sugerida: "${activeFeedback.academicVersion}"`,
                      answerHint: `Original: "${userText}"`,
                    })}
                    disabled={addedSRSItems[`academic-${selectedPrompt.id}`]}
                    className={`mt-2 w-full rounded-xl py-1.5 text-[10px] font-bold border transition ${
                      addedSRSItems[`academic-${selectedPrompt.id}`]
                        ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {addedSRSItems[`academic-${selectedPrompt.id}`] ? "✓ Agregada al Mazo" : "+ Agregar Frase Académica"}
                  </button>
                </div>
              </div>

              {/* Grammar Issues */}
              {activeFeedback.grammarIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Puntos de Gramática a Corregir</h4>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                    {activeFeedback.grammarIssues.map((issue, idx) => (
                      <li key={idx} className="leading-relaxed">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vocabulary Suggestions */}
              {activeFeedback.vocabularySuggestions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Sugerencias de Léxico Avanzado</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeFeedback.vocabularySuggestions.map((vocab, idx) => {
                      return (
                        <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {vocab.word} <span className="text-[10px] text-slate-400 font-normal">({vocab.translation})</span>
                            </p>
                            <p className="text-xs text-emerald-700 font-semibold mt-1">Sugerencia: {vocab.suggestion}</p>
                          </div>
                          <button
                            onClick={() => handleAddSuggestionToSRS({
                              type: "vocabulary",
                              itemId: vocab.suggestion,
                              prompt: `Vocabulario académico: "${vocab.suggestion}" (en reemplazo de "${vocab.word}")`,
                              answerHint: `Traducción: ${vocab.translation}`,
                            })}
                            disabled={addedSRSItems[vocab.suggestion]}
                            className={`mt-2 w-full rounded-lg py-1 text-[9px] font-bold border transition ${
                              addedSRSItems[vocab.suggestion]
                                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {addedSRSItems[vocab.suggestion] ? "✓ Agregado" : "+ Agregar Vocabulario"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stronger Academic Phrases */}
              {activeFeedback.strongerAcademicPhrases.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alternativas Académicas Fuertes</h4>
                  <div className="space-y-2 text-xs">
                    {activeFeedback.strongerAcademicPhrases.map((phrase, idx) => {
                      const phraseId = `alternative-${idx}-${selectedPrompt.id}`;
                      return (
                        <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-b-0">
                          <p className="italic font-medium text-slate-700 flex-1 leading-normal">“{phrase}”</p>
                          <button
                            onClick={() => handleAddSuggestionToSRS({
                              type: "phrase",
                              itemId: phraseId,
                              prompt: `Frase alternativa en conferencias: "${phrase}"`,
                              answerHint: `Tema: ${selectedPrompt.category} · Relacionado con: "${selectedPrompt.prompt}"`,
                            })}
                            disabled={addedSRSItems[phraseId]}
                            className={`rounded-lg px-2.5 py-1 text-[9px] font-bold border transition shrink-0 ${
                              addedSRSItems[phraseId]
                                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {addedSRSItems[phraseId] ? "✓ SRS" : "+ SRS"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Pronunciation Tips */}
              {activeFeedback.pronunciationTipsGeneral.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tips de Pronunciación</h4>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                    {activeFeedback.pronunciationTipsGeneral.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Practice Prompt */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5">
                <span className="rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 px-2 py-0.5 uppercase tracking-wider">
                  SIGUIENTE RECOMENDACIÓN
                </span>
                <p className="text-xs font-bold">{activeFeedback.nextPracticePrompt}</p>
                <button
                  onClick={() => {
                    const newPrompt = {
                      id: `sp-next-${Date.now()}`,
                      category: selectedPrompt.category,
                      prompt: activeFeedback.nextPracticePrompt,
                      translation: "Prompt dinámico recomendado por la IA.",
                      context: "Continúa tu hilo de práctica anterior con este prompt relacionado."
                    };
                    setSelectedPrompt(newPrompt);
                    discardRecording();
                    setUserText("");
                    setActiveFeedback(null);
                    setAddedSRSItems({});
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  <Plus size={12} /> Usar este prompt para practicar
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Self Assessment & Save Form */}
        <div className="space-y-6">
          <Card className="border-slate-300 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
              <div className="rounded-xl bg-slate-900 p-1.5 text-white">
                <Star size={16} fill="white" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Autoevaluación</h3>
            </div>

            {recordingState !== "recorded" ? (
              <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-3">
                <Mic size={36} className="text-slate-300 animate-pulse" />
                <p className="text-xs font-medium max-w-[180px]">Graba tu voz para activar la autoevaluación académica.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Fluency Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Fluidez (Fluency)</span>
                    <span className="font-bold text-slate-900">{fluency} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={fluency}
                    onChange={(e) => setFluency(parseInt(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Lento / Pausado</span>
                    <span>Fluido / Sin pausas</span>
                  </div>
                </div>

                {/* Clarity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Claridad de Voz</span>
                    <span className="font-bold text-slate-900">{clarity} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={clarity}
                    onChange={(e) => setClarity(parseInt(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Difícil entender</span>
                    <span>Perfecta articulación</span>
                  </div>
                </div>

                {/* Confidence Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Confianza (Confidence)</span>
                    <span className="font-bold text-slate-900">{confidence} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Inseguro / Tembloroso</span>
                    <span>Firme / Profesional</span>
                  </div>
                </div>

                {/* Vocabulary Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Vocabulario Académico</span>
                    <span className="font-bold text-slate-900">{vocabulary} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={vocabulary}
                    onChange={(e) => setVocabulary(parseInt(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Uso genérico</span>
                    <span>Términos avanzados</span>
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Notas de mejora o dificultades:</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Olvidé pronunciar bien el término 'statistically'. Debo reducir las pausas al explicar el estimador..."
                    className="min-h-20 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-slate-500 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                {/* Save Attempt Button */}
                <div className="space-y-2">
                  <button
                    onClick={handleSaveAttempt}
                    disabled={saving}
                    className="w-full rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Guardando..." : "Guardar Práctica"}
                  </button>

                  {saveSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                      ✓ ¡Intento guardado correctamente!
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* History section */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Historial de Expresión Oral</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {history.length} intentos registrados
          </span>
        </div>

        {loadingHistory ? (
          <LoadingState message="Cargando historial de grabaciones..." />
        ) : history.length === 0 ? (
          <EmptyState
            title="Sin grabaciones previas"
            description="Cuando guardes un intento de autoevaluación oral, aparecerá en esta lista con tus detalles y notas de voz."
            icon={Mic}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((attempt) => (
              <Card key={attempt.id} className="flex flex-col justify-between border-slate-200/80 shadow-sm relative">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                      {attempt.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(attempt.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800 italic">"{attempt.prompt}"</p>

                  {/* Rating indicator */}
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500">
                    <div>Fluidez: <span className="font-bold text-slate-800">{attempt.self_rating.fluency}/5</span></div>
                    <div>Claridad: <span className="font-bold text-slate-800">{attempt.self_rating.clarity}/5</span></div>
                    <div>Confianza: <span className="font-bold text-slate-800">{attempt.self_rating.confidence}/5</span></div>
                    <div>Vocabulario: <span className="font-bold text-slate-800">{attempt.self_rating.vocabulary}/5</span></div>
                  </div>

                  {attempt.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 italic">
                      <span className="font-bold text-slate-700 not-italic block mb-0.5">Notas de mejora:</span>
                      "{attempt.notes}"
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Promedio: <span className="bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[10px] ml-1">{calculateOverallRating(attempt)} / 5</span>
                  </span>
                  {attempt.audio_url && (
                    <audio src={attempt.audio_url} controls className="h-6 w-32 accent-slate-900" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
