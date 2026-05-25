"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/AuthContext";
import { clearLocalPracticeData } from "@/lib/persistence";
import { clearLocalReviewData } from "@/lib/spaced-repetition";
import { Database, Key, RefreshCw, UserCheck } from "lucide-react";

export default function SettingsPage() {
  const { user, isMock, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState("B2");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleClearData = () => {
    if (confirm("¿Estás seguro de que deseas limpiar todas tus estadísticas, historial de errores y mazo de repaso local?")) {
      setClearing(true);
      clearLocalPracticeData();
      clearLocalReviewData();
      setClearing(false);
      alert("Estadísticas, errores e historial de repetición espaciada eliminados.");
      window.location.reload();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let res;
    if (mode === "login") {
      res = await signIn(email, password);
    } else {
      res = await signUp(email, password, fullName, level);
    }

    setLoading(false);
    if (res?.error) {
      setMessage({ text: `Error: ${res.error.message || res.error}`, type: "error" });
    } else {
      setMessage({
        text: mode === "login" ? "Sesión iniciada con éxito." : "Cuenta creada con éxito. Inicia sesión ahora.",
        type: "success",
      });
      if (mode === "login") {
        setEmail("");
        setPassword("");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ajustes</h1>
        <p className="mt-2 text-slate-600">Configuración del entorno del laboratorio y gestión de sesión.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-2 text-white">
                <Database size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Conexión de Datos</h2>
            </div>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              El laboratorio se encuentra en <span className="font-semibold text-slate-900">{isMock ? "Modo Local" : "Modo Supabase"}</span>.
            </p>
            {isMock ? (
              <p className="mt-2 text-xs text-slate-400">
                Tus estadísticas y el historial de errores (Mistake Tracker) se guardan directamente en tu navegador mediante <code className="font-semibold">localStorage</code>.
              </p>
            ) : (
              <p className="mt-2 text-xs text-emerald-600 font-semibold">
                ¡Variables de entorno de Supabase detectadas! Sincronización en la nube disponible si inicias sesión.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400">Datos locales</span>
            <button
              onClick={handleClearData}
              disabled={clearing}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={12} className={clearing ? "animate-spin" : ""} />
              Limpiar historial local
            </button>
          </div>
        </Card>

        {/* Minimal Auth Form / User Info */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-slate-900 p-2 text-white">
              <UserCheck size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sesión del Usuario</h2>
          </div>

          {isMock ? (
            <div className="space-y-3 py-4 text-sm text-slate-600">
              <p>
                No hay un sistema de sesión activo en modo local. Todo el progreso se almacena localmente y de manera anónima.
              </p>
              <p className="text-xs text-slate-400">
                Para habilitar cuentas de usuario independientes, configure las claves de Supabase.
              </p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Usuario Conectado</p>
                <p className="text-sm font-semibold text-slate-800">{user.fullName || "Sin nombre"}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nivel Registrado</p>
                <span className="inline-block mt-1 rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">
                  Inglés {user.level || "B2"}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full mt-4 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                        placeholder="Dr. Smith"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Nivel de Inglés</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-500 bg-white"
                      >
                        <option value="A2">A2 - Elementary</option>
                        <option value="B1">B1 - Intermediate</option>
                        <option value="B2">B2 - Upper-Intermediate</option>
                        <option value="C1">C1 - Advanced</option>
                        <option value="C2">C2 - Proficient</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                    required
                  />
                </div>

                {message && (
                  <p className={`text-xs ${message.type === "success" ? "text-emerald-600 font-semibold" : "text-red-600"}`}>
                    {message.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-xl bg-slate-950 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50 transition"
                >
                  {loading ? "Cargando..." : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                </button>
              </form>

              <div className="mt-3 text-center">
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Variables checklist */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-2 text-white">
            <Key size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Variables de Entorno (.env.local)</h2>
        </div>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Para persistir datos en la nube y usar generación con Inteligencia Artificial, asegúrate de que tu archivo <code className="font-mono bg-slate-100 rounded px-1">.env.local</code> contiene los siguientes valores en el directorio raíz de la aplicación web:
        </p>
        <pre className="mt-4 rounded-xl bg-slate-950 p-4 text-[10px] font-mono text-slate-300 overflow-x-auto">
{`AI_PROVIDER=openai
OPENAI_API_KEY=tu_clave_api_aquí
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aquí
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aquí`}
        </pre>
      </Card>
    </div>
  );
}
