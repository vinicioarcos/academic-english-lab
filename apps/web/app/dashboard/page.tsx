"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingHint } from "@/components/ui/OnboardingHint";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { getUserStats, getUserErrors, markErrorAsResolved, UserError, getSpeakingAttempts, SpeakingAttempt, getSpeakingFeedbackList, PersistedSpeakingFeedback } from "@/lib/persistence";
import { getSpacedRepetitionStats, getUserReviews, ReviewItem } from "@/lib/spaced-repetition";
import { AlertCircle, CheckCircle, Sparkles, LayoutGrid, Mic, Star, Award, Clock, Play, ArrowRight } from "lucide-react";
import { vocabularyItems, books } from "@/lib/data";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [errors, setErrors] = useState<UserError[]>([]);
  const [srStats, setSrStats] = useState({ due: 0, upcoming: 0, learning: 0, mastered: 0, forgotten: 0, review: 0, total: 0 });
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [speakingAttempts, setSpeakingAttempts] = useState<SpeakingAttempt[]>([]);
  const [speakingFeedbackList, setSpeakingFeedbackList] = useState<PersistedSpeakingFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const notebooksCount = books.reduce((acc, book) => acc + book.notebooks.length, 0);
  const vocabularyCount = vocabularyItems.length;

  const loadData = useCallback(async () => {
    try {
      const userStats = await getUserStats(user?.id);
      const userErrors = await getUserErrors(user?.id);
      const sRepStats = await getSpacedRepetitionStats(user?.id);
      const reviews = await getUserReviews(user?.id);
      const speakingData = await getSpeakingAttempts(user?.id);
      const feedbackData = await getSpeakingFeedbackList(user?.id);
      setStats(userStats);
      setErrors(userErrors);
      setSrStats(sRepStats);
      setAllReviews(reviews);
      setSpeakingAttempts(speakingData);
      setSpeakingFeedbackList(feedbackData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolve = async (errorId: string) => {
    await markErrorAsResolved(errorId, user?.id);
    loadData();
  };

  const successRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const pendingMistakes = errors.filter(e => e.retry_status === "pendiente").length;

  // 1. Group review items by source type (with fallbacks for legacy items)
  const sourceCounts = allReviews.reduce((acc, item) => {
    const type = item.source_type || 
      (item.item_type === "vocabulary" ? "vocabulary" :
       item.item_type === "grammar" ? "grammar" :
       item.item_type === "phrase" ? "phrase_bank" : "exercise_error");
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {
    vocabulary: 0,
    grammar: 0,
    phrase_bank: 0,
    theory_block: 0,
    exercise_error: 0,
    ai_notebook: 0
  } as Record<string, number>);

  // 2. Count most common error types from Mistake Tracker
  const errorTypeCounts = errors.reduce((acc, err) => {
    acc[err.error_type] = (acc[err.error_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedErrorTypes = Object.entries(errorTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 3. Weakest domains analysis based on SRS review items difficulty
  const domainStats = allReviews.reduce((acc, item) => {
    const d = item.domain || "General";
    if (!acc[d]) {
      acc[d] = { total: 0, weak: 0, mastered: 0 };
    }
    acc[d].total += 1;
    if (item.state === "forgotten" || item.state === "learning" || item.state === "new") {
      acc[d].weak += 1;
    } else if (item.state === "mastered") {
      acc[d].mastered += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; weak: number; mastered: number }>);

  const sortedDomains = Object.entries(domainStats)
    .map(([name, stat]) => ({
      name,
      ...stat,
      weakRatio: stat.total > 0 ? stat.weak / stat.total : 0
    }))
    .sort((a, b) => b.weak - a.weak); // Domains with most weak items come first

  // Speaking practice calculations
  const speakingCategoryStats = speakingAttempts.reduce((acc, attempt) => {
    const cat = attempt.category;
    const score = (attempt.self_rating.fluency + attempt.self_rating.clarity + attempt.self_rating.confidence + attempt.self_rating.vocabulary) / 4;
    if (!acc[cat]) {
      acc[cat] = { sum: 0, count: 0 };
    }
    acc[cat].sum += score;
    acc[cat].count += 1;
    return acc;
  }, {} as Record<string, { sum: number; count: number }>);

  let weakestSpeakingCategory = "Ninguno";
  let lowestAvgSpeaking = Infinity;
  Object.entries(speakingCategoryStats).forEach(([cat, data]) => {
    const avg = data.sum / data.count;
    if (avg < lowestAvgSpeaking) {
      lowestAvgSpeaking = avg;
      weakestSpeakingCategory = cat;
    }
  });

  const averageSpeakingSelfRating = speakingAttempts.length > 0
    ? (speakingAttempts.reduce((acc, a) => acc + (a.self_rating.fluency + a.self_rating.clarity + a.self_rating.confidence + a.self_rating.vocabulary) / 4, 0) / speakingAttempts.length).toFixed(1)
    : "N/A";

  // Speaking grammar feedback calculations
  const speakingGrammarIssueCounts = speakingFeedbackList.reduce((acc, fb) => {
    if (fb.grammar_issues && Array.isArray(fb.grammar_issues)) {
      fb.grammar_issues.forEach(issue => {
        acc[issue] = (acc[issue] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedSpeakingGrammarIssues = Object.entries(speakingGrammarIssueCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const mostCommonSpeakingGrammarIssue = sortedSpeakingGrammarIssues.length > 0
    ? sortedSpeakingGrammarIssues[0].name
    : "Ninguno detectado";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 font-semibold animate-pulse text-xs uppercase tracking-wider">Cargando progreso del laboratorio...</div>
      </div>
    );
  }

  // Determine dynamic recommendation
  let recPanel: {
    title: string;
    description: string;
    action: React.ReactNode;
    color: "slate" | "amber" | "indigo" | "emerald";
  } = {
    title: "Importa tu Primer Contenido",
    description: "Pega abstracts, notas de clases o artículos y crea tu primera lección personalizada de inglés académico.",
    action: (
      <Link href="/importer" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm whitespace-nowrap">
        Importar Contenido <ArrowRight size={14} />
      </Link>
    ),
    color: "slate"
  };

  if (srStats.due > 0) {
    recPanel = {
      title: "Repaso Diario Listo",
      description: "Tienes repasos pendientes hoy. Completa tu sesión de repetición espaciada para consolidar el vocabulario y gramática en tu memoria.",
      action: (
        <Link href="/practice" className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-650 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 bg-indigo-650 transition shadow-sm whitespace-nowrap">
          Iniciar Repaso <Play size={14} fill="white" />
        </Link>
      ),
      color: "indigo" as const
    };
  } else if (errors.some(e => e.retry_status === "pendiente")) {
    recPanel = {
      title: "Errores por Resolver",
      description: "Tienes errores pendientes en tu registro. Genera un cuaderno de repaso IA para resolverlos y afianzar las reglas.",
      action: (
        <Link href="/notebooks?reviewMistakes=true" className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm whitespace-nowrap">
          Generar Cuaderno <Sparkles size={14} className="text-amber-300" fill="currentColor" />
        </Link>
      ),
      color: "amber" as const
    };
  } else if (speakingAttempts.length === 0) {
    recPanel = {
      title: "Práctica Expresión Oral",
      description: "Aún no has grabado tu voz. Graba una respuesta corta para recibir retroalimentación académica instantánea de la IA.",
      action: (
        <Link href="/speaking" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
          Comenzar Práctica <Mic size={14} />
        </Link>
      ),
      color: "emerald" as const
    };
  } else if (speakingAttempts.length > 0 && speakingFeedbackList.length === 0) {
    recPanel = {
      title: "Obtén Feedback de IA",
      description: "Has completado prácticas orales pero aún no tienes análisis académicos. Escribe tu transcripción de voz para recibir feedback.",
      action: (
        <Link href="/speaking" className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm whitespace-nowrap">
          Obtener Feedback <Sparkles size={14} className="text-amber-300" fill="currentColor" />
        </Link>
      ),
      color: "emerald" as const
    };
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <SectionHeader
        title="Dashboard de Progreso"
        description="Analiza tus estadísticas de escritura y revisa tu registro de errores académicos."
      />

      {/* Recommended Action & Onboarding hints */}
      <div className="space-y-5">
        <ActionPanel
          title={recPanel.title}
          description={recPanel.description}
          action={recPanel.action}
          color={recPanel.color}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OnboardingHint
            title="1. Importación IA"
            message="Pega abstracts o papers de economía en el importador para crear lecciones instantáneas."
            stepNumber={1}
          />
          <OnboardingHint
            title="2. Práctica Activa"
            message="Completa ejercicios de redacción académica e identifica tus errores de estilo."
            stepNumber={2}
          />
          <OnboardingHint
            title="3. Expresión Oral"
            message="Graba tus respuestas y solicita feedback estructurado de IA sobre tu transcripción."
            stepNumber={3}
          />
          <OnboardingHint
            title="4. Repaso Diario"
            message="Usa el mazo SRS diariamente para retener términos avanzados a largo plazo."
            stepNumber={4}
          />
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Intentos Totales"
          value={stats.total}
          description="Frases practicadas en total."
          icon={Star}
          color="indigo"
        />
        <MetricCard
          title="Tasa de Acierto"
          value={`${successRate}%`}
          description={`${stats.correct} correctas de ${stats.total}.`}
          icon={Award}
          color="emerald"
        />
        <MetricCard
          title="Errores Pendientes"
          value={pendingMistakes}
          description="Esperando reintento."
          icon={AlertCircle}
          color="red"
        />
        <MetricCard
          title="Repasos Pendientes"
          value={srStats.due}
          description="Tarjetas para repasar hoy."
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Tarjetas Dominadas"
          value={srStats.mastered}
          description="Elementos memorizados."
          icon={CheckCircle}
          color="teal"
        />
      </div>

      {/* Speaking Practice Stats Grid */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-slate-800 p-2 text-amber-400">
              <Mic size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Métricas de Expresión Oral</h2>
              <p className="text-xs text-slate-400 font-semibold">Analiza tu desempeño en grabaciones y autoevaluaciones orales.</p>
            </div>
          </div>
          <Link
            href="/speaking"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition shadow-sm"
          >
            Practicar Expresión Oral
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Grabaciones Guardadas</p>
            <p className="text-2xl font-bold mt-1 text-slate-100">{speakingAttempts.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Intentos grabados.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Autocalificación Promedio</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">
              {averageSpeakingSelfRating} <span className="text-xs text-slate-400 font-normal">/ 5</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Fluidez, claridad, confianza, léxico.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Feedback de IA</p>
            <p className="text-2xl font-bold mt-1 text-teal-400">{speakingFeedbackList.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Análisis académicos.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gramática Oral Común</p>
            <p className="text-xs font-bold mt-3 truncate text-amber-300" title={mostCommonSpeakingGrammarIssue}>
              {mostCommonSpeakingGrammarIssue}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Error más frecuente.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Última Práctica</p>
            <p className="text-lg font-bold mt-2 truncate text-slate-100">
              {speakingAttempts.length > 0
                ? new Date(speakingAttempts[0].created_at).toLocaleDateString("es-ES")
                : "Sin registro"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Fecha de última grabación.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mayor Dificultad</p>
            <p className="text-xs font-bold mt-3 truncate text-red-400" title={weakestSpeakingCategory}>
              {weakestSpeakingCategory}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Menor promedio obtenido.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Mistake Tracker and Learning Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Mistake Tracker Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-amber-50/50 p-2 text-amber-700">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Mistake Tracker (Historial de Errores)</h2>
                  <p className="text-xs text-slate-500 font-semibold">Detector inteligente de errores gramaticales y estilo académico.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {srStats.due > 0 && (
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition shadow-sm whitespace-nowrap"
                  >
                    Repasar {srStats.due} pendientes
                  </Link>
                )}
                {errors.some((e) => e.retry_status === "pendiente") && (
                  <Link
                    href="/notebooks?reviewMistakes=true"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-sm whitespace-nowrap"
                  >
                    <Sparkles size={14} className="text-amber-400" fill="currentColor" />
                    Generar cuaderno de repaso
                  </Link>
                )}
              </div>
            </div>

            {errors.length === 0 ? (
              <EmptyState
                title="¡Sin errores acumulados!"
                description="Excelente trabajo. Cuando cometas un error en los ejercicios, aparecerá registrado aquí para que lo puedas revisar y reintentar de forma guiada."
                icon={CheckCircle}
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Pregunta / Ejercicio</th>
                      <th className="px-6 py-4">Tu Escritura</th>
                      <th className="px-6 py-4">Respuesta Esperada</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {errors.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate" title={err.prompt}>
                          {err.prompt}
                        </td>
                        <td className="px-6 py-4 text-red-600 italic font-mono text-xs max-w-xs truncate" title={err.user_answer}>
                          "{err.user_answer}"
                        </td>
                        <td className="px-6 py-4 text-emerald-700 font-medium max-w-xs truncate" title={err.expected_answer}>
                          {err.expected_answer}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 font-medium">
                            {err.error_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(err.date).toLocaleDateString("es-ES")} {new Date(err.date).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          {err.retry_status === "completado" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                              Resuelto
                            </span>
                          ) : (
                            <button
                              onClick={() => handleResolve(err.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100 hover:bg-amber-100 transition"
                              title="Marcar como resuelto"
                            >
                              Pendiente
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Learning Analytics Panel */}
        <div className="space-y-6">
          <Card className="border-slate-300 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="rounded-xl bg-slate-900 p-1.5 text-white">
                <LayoutGrid size={16} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Analíticas de Aprendizaje</h3>
            </div>
            
            {/* Source distribution */}
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Composición del Mazo (SRS)</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Vocabulario</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{sourceCounts.vocabulary}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Reglas de Gramática</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{sourceCounts.grammar}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Expresiones (Phrase Bank)</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{sourceCounts.phrase_bank}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Teoría Corta (IA)</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{sourceCounts.theory_block}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Errores de Ejercicios</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{sourceCounts.exercise_error}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Cuadernos de Repaso (IA)</span>
                    <span className="font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{sourceCounts.ai_notebook}</span>
                  </div>
                </div>
              </div>

              {/* Most common error types */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Errores Comunes por Tipo</h4>
                {sortedErrorTypes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay suficientes datos de errores acumulados.</p>
                ) : (
                  <div className="space-y-2.5">
                    {sortedErrorTypes.map(({ name, count }) => {
                      const percent = Math.min(100, Math.round((count / errors.length) * 100));
                      return (
                        <div key={name} className="space-y-1 text-xs">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-slate-600 uppercase tracking-wider">{name}</span>
                            <span className="font-bold text-slate-700">{count} errores ({percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Weakest domains */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Dominios con Mayor Dificultad</h4>
                {sortedDomains.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sin datos de dominios. Practica con tarjetas para generar análisis de dificultad.</p>
                ) : (
                  <div className="space-y-2.5">
                    {sortedDomains.slice(0, 3).map((domain) => {
                      const ratioPercent = Math.round(domain.weakRatio * 100);
                      return (
                        <div key={domain.name} className="space-y-1 text-xs">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-slate-600 font-bold">{domain.name}</span>
                            <span className="text-slate-500">{domain.weak} por repasar / {domain.total} total</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${ratioPercent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

