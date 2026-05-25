import { VocabularyCard } from "@/components/vocabulary/VocabularyCard";
import { vocabularyItems } from "@/lib/data";

export default function VocabularyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Vocabulario</h1>
        <p className="mt-2 text-slate-600">Palabras y frases con uso académico, errores comunes y ejemplos.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {vocabularyItems.map((item) => <VocabularyCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
