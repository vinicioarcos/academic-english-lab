import React from "react";
import { Card } from "./Card";
import { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "slate",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
  color?: "slate" | "amber" | "emerald" | "blue" | "teal" | "red" | "indigo";
}) {
  const iconColorMap = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    teal: "bg-teal-100 text-teal-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <Card className="border border-slate-150 p-5 hover:shadow-md transition duration-200 flex flex-col justify-between h-full bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-2 shrink-0 ${iconColorMap[color]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      {((trend) || description) && (
        <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-500">
          {description && <span className="font-semibold truncate mr-2" title={description}>{description}</span>}
          {trend && (
            <span className={`px-1.5 py-0.5 rounded-full shrink-0 ${
              trend.type === "up" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
              trend.type === "down" ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
