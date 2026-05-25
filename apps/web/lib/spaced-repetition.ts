import { supabase } from "./supabase";

export type ReviewItemType = "vocabulary" | "grammar" | "phrase" | "exercise" | "mistake";
export type LearningState = "new" | "learning" | "review" | "mastered" | "forgotten";
export type ReviewSourceType = "vocabulary" | "grammar" | "phrase_bank" | "theory_block" | "exercise_error" | "ai_notebook";

export type ReviewItem = {
  id: string;
  user_id?: string;
  item_type: ReviewItemType;
  item_id: string;
  prompt: string;
  answer_hint?: string;
  next_review_at: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  success_streak: number;
  last_reviewed_at?: string;
  state: LearningState;
  
  // Source metadata
  source_type?: ReviewSourceType;
  source_id?: string;
  notebook_title?: string;
  domain?: string;
  level?: string;
};

const REVIEWS_KEY = "academic-english-lab-reviews";

export function calculateSM2(
  grade: 1 | 2 | 3 | 4,
  current: { ease_factor: number; success_streak: number; interval_days: number; review_count: number }
) {
  let easeFactor = current.ease_factor;
  let successStreak = current.success_streak;
  let intervalDays = current.interval_days;
  const reviewCount = current.review_count + 1;
  let state: LearningState = "review";

  if (grade === 1) {
    // Again: forgotten
    successStreak = 0;
    intervalDays = 0; // review immediately (scheduled for 5 mins)
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    state = "forgotten";
  } else if (grade === 2) {
    // Hard
    successStreak += 1;
    intervalDays = successStreak === 1 ? 1 : successStreak === 2 ? 2 : Math.ceil(intervalDays * 1.2);
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    state = "learning";
  } else if (grade === 3) {
    // Good
    successStreak += 1;
    intervalDays = successStreak === 1 ? 1 : successStreak === 2 ? 4 : Math.ceil(intervalDays * easeFactor);
    state = successStreak >= 5 ? "mastered" : "review";
  } else if (grade === 4) {
    // Easy
    successStreak += 1;
    intervalDays = successStreak === 1 ? 3 : successStreak === 2 ? 6 : Math.ceil(intervalDays * easeFactor * 1.3);
    easeFactor = Math.min(3.0, easeFactor + 0.15);
    state = successStreak >= 4 ? "mastered" : "review";
  }

  // Set schedule
  let nextReviewAt: string;
  if (intervalDays === 0) {
    // 5 minutes from now
    nextReviewAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  } else {
    nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();
  }

  return {
    easeFactor,
    successStreak,
    intervalDays,
    reviewCount,
    nextReviewAt,
    state,
  };
}

export function getLocalReviews(): ReviewItem[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(REVIEWS_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export function saveLocalReviews(items: ReviewItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(items));
}

export async function saveReviewItem(item: ReviewItem, userId?: string): Promise<void> {
  const client = supabase;
  let dbId: string | undefined = item.id.startsWith("local-") ? undefined : item.id;

  if (client && userId) {
    try {
      // Prevent duplicates in Supabase: check if this item exists already
      const { data: existing, error: findError } = await client
        .from("review_items")
        .select("id")
        .eq("user_id", userId)
        .eq("item_id", item.item_id)
        .eq("item_type", item.item_type)
        .maybeSingle();

      if (!findError && existing) {
        dbId = existing.id;
      }

      const { error } = await client.from("review_items").upsert({
        id: dbId, // use the existing row uuid to prevent duplicate records
        user_id: userId,
        item_type: item.item_type,
        item_id: item.item_id,
        prompt: item.prompt,
        answer_hint: item.answer_hint,
        next_review_at: item.next_review_at,
        interval_days: item.interval_days,
        ease_factor: item.ease_factor,
        review_count: item.review_count,
        success_streak: item.success_streak,
        last_reviewed_at: item.last_reviewed_at,
        state: item.state,
        source_type: item.source_type,
        source_id: item.source_id,
        notebook_title: item.notebook_title,
        domain: item.domain,
        level: item.level,
      });
      if (!error) return;
      console.error("Supabase upsert review failed, storing locally:", error);
    } catch (err) {
      console.error("Supabase upsert reviews error:", err);
    }
  }

  // Local storage fallback
  const reviews = getLocalReviews();
  const index = reviews.findIndex((r) => r.id === item.id || (r.item_id === item.item_id && r.item_type === item.item_type));
  if (index !== -1) {
    reviews[index] = { 
      ...reviews[index], 
      ...item,
      id: reviews[index].id // preserve the original local id
    };
  } else {
    reviews.push(item);
  }
  saveLocalReviews(reviews);
}

export async function getUserReviews(userId?: string): Promise<ReviewItem[]> {
  const client = supabase;
  if (client && userId) {
    try {
      const { data, error } = await client
        .from("review_items")
        .select("*")
        .eq("user_id", userId);
        
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          item_type: d.item_type,
          item_id: d.item_id,
          prompt: d.prompt,
          answer_hint: d.answer_hint,
          next_review_at: d.next_review_at,
          interval_days: d.interval_days,
          ease_factor: d.ease_factor,
          review_count: d.review_count,
          success_streak: d.success_streak,
          last_reviewed_at: d.last_reviewed_at,
          state: d.state,
          source_type: d.source_type,
          source_id: d.source_id,
          notebook_title: d.notebook_title,
          domain: d.domain,
          level: d.level,
        }));
      }
    } catch (err) {
      console.error("Supabase read reviews failed, loading locally:", err);
    }
  }

  return getLocalReviews();
}

export async function getDueReviews(userId?: string): Promise<ReviewItem[]> {
  const all = await getUserReviews(userId);
  const now = new Date();
  return all.filter((item) => new Date(item.next_review_at) <= now);
}

export async function getSpacedRepetitionStats(userId?: string) {
  const all = await getUserReviews(userId);
  const now = new Date();
  
  const due = all.filter((item) => new Date(item.next_review_at) <= now).length;
  const upcoming = all.filter((item) => new Date(item.next_review_at) > now).length;
  const learning = all.filter((item) => item.state === "learning" || item.state === "new").length;
  const mastered = all.filter((item) => item.state === "mastered").length;
  const forgotten = all.filter((item) => item.state === "forgotten").length;
  const review = all.filter((item) => item.state === "review").length;

  return { due, upcoming, learning, mastered, forgotten, review, total: all.length };
}

export async function upsertExerciseReview(
  exerciseId: string,
  prompt: string,
  expectedAnswer: string,
  type: string,
  isCorrect: boolean,
  userId?: string,
  metadata?: {
    source_type?: ReviewSourceType;
    source_id?: string;
    notebook_title?: string;
    domain?: string;
    level?: string;
  }
): Promise<void> {
  const reviews = await getUserReviews(userId);
  const existing = reviews.find((r) => r.item_id === exerciseId && r.item_type === "exercise");

  let item: ReviewItem;

  if (existing) {
    if (isCorrect) {
      // User answered correctly: Apply "Good" grade 3 calculations
      const sm2 = calculateSM2(3, {
        ease_factor: existing.ease_factor,
        success_streak: existing.success_streak,
        interval_days: existing.interval_days,
        review_count: existing.review_count,
      });

      item = {
        ...existing,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: sm2.nextReviewAt,
        interval_days: sm2.intervalDays,
        ease_factor: sm2.easeFactor,
        success_streak: sm2.successStreak,
        review_count: sm2.reviewCount,
        state: sm2.state,
        source_type: metadata?.source_type || existing.source_type,
        source_id: metadata?.source_id || existing.source_id,
        notebook_title: metadata?.notebook_title || existing.notebook_title,
        domain: metadata?.domain || existing.domain,
        level: metadata?.level || existing.level,
      };
    } else {
      // User answered incorrectly: Apply "Again" grade 1 calculations
      const sm2 = calculateSM2(1, {
        ease_factor: existing.ease_factor,
        success_streak: existing.success_streak,
        interval_days: existing.interval_days,
        review_count: existing.review_count,
      });

      item = {
        ...existing,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: sm2.nextReviewAt,
        interval_days: sm2.intervalDays,
        ease_factor: sm2.easeFactor,
        success_streak: sm2.successStreak,
        review_count: sm2.reviewCount,
        state: sm2.state,
        source_type: metadata?.source_type || existing.source_type,
        source_id: metadata?.source_id || existing.source_id,
        notebook_title: metadata?.notebook_title || existing.notebook_title,
        domain: metadata?.domain || existing.domain,
        level: metadata?.level || existing.level,
      };
    }
  } else {
    // New item creation
    const timestamp = new Date().toISOString();
    const id = `local-review-exercise-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (isCorrect) {
      item = {
        id,
        item_type: "exercise",
        item_id: exerciseId,
        prompt,
        answer_hint: expectedAnswer,
        next_review_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
        interval_days: 1,
        ease_factor: 2.5,
        review_count: 1,
        success_streak: 1,
        last_reviewed_at: timestamp,
        state: "review",
        source_type: metadata?.source_type || "exercise_error",
        source_id: metadata?.source_id || exerciseId,
        notebook_title: metadata?.notebook_title,
        domain: metadata?.domain,
        level: metadata?.level,
      };
    } else {
      item = {
        id,
        item_type: "exercise",
        item_id: exerciseId,
        prompt,
        answer_hint: expectedAnswer,
        next_review_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        interval_days: 0,
        ease_factor: 2.3,
        review_count: 1,
        success_streak: 0,
        last_reviewed_at: timestamp,
        state: "learning",
        source_type: metadata?.source_type || "exercise_error",
        source_id: metadata?.source_id || exerciseId,
        notebook_title: metadata?.notebook_title,
        domain: metadata?.domain,
        level: metadata?.level,
      };
    }
  }

  await saveReviewItem(item, userId);
}

export function clearLocalReviewData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REVIEWS_KEY);
}

