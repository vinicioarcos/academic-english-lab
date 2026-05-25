import React from "react";

export type LearningState = "new" | "learning" | "review" | "mastered" | "forgotten";

export function ReviewStateBadge({ state }: { state: LearningState }) {
  const styles = {
    new: "bg-blue-50 text-blue-700 border-blue-100",
    learning: "bg-amber-50 text-amber-700 border-amber-100",
    review: "bg-indigo-50 text-indigo-700 border-indigo-100",
    mastered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    forgotten: "bg-red-50 text-red-700 border-red-100",
  };

  const labels = {
    new: "Nuevo",
    learning: "Aprendiendo",
    review: "Repaso",
    mastered: "Dominado",
    forgotten: "Olvidado",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[state]}`}>
      {labels[state]}
    </span>
  );
}
