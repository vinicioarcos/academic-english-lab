import { Card } from "@/components/ui/Card";
import { Notebook } from "@/lib/types";

export function NotebookCard({ notebook }: { notebook: Notebook }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-slate-900">{notebook.title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{notebook.level}</span>
      </div>
      <p className="mt-3 text-slate-600">{notebook.theory}</p>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-700">Phrase bank</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {notebook.phrases.map((phrase) => <li key={phrase}>• {phrase}</li>)}
        </ul>
      </div>
    </Card>
  );
}
