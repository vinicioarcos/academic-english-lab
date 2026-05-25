import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-slate-900 p-8 text-white md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Academic English Lab</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          Inglés académico para enseñar, investigar y presentar economía en inglés.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          Una plataforma personal de gramática, vocabulario, biblioteca de cuadernos, active recall y corrección guiada con IA.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/library" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900">Abrir biblioteca</Link>
          <Link href="/practice" className="rounded-2xl border border-slate-600 px-5 py-3 text-sm font-semibold text-white">Practicar ahora</Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card>
          <h2 className="text-xl font-semibold">Gramática personalizada</h2>
          <p className="mt-2 text-slate-600">Reglas simples, ejemplos académicos y errores frecuentes conectados al español.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Vocabulario aplicado</h2>
          <p className="mt-2 text-slate-600">Econometría, políticas públicas, docencia, escritura científica y conferencias.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Biblioteca generativa</h2>
          <p className="mt-2 text-slate-600">Libros y cuadernos para practicar temas concretos con active recall.</p>
        </Card>
      </section>
    </div>
  );
}
