import React from "react";

export function ProgressBadge({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-850 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
      {label && <span className="text-slate-400 font-bold uppercase tracking-wider mr-0.5">{label}:</span>}
      <span>{value} / {max}</span>
      <span className="text-[9px] text-amber-400">({pct}%)</span>
    </span>
  );
}
