"use client";

import { useAuth } from "@/lib/AuthContext";
import { User } from "lucide-react";

export function Header() {
  const { user, isMock } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Inglés académico aplicado</p>
          <h2 className="text-xl font-semibold text-slate-900">Practice. Correct. Repeat.</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {isMock ? "Modo Local" : "Supabase Conectado"}
          </span>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 font-semibold text-white">
                {user.fullName ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("") : <User size={16} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">{user.fullName || user.email}</p>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level {user.level || "B2"}</span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-500">Invitado</span>
          )}
        </div>
      </div>
    </header>
  );
}
