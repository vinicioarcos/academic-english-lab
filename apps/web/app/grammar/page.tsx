import { GrammarNoteCard } from "@/components/grammar/GrammarNoteCard";
import { grammarNotes } from "@/lib/data";

export default function GrammarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gramática académica</h1>
        <p className="mt-2 text-slate-600">Reglas simples con ejemplos de economía, investigación y docencia.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {grammarNotes.map((note) => <GrammarNoteCard key={note.id} note={note} />)}
      </div>
    </div>
  );
}
