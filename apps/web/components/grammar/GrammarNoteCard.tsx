"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { GrammarNote } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { saveReviewItem, getUserReviews, ReviewItem } from "@/lib/spaced-repetition";

export function GrammarNoteCard({ note }: { note: GrammarNote }) {
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const reviews = await getUserReviews(user?.id);
      const exists = reviews.some(r => r.item_id === note.id && r.item_type === "grammar");
      setIsAdded(exists);
    }
    checkStatus();
  }, [note.id, user?.id]);

  const handleAddToSRS = async () => {
    const timestamp = new Date().toISOString();
    const id = `local-review-grammar-${note.id}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "grammar",
      item_id: note.id,
      prompt: `Gramática: "${note.title}"`,
      answer_hint: `Explicación: ${note.explanation}\n\nRegla: ${note.rule}\n\nEjemplos:\n${note.examples.map(ex => `- ${ex}`).join('\n')}\n\nOjo: ${note.commonMistake}`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "grammar",
      source_id: note.id,
      domain: "Grammar",
    };
    await saveReviewItem(reviewItem, user?.id);
    setIsAdded(true);
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{note.title}</h3>
        <p className="mt-3 text-slate-600">{note.explanation}</p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Regla simple</p>
          <p className="mt-1 text-sm text-slate-600">{note.rule}</p>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {note.examples.map((example) => <li key={example}>• {example}</li>)}
        </ul>
        <p className="mt-4 text-sm text-red-700">Error común: {note.commonMistake}</p>
      </div>

      <button
        onClick={handleAddToSRS}
        disabled={isAdded}
        className={`mt-6 w-full rounded-xl py-2 text-xs font-bold border transition ${
          isAdded
            ? "bg-slate-50 border-slate-200 text-slate-400 cursor-default"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
        }`}
      >
        {isAdded ? "✓ En Mazo de Repaso" : "+ Agregar a Repaso Espaciado"}
      </button>
    </Card>
  );
}

