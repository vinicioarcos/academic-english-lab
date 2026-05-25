export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkAnswer(userAnswer: string, expectedAnswer: string) {
  return normalizeAnswer(userAnswer) === normalizeAnswer(expectedAnswer);
}
