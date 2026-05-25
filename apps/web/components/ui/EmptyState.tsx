import React from "react";
import { LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-slate-50/50 border border-slate-150 rounded-3xl">
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100 text-slate-400 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed font-semibold">
        {description}
      </p>
      {action}
    </div>
  );
}
