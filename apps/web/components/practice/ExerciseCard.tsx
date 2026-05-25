"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Exercise } from "@/lib/types";
import { checkAnswer } from "@/lib/exercises";
import { saveExerciseAttempt } from "@/lib/persistence";
import { useAuth } from "@/lib/AuthContext";
import { upsertExerciseReview } from "@/lib/spaced-repetition";

export function ExerciseCard({
  exercise,
  notebookTitle,
  domain,
  level,
}: {
  exercise: Exercise;
  notebookTitle?: string;
  domain?: string;
  level?: string;
}) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const ok = checkAnswer(answer, exercise.expectedAnswer);

  const handleCheck = async () => {
    setChecked(true);
    setSaving(true);
    try {
      // 1. Save standard practice attempt
      await saveExerciseAttempt({
        exerciseId: exercise.id,
        userAnswer: answer,
        isCorrect: ok,
        feedback: exercise.feedback,
        prompt: exercise.prompt,
        expectedAnswer: exercise.expectedAnswer,
        type: exercise.type,
      }, user?.id);

      // 2. Log/Update Spaced Repetition review item
      await upsertExerciseReview(
        exercise.id,
        exercise.prompt,
        exercise.expectedAnswer,
        exercise.type,
        ok,
        user?.id,
        {
          source_type: "exercise_error",
          source_id: exercise.id,
          notebook_title: notebookTitle,
          domain: domain,
          level: level,
        }
      );
    } catch (err) {
      console.error("Failed to save attempt or register review item:", err);
    } finally {
      setSaving(false);
    }
  };


  const handleReset = () => {
    setAnswer("");
    setChecked(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {exercise.type}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900 leading-snug">{exercise.prompt}</h3>
      <textarea
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          if (checked) setChecked(false);
        }}
        placeholder="Escribe tu respuesta en inglés..."
        className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-slate-500 transition-colors bg-slate-50 focus:bg-white"
        disabled={saving}
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleCheck}
          disabled={saving || !answer.trim()}
          className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Guardando..." : "Corregir"}
        </button>
        {checked && (
          <button
            onClick={handleReset}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Reintentar
          </button>
        )}
      </div>
      {checked && (
        <div className={`mt-4 rounded-2xl p-4 text-sm ${ok ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-amber-50 text-amber-900 border border-amber-100"}`}>
          <p className="font-bold flex items-center gap-1.5">
            {ok ? "✓ ¡Correcto!" : "⚠ Revisa la estructura"}
          </p>
          <p className="mt-1.5"><span className="font-semibold">Esperado:</span> {exercise.expectedAnswer}</p>
          <p className="mt-1 text-xs text-slate-500 italic">{exercise.feedback}</p>
        </div>
      )}
    </Card>
  );
}
