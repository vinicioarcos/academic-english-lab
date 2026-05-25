import React from "react";
import { Sparkles } from "lucide-react";

export function OnboardingHint({
  title,
  message,
  stepNumber,
}: {
  title: string;
  message: string;
  stepNumber?: number;
}) {
  return (
    <div className="rounded-2xl bg-amber-50/60 border border-amber-150 p-4 flex gap-3 items-start">
      <div className="rounded-xl bg-amber-100 text-amber-800 p-1.5 shrink-0 mt-0.5 font-bold text-[10px] w-6 h-6 flex items-center justify-center">
        {stepNumber ? `#${stepNumber}` : <Sparkles size={12} fill="currentColor" />}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-wider">{title}</h4>
        <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
