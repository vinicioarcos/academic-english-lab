export type GrammarNote = {
  id: string;
  title: string;
  explanation: string;
  rule: string;
  examples: string[];
  commonMistake: string;
};

export type VocabularyItem = {
  id: string;
  word: string;
  translation: string;
  domain: string;
  partOfSpeech: string;
  examples: string[];
  commonMistake: string;
};

export type Book = {
  id: string;
  title: string;
  description: string;
  notebooks: Notebook[];
};

export type Notebook = {
  id: string;
  title: string;
  level: string;
  theory: string;
  phrases: string[];
  exercises: Exercise[];
};

export type Exercise = {
  id: string;
  type: "translation" | "correction" | "active-recall";
  prompt: string;
  expectedAnswer: string;
  feedback: string;
};
