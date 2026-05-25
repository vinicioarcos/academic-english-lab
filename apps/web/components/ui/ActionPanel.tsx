import React from "react";
import { Card } from "./Card";

export function ActionPanel({
  title,
  description,
  action,
  color = "slate",
}: {
  title: string;
  description: string;
  action: React.ReactNode;
  color?: "slate" | "amber" | "indigo" | "emerald";
}) {
  const borderStyles = {
    slate: "border-slate-200 bg-slate-50/50",
    amber: "border-amber-150 bg-amber-50/25",
    indigo: "border-indigo-150 bg-indigo-50/15",
    emerald: "border-emerald-150 bg-emerald-50/15",
  };

  return (
    <Card className={`border p-5 rounded-3xl flex items-center justify-between flex-wrap gap-4 ${borderStyles[color]}`}>
      <div className="space-y-1 max-w-xl">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </Card>
  );
}
