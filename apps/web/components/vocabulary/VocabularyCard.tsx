"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { VocabularyItem } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { saveReviewItem, getUserReviews, ReviewItem } from "@/lib/spaced-repetition";

export function VocabularyCard({ item }: { item: VocabularyItem }) {
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const reviews = await getUserReviews(user?.id);
      const exists = reviews.some(r => r.item_id === item.id && r.item_type === "vocabulary");
      setIsAdded(exists);
    }
    checkStatus();
  }, [item.id, user?.id]);

  const handleAddToSRS = async () => {
    const timestamp = new Date().toISOString();
    const id = `local-review-vocab-${item.id}`;
    const reviewItem: ReviewItem = {
      id,
      item_type: "vocabulary",
      item_id: item.id,
      prompt: `Vocabulario: "${item.word}"`,
      answer_hint: `${item.translation} · ${item.partOfSpeech}\n\nEjemplos:\n${item.examples.map(ex => `- ${ex}`).join('\n')}\n\nOjo: ${item.commonMistake}`,
      next_review_at: timestamp,
      interval_days: 0,
      ease_factor: 2.5,
      review_count: 0,
      success_streak: 0,
      state: "new",
      source_type: "vocabulary",
      source_id: item.id,
      domain: item.domain,
    };
    await saveReviewItem(reviewItem, user?.id);
    setIsAdded(true);
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{item.word}</h3>
            <p className="text-slate-500">{item.translation} · {item.partOfSpeech}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{item.domain}</span>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          {item.examples.map((example) => <p key={example}>“{example}”</p>)}
        </div>
        <p className="mt-4 text-sm text-amber-700">Ojo: {item.commonMistake}</p>
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

