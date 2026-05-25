import { z } from "zod";

export const ExerciseTypeSchema = z.enum([
  "translate_to_english",
  "fill_in_the_blank",
  "correct_the_mistake",
  "rewrite_academically",
  "active_recall",
]);

export const GeneratedExerciseSchema = z.object({
  id: z.string(),
  type: ExerciseTypeSchema,
  prompt: z.string().min(1),
  expectedAnswer: z.string().min(1),
  feedback: z.string().min(1),
});

export const VocabularyItemSchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  definition: z.string().min(1),
  example: z.string().min(1),
});

export const AINotebookSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  level: z.string(),
  domain: z.string(),
  theoryBlocks: z.array(z.string()),
  vocabularyItems: z.array(VocabularyItemSchema),
  phraseBank: z.array(z.string()),
  exercises: z.array(GeneratedExerciseSchema),
  reviewItems: z.array(z.string()),
});

export type AINotebook = z.infer<typeof AINotebookSchema>;
export type GeneratedExercise = z.infer<typeof GeneratedExerciseSchema>;
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;

export const SpeakingFeedbackSchema = z.object({
  correctedVersion: z.string().min(1),
  academicVersion: z.string().min(1),
  grammarIssues: z.array(z.string()),
  vocabularySuggestions: z.array(
    z.object({
      word: z.string(),
      suggestion: z.string(),
      translation: z.string(),
    })
  ),
  pronunciationTipsGeneral: z.array(z.string()),
  strongerAcademicPhrases: z.array(z.string()),
  suggestedReviewItems: z.array(z.string()),
  overallFeedback: z.string().min(1),
  nextPracticePrompt: z.string().min(1),
});

export type SpeakingFeedback = z.infer<typeof SpeakingFeedbackSchema>;

export const ImportedGrammarNoteSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  rule: z.string().min(1),
  examples: z.array(z.string()),
  commonMistake: z.string().optional(),
});

export const ImportedSpeakingPromptSchema = z.object({
  prompt: z.string().min(1),
  translation: z.string().min(1),
  context: z.string().min(1),
});

export const ImportedContentSchema = z.object({
  detectedTopic: z.string().min(1),
  academicSummary: z.string().min(1),
  vocabularyItems: z.array(VocabularyItemSchema),
  grammarNotes: z.array(ImportedGrammarNoteSchema),
  phraseBank: z.array(z.string()),
  exercises: z.array(GeneratedExerciseSchema),
  suggestedSpeakingPrompts: z.array(ImportedSpeakingPromptSchema),
  suggestedReviewItems: z.array(z.string()),
});

export type ImportedGrammarNote = z.infer<typeof ImportedGrammarNoteSchema>;
export type ImportedSpeakingPrompt = z.infer<typeof ImportedSpeakingPromptSchema>;
export type ImportedContent = z.infer<typeof ImportedContentSchema>;

