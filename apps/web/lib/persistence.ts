import { supabase } from "./supabase";

export type ExerciseAttempt = {
  id: string;
  exercise_id: string;
  user_answer: string;
  is_correct: boolean;
  feedback: string;
  created_at: string;
  prompt: string;
  expected_answer: string;
  type: string;
};

export type UserError = {
  id: string;
  exercise_id: string;
  prompt: string;
  user_answer: string;
  expected_answer: string;
  error_type: string;
  date: string;
  retry_status: "pendiente" | "completado";
};

const ATTEMPTS_KEY = "academic-english-lab-attempts";
const ERRORS_KEY = "academic-english-lab-errors";

export async function saveExerciseAttempt(
  input: {
    exerciseId: string;
    userAnswer: string;
    isCorrect: boolean;
    feedback: string;
    prompt: string;
    expectedAnswer: string;
    type: string;
  },
  userId?: string
): Promise<void> {
  const client = supabase;
  const timestamp = new Date().toISOString();

  if (client && userId) {
    try {
      const { error: attemptError } = await client.from("practice_attempts").insert({
        user_id: userId,
        exercise_id: input.exerciseId,
        user_answer: input.userAnswer,
        is_correct: input.isCorrect,
        feedback: input.feedback,
        prompt: input.prompt,
        expected_answer: input.expectedAnswer,
        type: input.type,
      });
      if (attemptError) throw attemptError;

      if (!input.isCorrect) {
        await client.from("user_mistakes").insert({
          user_id: userId,
          exercise_id: input.exerciseId,
          prompt: input.prompt,
          user_answer: input.userAnswer,
          expected_answer: input.expectedAnswer,
          error_type: input.type,
          retry_status: "pendiente",
        });
      } else {
        const { error: resolveError } = await client
          .from("user_mistakes")
          .update({ retry_status: "completado" })
          .eq("user_id", userId)
          .eq("exercise_id", input.exerciseId)
          .eq("retry_status", "pendiente");
        
        if (resolveError) console.error("Error resolving mistake in Supabase:", resolveError);
      }
      return;
    } catch (err) {
      console.error("Supabase write failed, falling back to local storage:", err);
    }
  }

  saveToLocalStorage(input, timestamp);
}

function saveToLocalStorage(
  input: {
    exerciseId: string;
    userAnswer: string;
    isCorrect: boolean;
    feedback: string;
    prompt: string;
    expectedAnswer: string;
    type: string;
  },
  timestamp: string
) {
  if (typeof window === "undefined") return;

  const attempts = getLocalAttempts();
  const newAttempt: ExerciseAttempt = {
    id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    exercise_id: input.exerciseId,
    user_answer: input.userAnswer,
    is_correct: input.isCorrect,
    feedback: input.feedback,
    created_at: timestamp,
    prompt: input.prompt,
    expected_answer: input.expectedAnswer,
    type: input.type,
  };
  attempts.push(newAttempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

  const errors = getLocalErrors();

  if (!input.isCorrect) {
    const newError: UserError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      exercise_id: input.exerciseId,
      prompt: input.prompt,
      user_answer: input.userAnswer,
      expected_answer: input.expectedAnswer,
      error_type: input.type,
      date: timestamp,
      retry_status: "pendiente",
    };
    errors.push(newError);
    localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
  } else {
    let changed = false;
    errors.forEach((err) => {
      if (err.exercise_id === input.exerciseId && err.retry_status === "pendiente") {
        err.retry_status = "completado";
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
    }
  }
}

export function getLocalAttempts(): ExerciseAttempt[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(ATTEMPTS_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export function getLocalErrors(): UserError[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(ERRORS_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export async function getUserStats(userId?: string): Promise<{ total: number; correct: number }> {
  const client = supabase;
  if (client && userId) {
    try {
      const { data, error } = await client
        .from("practice_attempts")
        .select("is_correct")
        .eq("user_id", userId);
        
      if (!error && data) {
        return {
          total: data.length,
          correct: data.filter((d) => d.is_correct).length,
        };
      }
    } catch (err) {
      console.error("Supabase getUserStats failed, reading locally:", err);
    }
  }

  const attempts = getLocalAttempts();
  return {
    total: attempts.length,
    correct: attempts.filter((a) => a.is_correct).length,
  };
}

export async function getUserErrors(userId?: string): Promise<UserError[]> {
  const client = supabase;
  if (client && userId) {
    try {
      const { data, error } = await client
        .from("user_mistakes")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          exercise_id: d.exercise_id,
          prompt: d.prompt,
          user_answer: d.user_answer,
          expected_answer: d.expected_answer,
          error_type: d.error_type,
          date: d.date || d.created_at || new Date().toISOString(),
          retry_status: d.retry_status,
        }));
      }
    } catch (err) {
      console.error("Supabase getUserErrors failed, reading locally:", err);
    }
  }

  return getLocalErrors().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function markErrorAsResolved(errorId: string, userId?: string): Promise<void> {
  const client = supabase;
  if (client && userId) {
    try {
      const { error } = await client
        .from("user_mistakes")
        .update({ retry_status: "completado" })
        .eq("id", errorId)
        .eq("user_id", userId);

      if (!error) return;
    } catch (err) {
      console.error("Supabase markErrorAsResolved failed, updating locally:", err);
    }
  }

  if (typeof window === "undefined") return;
  const errors = getLocalErrors();
  const index = errors.findIndex((err) => err.id === errorId);
  if (index !== -1) {
    errors[index].retry_status = "completado";
    localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
  }
}

export function clearLocalPracticeData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(ERRORS_KEY);
  localStorage.removeItem(SPEAKING_KEY);
  localStorage.removeItem(FEEDBACK_KEY);
}

export type SpeakingAttempt = {
  id: string;
  user_id?: string;
  prompt: string;
  category: string;
  transcript?: string;
  self_rating: {
    fluency: number;
    clarity: number;
    confidence: number;
    vocabulary: number;
  };
  notes?: string;
  audio_url?: string;
  created_at: string;
};

const SPEAKING_KEY = "academic-english-lab-speaking";

export async function saveSpeakingAttempt(
  input: {
    prompt: string;
    category: string;
    transcript?: string;
    selfRating: {
      fluency: number;
      clarity: number;
      confidence: number;
      vocabulary: number;
    };
    notes?: string;
    audioUrl?: string;
  },
  userId?: string
): Promise<void> {
  const client = supabase;
  const timestamp = new Date().toISOString();

  if (client && userId) {
    try {
      const { error } = await client.from("speaking_attempts").insert({
        user_id: userId,
        prompt: input.prompt,
        category: input.category,
        transcript: input.transcript || null,
        self_rating: input.selfRating,
        notes: input.notes || null,
        audio_url: input.audioUrl || null,
      });
      if (!error) return;
      console.error("Supabase speaking attempt write failed, falling back to local storage:", error);
    } catch (err) {
      console.error("Supabase speaking attempt error:", err);
    }
  }

  // Local storage fallback
  if (typeof window === "undefined") return;
  const attempts = getLocalSpeakingAttempts();
  const newAttempt: SpeakingAttempt = {
    id: `speaking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    prompt: input.prompt,
    category: input.category,
    transcript: input.transcript,
    self_rating: input.selfRating,
    notes: input.notes,
    audio_url: input.audioUrl,
    created_at: timestamp,
  };
  attempts.push(newAttempt);
  localStorage.setItem(SPEAKING_KEY, JSON.stringify(attempts));
}

export function getLocalSpeakingAttempts(): SpeakingAttempt[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(SPEAKING_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export async function getSpeakingAttempts(userId?: string): Promise<SpeakingAttempt[]> {
  const client = supabase;
  if (client && userId) {
    try {
      const { data, error } = await client
        .from("speaking_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          prompt: d.prompt,
          category: d.category,
          transcript: d.transcript,
          self_rating: d.self_rating,
          notes: d.notes,
          audio_url: d.audio_url,
          created_at: d.created_at || d.date || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Supabase getSpeakingAttempts failed, reading locally:", err);
    }
  }

  return getLocalSpeakingAttempts().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export type PersistedSpeakingFeedback = {
  id: string;
  user_id?: string;
  speaking_attempt_id?: string;
  prompt: string;
  category: string;
  user_text: string;
  corrected_version: string;
  academic_version: string;
  grammar_issues: string[];
  vocabulary_suggestions: { word: string; suggestion: string; translation: string }[];
  stronger_academic_phrases: string[];
  suggested_review_items: string[];
  overall_feedback: string;
  next_practice_prompt: string;
  created_at: string;
};

const FEEDBACK_KEY = "academic-english-lab-speaking-feedback";

export async function saveSpeakingFeedback(
  input: {
    speakingAttemptId?: string;
    prompt: string;
    category: string;
    userText: string;
    correctedVersion: string;
    academicVersion: string;
    grammarIssues: string[];
    vocabularySuggestions: { word: string; suggestion: string; translation: string }[];
    strongerAcademicPhrases: string[];
    suggestedReviewItems: string[];
    overallFeedback: string;
    nextPracticePrompt: string;
  },
  userId?: string
): Promise<string> {
  const client = supabase;
  const timestamp = new Date().toISOString();
  const generatedId = `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  if (client && userId) {
    try {
      const { data, error } = await client.from("speaking_feedback").insert({
        user_id: userId,
        speaking_attempt_id: input.speakingAttemptId || null,
        prompt: input.prompt,
        category: input.category,
        user_text: input.userText,
        corrected_version: input.correctedVersion,
        academic_version: input.academicVersion,
        grammar_issues: input.grammarIssues,
        vocabulary_suggestions: input.vocabularySuggestions,
        stronger_academic_phrases: input.strongerAcademicPhrases,
        suggested_review_items: input.suggestedReviewItems,
        overall_feedback: input.overallFeedback,
        next_practice_prompt: input.nextPracticePrompt,
      }).select("id").maybeSingle();

      if (!error && data) {
        return data.id;
      }
      if (error) console.error("Supabase speaking feedback write failed, falling back to local storage:", error);
    } catch (err) {
      console.error("Supabase speaking feedback error:", err);
    }
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    const feedbacks = getLocalSpeakingFeedback();
    const newFeedback: PersistedSpeakingFeedback = {
      id: generatedId,
      speaking_attempt_id: input.speakingAttemptId,
      prompt: input.prompt,
      category: input.category,
      user_text: input.userText,
      corrected_version: input.correctedVersion,
      academic_version: input.academicVersion,
      grammar_issues: input.grammarIssues,
      vocabulary_suggestions: input.vocabularySuggestions,
      stronger_academic_phrases: input.strongerAcademicPhrases,
      suggested_review_items: input.suggestedReviewItems,
      overall_feedback: input.overallFeedback,
      next_practice_prompt: input.nextPracticePrompt,
      created_at: timestamp,
    };
    feedbacks.push(newFeedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  }
  return generatedId;
}

export function getLocalSpeakingFeedback(): PersistedSpeakingFeedback[] {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(FEEDBACK_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export async function getSpeakingFeedbackList(userId?: string): Promise<PersistedSpeakingFeedback[]> {
  const client = supabase;
  if (client && userId) {
    try {
      const { data, error } = await client
        .from("speaking_feedback")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          speaking_attempt_id: d.speaking_attempt_id,
          prompt: d.prompt,
          category: d.category,
          user_text: d.user_text,
          corrected_version: d.corrected_version,
          academic_version: d.academic_version,
          grammar_issues: d.grammar_issues || [],
          vocabulary_suggestions: d.vocabulary_suggestions || [],
          stronger_academic_phrases: d.stronger_academic_phrases || [],
          suggested_review_items: d.suggested_review_items || [],
          overall_feedback: d.overall_feedback,
          next_practice_prompt: d.next_practice_prompt,
          created_at: d.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Supabase getSpeakingFeedbackList failed, reading locally:", err);
    }
  }

  return getLocalSpeakingFeedback().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
