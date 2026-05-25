"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ExerciseCard } from "@/components/practice/ExerciseCard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewStateBadge } from "@/components/ui/ReviewStateBadge";
import { ProgressBadge } from "@/components/ui/ProgressBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { books } from "@/lib/data";
import { useAuth } from "@/lib/AuthContext";
import { getDueReviews, getSpacedRepetitionStats, getUserReviews, saveReviewItem, calculateSM2, ReviewItem } from "@/lib/spaced-repetition";
import { Calendar, CheckCircle2, ChevronRight, LayoutGrid, Brain, Play, Award, RotateCcw } from "lucide-react";

export default function PracticePage() {
  const { user } = useAuth();
  
  // Default static exercises mapped with metadata
  const exercisesWithMetadata = books.flatMap((book) =>
    book.notebooks.flatMap((notebook) =>
      notebook.exercises.map((exercise) => ({
        ...exercise,
        notebookTitle: notebook.title,
        domain: book.title,
        level: notebook.level,
      }))
    )
  );

  // Spaced Repetition States
  const [stats, setStats] = useState({ due: 0, upcoming: 0, learning: 0, mastered: 0, forgotten: 0, review: 0, total: 0 });
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [activeTab, setActiveTab] = useState<"session" | "deck">("session");
  const [deckFilter, setDeckFilter] = useState<"all" | "due" | "upcoming" | "mastered" | "forgotten">("all");
  
  // Daily review session flow states
  const [sessionState, setSessionState] = useState<"idle" | "active" | "summary">("idle");
  const [sessionCards, setSessionCards] = useState<ReviewItem[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionGrades, setSessionGrades] = useState<{ prompt: string; grade: 1 | 2 | 3 | 4; item_type: string }[]>([]);
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAttempt, setUserAttempt] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSRData = useCallback(async () => {
    try {
      const srStats = await getSpacedRepetitionStats(user?.id);
      const srDue = await getDueReviews(user?.id);
      const srAll = await getUserReviews(user?.id);
      setStats(srStats);
      setDueItems(srDue);
      setAllReviews(srAll);

      // Reset local session variables only if not actively reviewing
      if (sessionState === "idle") {
        setSessionCards(srDue);
        setSessionIndex(0);
        setSessionGrades([]);
      }
    } catch (err) {
      console.error("Error loading spaced repetition items:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, sessionState]);

  useEffect(() => {
    loadSRData();
  }, [loadSRData]);

  const startSession = () => {
    if (dueItems.length === 0) return;
    setSessionCards(dueItems);
    setSessionIndex(0);
    setSessionGrades([]);
    setSessionState("active");
    setShowAnswer(false);
    setUserAttempt("");
  };

  const handleGrade = async (grade: 1 | 2 | 3 | 4) => {
    const item = sessionCards[sessionIndex];
    if (!item) return;

    // Calculate SM-2 update
    const result = calculateSM2(grade, {
      ease_factor: item.ease_factor,
      success_streak: item.success_streak,
      interval_days: item.interval_days,
      review_count: item.review_count,
    });

    const updatedItem: ReviewItem = {
      ...item,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: result.nextReviewAt,
      interval_days: result.intervalDays,
      ease_factor: result.easeFactor,
      success_streak: result.successStreak,
      review_count: result.reviewCount,
      state: result.state,
    };

    await saveReviewItem(updatedItem, user?.id);

    // Track session stats
    setSessionGrades((prev) => [...prev, { prompt: item.prompt, grade, item_type: item.item_type }]);

    // Advance index or transition to summary
    if (sessionIndex + 1 < sessionCards.length) {
      setSessionIndex(sessionIndex + 1);
      setShowAnswer(false);
      setUserAttempt("");
    } else {
      setSessionState("summary");
    }
  };

  const finishSession = () => {
    setSessionState("idle");
    loadSRData();
  };

  const activeReviewItem = sessionCards[sessionIndex];
  const now = new Date();

  // Filters the full review deck list
  const filteredReviews = allReviews.filter((item) => {
    if (deckFilter === "due") {
      return new Date(item.next_review_at) <= now;
    }
    if (deckFilter === "upcoming") {
      return new Date(item.next_review_at) > now;
    }
    if (deckFilter === "mastered") {
      return item.state === "mastered";
    }
    if (deckFilter === "forgotten") {
      return item.state === "forgotten";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl">
        <SectionHeader
          title="Práctica Activa"
          description="Practica con ejercicios guiados o gestiona tu plan de repaso diario con repetición espaciada."
        />
        <LoadingState message="Cargando tu mazo y estadísticas..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <SectionHeader
        title="Práctica Activa"
        description="Practica con ejercicios guiados o gestiona tu plan de repaso diario con repetición espaciada."
      />

      {/* Spaced Repetition Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Review Session / Deck Manager */}
        <div className="md:col-span-2 space-y-6">
          {/* Tab buttons (Only visible when not actively in a review session to prevent distractions) */}
          {sessionState === "idle" && (
            <div className="flex gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("session")}
                className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition ${
                  activeTab === "session"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Sesión de Repaso ({dueItems.length})
              </button>
              <button
                onClick={() => setActiveTab("deck")}
                className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition ${
                  activeTab === "deck"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Mazo Completo ({allReviews.length})
              </button>
            </div>
          )}

          {activeTab === "session" ? (
            <div>
              {/* STATE 1: IDLE / START Daily Review Session */}
              {sessionState === "idle" && (
                dueItems.length > 0 ? (
                  <Card className="border-slate-300 shadow-md text-center py-10 px-6 space-y-6 flex flex-col justify-center min-h-[350px] bg-white">
                    <div className="mx-auto rounded-2xl bg-slate-950 p-3 text-white w-14 h-14 flex items-center justify-center shadow-md">
                      <Brain size={28} />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">Sesión de Repaso Diario</h3>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Tienes <span className="font-bold text-slate-900">{dueItems.length} tarjetas</span> pendientes por repasar hoy. Dedica unos minutos para afianzar tus conocimientos con repetición espaciada.
                      </p>
                    </div>

                    <button
                      onClick={startSession}
                      className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-3.5 text-sm font-bold text-white hover:bg-slate-900 active:scale-95 transition shadow-md"
                    >
                      <Play size={16} fill="white" />
                      Iniciar Repaso de Hoy
                    </button>

                    <div className="grid grid-cols-3 gap-4 pt-6 max-w-sm mx-auto border-t border-slate-100 text-xs">
                      <div>
                        <p className="text-slate-400 font-medium">Pendientes hoy</p>
                        <p className="font-bold text-red-600 text-lg">{dueItems.length}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Próximas</p>
                        <p className="font-bold text-slate-700 text-lg">{stats.upcoming}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Mazo total</p>
                        <p className="font-bold text-slate-800 text-lg">{stats.total}</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <EmptyState
                    title="¡Estás al día!"
                    description="No tienes repasos pendientes para hoy. Sigue practicando en la biblioteca o importa nuevo contenido para alimentar tu mazo SRS."
                    icon={CheckCircle2}
                    action={
                      <div className="flex gap-3">
                        <Link href="/importer" className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
                          Importar contenido
                        </Link>
                        <Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                          Ir al Dashboard
                        </Link>
                      </div>
                    }
                  />
                )
              )}

              {/* STATE 2: ACTIVE Review Deck Session */}
              {sessionState === "active" && activeReviewItem && (
                <Card className="border-slate-300 shadow-md flex flex-col justify-between min-h-[380px] bg-white">
                  <div>
                    {/* Session Progress Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-950 text-white p-1">
                          <Brain size={12} />
                        </span>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sesión Activa</span>
                      </div>
                      <ProgressBadge value={sessionIndex + 1} max={sessionCards.length} label="Tarjetas" />
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-5">
                      <div 
                        className="bg-slate-900 h-full transition-all duration-300" 
                        style={{ width: `${Math.round((sessionIndex / sessionCards.length) * 100)}%` }} 
                        id="session-progress-bar"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {activeReviewItem.item_type}
                          </span>
                          <ReviewStateBadge state={activeReviewItem.state} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Racha: {activeReviewItem.success_streak}
                        </span>
                      </div>

                      <p className="text-lg font-bold text-slate-900 leading-snug">{activeReviewItem.prompt}</p>

                      {/* Source metadata display */}
                      {(activeReviewItem.notebook_title || activeReviewItem.domain || activeReviewItem.level) && (
                        <p className="text-[10px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          Origen: {activeReviewItem.domain ? `${activeReviewItem.domain} ` : ""}
                          {activeReviewItem.level ? `(${activeReviewItem.level}) ` : ""}
                          {activeReviewItem.notebook_title ? `· ${activeReviewItem.notebook_title}` : ""}
                        </p>
                      )}

                      {!showAnswer ? (
                        <div className="space-y-3 pt-2">
                          <textarea
                            value={userAttempt}
                            onChange={(e) => setUserAttempt(e.target.value)}
                            placeholder="Escribe tu respuesta mental en inglés antes de voltear la tarjeta..."
                            className="w-full min-h-20 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-500 bg-slate-50/50"
                          />
                          <button
                            onClick={() => setShowAnswer(true)}
                            className="w-full rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            Mostrar Respuesta
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-3 border-t border-slate-100 animate-fadeIn">
                          {userAttempt && (
                            <div className="text-xs text-slate-500">
                              <p className="font-semibold">Tu intento:</p>
                              <p className="italic font-mono mt-0.5">"{userAttempt}"</p>
                            </div>
                          )}
                          
                          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-sm text-emerald-900">
                            <p className="font-semibold flex items-center gap-1.5">✓ Respuesta Correcta / Guía:</p>
                            <p className="mt-1 font-medium font-mono text-xs whitespace-pre-wrap leading-relaxed">{activeReviewItem.answer_hint || "Revisa la teoría correspondiente."}</p>
                          </div>

                          {/* Grade Selector Buttons */}
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                              ¿Qué tan bien recordaste este elemento?
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              <button
                                onClick={() => handleGrade(1)}
                                className="rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                              >
                                Again (1)
                              </button>
                              <button
                                onClick={() => handleGrade(2)}
                                className="rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
                              >
                                Hard (2)
                              </button>
                              <button
                                onClick={() => handleGrade(3)}
                                className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                              >
                                Good (3)
                              </button>
                              <button
                                onClick={() => handleGrade(4)}
                                className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                              >
                                Easy (4)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* STATE 3: SUMMARY Review Session */}
              {sessionState === "summary" && (
                <Card className="border-slate-300 shadow-md p-6 space-y-6 flex flex-col justify-between min-h-[350px] bg-white">
                  <div className="text-center space-y-4">
                    <div className="mx-auto rounded-full bg-emerald-50 border border-emerald-100 p-3 text-emerald-600 w-14 h-14 flex items-center justify-center shadow-sm">
                      <Award size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900">¡Repaso Diario Completado!</h3>
                      <p className="text-xs text-slate-500">Completaste con éxito tu mazo programado para el día de hoy.</p>
                    </div>
                  </div>

                  {/* Summary Grid stats */}
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto w-full text-center border-y border-slate-100 py-4 text-xs font-medium">
                    <div>
                      <p className="text-slate-400 mb-0.5">Total Repasadas</p>
                      <p className="font-bold text-slate-900 text-base">{sessionGrades.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-0.5">Retenidas (Good/Easy)</p>
                      <p className="font-bold text-emerald-600 text-base">
                        {sessionGrades.filter((g) => g.grade >= 3).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-0.5">Por Reforzar (Again)</p>
                      <p className="font-bold text-red-600 text-base">
                        {sessionGrades.filter((g) => g.grade === 1).length}
                      </p>
                    </div>
                  </div>

                  {/* itemized review deck */}
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles de las respuestas:</p>
                    {sessionGrades.map((grade, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-50 text-xs">
                        <span className="text-slate-700 font-medium truncate max-w-xs" title={grade.prompt}>
                          {grade.prompt}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            grade.grade === 4
                              ? "bg-emerald-50 text-emerald-700"
                              : grade.grade === 3
                              ? "bg-blue-50 text-blue-700"
                              : grade.grade === 2
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {grade.grade === 4 ? "Easy" : grade.grade === 3 ? "Good" : grade.grade === 2 ? "Hard" : "Again"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={finishSession}
                    className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  >
                    <RotateCcw size={12} />
                    Finalizar y Volver al Mazo
                  </button>
                </Card>
              )}
            </div>
          ) : (
            /* Tab 2: Deck Manager */
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "due", "upcoming", "mastered", "forgotten"] as const).map((filter) => {
                  const isActive = deckFilter === filter;
                  const label =
                    filter === "all"
                      ? `Todos (${stats.total})`
                      : filter === "due"
                      ? `Pendientes hoy (${stats.due})`
                      : filter === "upcoming"
                      ? `Próximas (${stats.upcoming})`
                      : filter === "mastered"
                      ? `Dominadas (${stats.mastered})`
                      : `Olvidadas (${stats.forgotten})`;

                  return (
                    <button
                      key={filter}
                      onClick={() => setDeckFilter(filter)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                        isActive
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <EmptyState
                    title="No hay elementos"
                    description="No se encontraron tarjetas que coincidan con la categoría o filtro seleccionado."
                    icon={Calendar}
                  />
                ) : (
                  filteredReviews.map((item) => (
                    <Card key={item.id} className="border-slate-200 hover:border-slate-300 transition shadow-sm p-5 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {item.item_type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Racha: {item.success_streak} · Repasos: {item.review_count}
                          </span>
                        </div>
                        
                        <ReviewStateBadge state={item.state} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-900 leading-snug">{item.prompt}</p>
                        {item.answer_hint && (
                          <details className="group mt-2">
                            <summary className="text-[11px] font-bold text-slate-500 cursor-pointer select-none outline-none hover:text-slate-800 transition">
                              Ver respuesta / guía...
                            </summary>
                            <p className="mt-1 text-xs text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-mono whitespace-pre-wrap leading-relaxed">
                              {item.answer_hint}
                            </p>
                          </details>
                        )}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400 font-medium border-t border-slate-50 pt-2.5">
                        <span>
                          Siguiente repaso:{" "}
                          <span className="font-semibold text-slate-600">
                            {new Date(item.next_review_at) <= now
                              ? "⚠️ Pendiente hoy"
                              : new Date(item.next_review_at).toLocaleDateString()}
                          </span>
                        </span>
                        
                        {/* Meta tags */}
                        {(item.notebook_title || item.domain || item.level) && (
                          <span>
                            {item.domain ? `${item.domain} ` : ""}
                            {item.level ? `(${item.level}) ` : ""}
                            {item.notebook_title ? `· ${item.notebook_title}` : ""}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* SR Stats Column */}
        <div className="space-y-6">
          <Card className="bg-slate-950 text-white border-none flex flex-col justify-between h-full min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Calendar size={18} className="text-slate-400" />
                <h3 className="text-base font-bold">Estado de tu Mazo</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> Pendientes hoy
                  </span>
                  <span className="font-bold">{stats.due}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Próximas (Upcoming)
                  </span>
                  <span className="font-bold">{stats.upcoming}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> En aprendizaje
                  </span>
                  <span className="font-bold">{stats.learning}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> En revisión
                  </span>
                  <span className="font-bold">{stats.review}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Dominados (Mastered)
                  </span>
                  <span className="font-bold">{stats.mastered}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-800" /> Olvidadas (Forgotten)
                  </span>
                  <span className="font-bold text-red-400">{stats.forgotten}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-white/10 pt-2.5 mt-2">
                  <span className="text-slate-200 font-semibold">Total de elementos</span>
                  <span className="font-bold text-slate-200">{stats.total}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-normal border-t border-white/10 pt-3 mt-6">
              El mazo agrupa vocabulario, notas de gramática, frases clave y errores fallidos para su optimización mental.
            </div>
          </Card>
        </div>
      </div>

      {/* Biblioteca general de ejercicios */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-slate-800" size={20} />
          <h2 className="text-2xl font-bold text-slate-900">Mazo de Ejercicios del MVP</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {exercisesWithMetadata.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              notebookTitle={exercise.notebookTitle}
              domain={exercise.domain}
              level={exercise.level}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


