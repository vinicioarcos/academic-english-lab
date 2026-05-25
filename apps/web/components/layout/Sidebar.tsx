import Link from "next/link";
import { BookOpen, Brain, GraduationCap, Home, Library, PenTool, Settings, SpellCheck, Mic, FileUp } from "lucide-react";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: GraduationCap },
  { href: "/grammar", label: "Gramática", icon: SpellCheck },
  { href: "/vocabulary", label: "Vocabulario", icon: BookOpen },
  { href: "/library", label: "Biblioteca", icon: Library },
  { href: "/practice", label: "Práctica", icon: Brain },
  { href: "/speaking", label: "Expresión Oral", icon: Mic },
  { href: "/importer", label: "Importar contenido", icon: FileUp },
  { href: "/settings", label: "Ajustes", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-2 text-white"><PenTool size={20} /></div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">EconEnglish</p>
            <h1 className="text-lg font-bold">Academic Lab</h1>
          </div>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
