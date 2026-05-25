import { Book, GrammarNote, VocabularyItem } from "./types";

export const grammarNotes: GrammarNote[] = [
  {
    id: "present-simple-academic",
    title: "Present simple para explicar teorías y modelos",
    explanation: "Se usa para describir relaciones generales, resultados estables, modelos y conceptos.",
    rule: "Subject + verb + complement. Con sujeto singular, el verbo lleva -s.",
    examples: [
      "The model estimates the probability of poverty.",
      "Education reduces the probability of being poor.",
      "The graph shows a negative relationship."
    ],
    commonMistake: "The model estimate... → The model estimates..."
  },
  {
    id: "hedging",
    title: "Hedging académico",
    explanation: "Sirve para no sonar dogmático. En papers se evita afirmar como si uno fuera dueño de la verdad absoluta.",
    rule: "Usa may, might, could, suggests, appears to, is associated with.",
    examples: [
      "The results suggest that education is associated with lower poverty.",
      "This finding may reflect labor market differences.",
      "The coefficient appears to be statistically significant."
    ],
    commonMistake: "Decir siempre proves. En investigación empírica suele ser mejor suggests o indicates."
  }
];

export const vocabularyItems: VocabularyItem[] = [
  {
    id: "estimate",
    word: "estimate",
    translation: "estimar",
    domain: "Econometrics",
    partOfSpeech: "verb / noun",
    examples: [
      "We estimate the effect of schooling on poverty.",
      "The estimate is statistically significant."
    ],
    commonMistake: "No confundir estimate con calculate. Estimate implica inferencia o aproximación estadística."
  },
  {
    id: "findings",
    word: "findings",
    translation: "hallazgos/resultados",
    domain: "Research Writing",
    partOfSpeech: "noun",
    examples: [
      "The findings are consistent with previous literature.",
      "These findings suggest that informality remains persistent."
    ],
    commonMistake: "No traducir literalmente como cosas encontradas. En papers significa hallazgos de investigación."
  },
  {
    id: "significant",
    word: "significant",
    translation: "significativo",
    domain: "Academic Writing",
    partOfSpeech: "adjective",
    examples: [
      "The coefficient is statistically significant at the 5 percent level.",
      "There is a significant difference between urban and rural areas."
    ],
    commonMistake: "No usar significative. La forma correcta es significant."
  }
];

export const books: Book[] = [
  {
    id: "econometrics",
    title: "English for Econometrics",
    description: "Cuadernos para explicar modelos, datos, coeficientes y resultados.",
    notebooks: [
      {
        id: "probit-model",
        title: "Explaining a Probit Model",
        level: "B1-B2",
        theory: "A Probit model is used when the dependent variable is binary. En inglés académico conviene decir the probability of...",
        phrases: [
          "The dependent variable is binary.",
          "The model estimates the probability of poverty.",
          "The marginal effects indicate the change in probability."
        ],
        exercises: [
          {
            id: "ex1",
            type: "translation",
            prompt: "El modelo estima la probabilidad de pobreza.",
            expectedAnswer: "The model estimates the probability of poverty.",
            feedback: "Usa estimates porque the model es sujeto singular en present simple."
          },
          {
            id: "ex2",
            type: "correction",
            prompt: "Correct: The results are significative.",
            expectedAnswer: "The results are statistically significant.",
            feedback: "En inglés académico se usa significant, no significative."
          }
        ]
      }
    ]
  },
  {
    id: "teaching",
    title: "English for Academic Teaching",
    description: "Frases para dictar clases, explicar conceptos y guiar estudiantes.",
    notebooks: [
      {
        id: "opening-class",
        title: "Opening an Economics Class",
        level: "A2-B1",
        theory: "Para iniciar una clase, usa estructuras simples y directas.",
        phrases: [
          "Today we are going to discuss...",
          "The main objective of this class is...",
          "Let me give you an example."
        ],
        exercises: [
          {
            id: "ex3",
            type: "translation",
            prompt: "Hoy vamos a discutir la relación entre educación y pobreza.",
            expectedAnswer: "Today we are going to discuss the relationship between education and poverty.",
            feedback: "Going to es natural para anunciar el plan de la clase."
          }
        ]
      }
    ]
  }
];
