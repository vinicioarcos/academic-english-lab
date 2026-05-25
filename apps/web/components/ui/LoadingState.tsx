import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-slate-50/20 border border-slate-100 rounded-3xl">
      <Loader2 className="animate-spin text-slate-800 mb-3" size={28} />
      <p className="text-xs text-slate-500 font-semibold">{message}</p>
    </div>
  );
}
