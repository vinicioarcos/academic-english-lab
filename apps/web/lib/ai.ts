import { AINotebook, AINotebookSchema, SpeakingFeedback, SpeakingFeedbackSchema, ImportedContent, ImportedContentSchema } from "./ai-schemas";

export type NotebookRequest = {
  topic: string;
  level: string;
  domain: string;
  userMistakes?: string[];
  targetSkill?: string;
};

export async function generateNotebookDraft(input: NotebookRequest): Promise<AINotebook> {
  const provider = process.env.AI_PROVIDER || "mock";
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const promptText = `Crea un cuaderno estructurado de inglés académico para un docente o investigador hispanohablante de economía.
Tema a tratar: "${input.topic}"
Nivel objetivo: "${input.level}"
Dominio: "${input.domain}"
${input.targetSkill ? `Habilidad clave: "${input.targetSkill}"` : ""}
${input.userMistakes && input.userMistakes.length > 0 ? `Errores del usuario para repasar/corregir:\n${input.userMistakes.map(m => `- ${m}`).join("\n")}` : ""}

Devuelve estrictamente un objeto JSON que cumpla el siguiente esquema de TypeScript:
{
  "title": string,
  "description": string,
  "level": string,
  "domain": string,
  "theoryBlocks": string[], // Bloques de teoría corta en español explicando la gramática y el estilo académico con ejemplos.
  "vocabularyItems": {
    "word": string,
    "translation": string,
    "definition": string, // En inglés simple
    "example": string // Ejemplo en contexto académico de economía
  }[],
  "phraseBank": string[], // Listado de 3 o 4 frases clave en inglés académico listas para usar.
  "exercises": {
    "id": string,
    "type": "translate_to_english" | "fill_in_the_blank" | "correct_the_mistake" | "rewrite_academically" | "active_recall",
    "prompt": string,
    "expectedAnswer": string,
    "feedback": string // Retroalimentación en español explicando la regla pedagógica detrás de la respuesta correcta.
  }[], // Crea exactamente 3 ejercicios.
  "reviewItems": string[] // Puntos rápidos en español para recordar.
}

Crucial: Devuelve solo el JSON válido, sin delimitadores de markdown (\`\`\`json). Las explicaciones y feedbacks deben estar en español.`;

  if (provider === "google" && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return AINotebookSchema.parse(parsed);
      }
    } catch (err) {
      console.error("Gemini API call failed, using fallback:", err);
    }
  }

  if (provider === "openai" && openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: promptText }],
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return AINotebookSchema.parse(parsed);
      }
    } catch (err) {
      console.error("OpenAI API call failed, using fallback:", err);
    }
  }

  // Fallback to high-quality mock notebook
  return generateMockNotebook(input);
}

function generateMockNotebook(input: NotebookRequest): AINotebook {
  return {
    title: `Academic English: ${input.topic}`,
    description: `Cuaderno autogenerado sobre ${input.topic} en el contexto de ${input.domain}.`,
    level: input.level,
    domain: input.domain,
    theoryBlocks: [
      `En el ámbito de ${input.domain}, para discutir "${input.topic}", es fundamental utilizar estructuras formales y precisas.`,
      `Evita el uso de vocabulario informal y prioriza verbos activos y construcciones pasivas cuando sea apropiado.`
    ],
    vocabularyItems: [
      {
        word: "estimate",
        translation: "estimar",
        definition: "A simplified description, especially a mathematical one, of a system or process.",
        example: "The regression model estimates the impact of the policy."
      },
      {
        word: "significant",
        translation: "significativo",
        definition: "A numerical or measurable factor forming one of a set that defines a system.",
        example: "The estimated parameters are statistically significant."
      }
    ],
    phraseBank: [
      `The model estimates the relationship between...`,
      `We specify a regression model to test...`,
      `The parameters are consistent with economic theory.`
    ],
    exercises: [
      {
        id: `ex-mock-1-${Date.now()}`,
        type: "translate_to_english",
        prompt: "El modelo estima la probabilidad de pobreza.",
        expectedAnswer: "The model estimates the probability of poverty.",
        feedback: "Recuerda usar la tercera persona singular (estimates) para el sujeto 'the model'."
      },
      {
        id: `ex-mock-2-${Date.now()}`,
        type: "correct_the_mistake",
        prompt: "Correct: The results are significative.",
        expectedAnswer: "The results are statistically significant.",
        feedback: "En inglés académico se prefiere 'significant' sobre 'significative'."
      },
      {
        id: `ex-mock-3-${Date.now()}`,
        type: "rewrite_academically",
        prompt: "Make academic: We think that inflation will go up.",
        expectedAnswer: "Our findings suggest that inflation is likely to increase.",
        feedback: "Usa técnicas de 'hedging' como 'suggest' e 'is likely to' para sonar más académico."
      }
    ],
    reviewItems: [
      "Utilizar present simple para modelos y hechos estables.",
      "Evitar el adjetivo 'significative' en favor de 'significant'."
    ]
  };
}

export type SpeakingFeedbackRequest = {
  prompt: string;
  category: string;
  userText: string;
  level: string;
  domain?: string;
};

export async function generateSpeakingFeedback(input: SpeakingFeedbackRequest): Promise<SpeakingFeedback> {
  const provider = process.env.AI_PROVIDER || "mock";
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const promptText = `Analiza la transcripción hablada de un docente o investigador en economía que practica inglés académico.
Prompt de habla original: "${input.prompt}"
Categoría: "${input.category}"
Nivel objetivo: "${input.level}"
Dominio: "${input.domain || "Economía"}"
Lo que el usuario intentó decir o su transcripción: "${input.userText}"

Devuelve estrictamente un objeto JSON que cumpla el siguiente esquema de TypeScript:
{
  "correctedVersion": string, // Versión corregida gramaticalmente manteniendo la simplicidad del habla
  "academicVersion": string, // Versión mejorada con estilo académico avanzado y hedging profesional
  "grammarIssues": string[], // Listado de problemas gramaticales encontrados y explicados en español
  "vocabularySuggestions": {
    "word": string, // Palabra original informal o errónea
    "suggestion": string, // Término académico sugerido
    "translation": string // Traducción al español
  }[],
  "pronunciationTipsGeneral": string[], // Consejos generales de pronunciación en español para las palabras clave de la frase
  "strongerAcademicPhrases": string[], // 2 o 3 frases académicas alternativas más fuertes y elegantes
  "suggestedReviewItems": string[], // Listado de frases cortas de aprendizaje listas para el mazo de repaso (en inglés)
  "overallFeedback": string, // Retroalimentación y motivación pedagógica en español
  "nextPracticePrompt": string // Siguiente prompt o frase para seguir practicando un tema relacionado
}

Crucial: Devuelve solo el JSON válido, sin delimitadores de markdown (\`\`\`json). Las explicaciones y feedbacks deben estar en español.`;

  if (provider === "google" && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return SpeakingFeedbackSchema.parse(parsed);
      }
    } catch (err) {
      console.error("Gemini Speaking API call failed, using fallback:", err);
    }
  }

  if (provider === "openai" && openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: promptText }],
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return SpeakingFeedbackSchema.parse(parsed);
      }
    } catch (err) {
      console.error("OpenAI Speaking API call failed, using fallback:", err);
    }
  }

  return generateMockSpeakingFeedback(input);
}

function generateMockSpeakingFeedback(input: SpeakingFeedbackRequest): SpeakingFeedback {
  return {
    correctedVersion: `We estimate the model using OLS, controlling for individual fixed effects.`,
    academicVersion: `We employ an Ordinary Least Squares estimation framework while controlling for individual fixed effects.`,
    grammarIssues: [
      "Evita omitir la preposición 'for' al justificar los controles.",
      "Usa la forma verbal en participio 'controlling' para indicar una acción continua simultánea."
    ],
    vocabularySuggestions: [
      {
        word: "use",
        suggestion: "employ/utilize",
        translation: "emplear/utilizar"
      },
      {
        word: "like",
        suggestion: "such as",
        translation: "tal como"
      }
    ],
    pronunciationTipsGeneral: [
      "La palabra 'estimate' se pronuncia /ˈestɪmeɪt/ como verbo, pero /ˈestɪmət/ como sustantivo.",
      "Asegúrate de acentuar correctamente 'econometric' en la sílaba '-met-' /ˌekənəˈmetrɪk/."
    ],
    strongerAcademicPhrases: [
      "The empirical specification controls for individual fixed effects.",
      "To address potential endogeneity, we employ a fixed effects estimator."
    ],
    suggestedReviewItems: [
      "employ a fixed effects estimator",
      "estimate the model using OLS",
      "statistically significant at the one percent level"
    ],
    overallFeedback: `¡Buen intento! Tu estructura básica es comprensible, pero puedes sonar mucho más profesional utilizando verbos más formales como 'employ' en lugar de 'use'. La adición del control por efectos fijos está bien estructurada gramaticalmente.`,
    nextPracticePrompt: `Explain how fixed effects control for time-invariant unobserved heterogeneity.`
  };
}

export type ImportContentRequest = {
  content: string;
  language: "Spanish" | "English" | "Mixed";
  domain: string;
  level: string;
};

export async function generateImportedContent(input: ImportContentRequest): Promise<ImportedContent> {
  const provider = process.env.AI_PROVIDER || "mock";
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const promptText = `Eres un agente pedagógico experto en inglés académico.
Analiza el siguiente contenido de texto (puedes recibir apuntes, fragmentos de artículos, notas sueltas en español, inglés o mixto):
"""
${input.content}
"""

Idioma del texto recibido: ${input.language}
Dominio académico objetivo: ${input.domain}
Nivel objetivo: ${input.level}

Genera materiales de aprendizaje estructurados y bilingües. Devuelve estrictamente un objeto JSON que cumpla el siguiente esquema de TypeScript:
{
  "detectedTopic": string, // Tema detectado (en español)
  "academicSummary": string, // Breve resumen académico del texto en español (2-3 párrafos explicando los conceptos clave)
  "vocabularyItems": {
    "word": string, // Término o palabra en inglés académico
    "translation": string, // Traducción al español
    "definition": string, // Definición en inglés simple y formal
    "example": string // Ejemplo en inglés en contexto académico
  }[], // Genera de 3 a 5 términos de vocabulario clave
  "grammarNotes": {
    "title": string, // Título de la regla de gramática o estilo en español
    "explanation": string, // Explicación de la regla en español
    "rule": string, // Estructura o regla simplificada
    "examples": string[], // Ejemplos académicos en inglés que ilustren la regla (mínimo 2)
    "commonMistake": string // Error común que cometen los hispanohablantes (opcional)
  }[], // Genera de 1 a 2 notas gramaticales
  "phraseBank": string[], // 3 o 4 expresiones clave en inglés académico listas para usar extraídas o sugeridas a partir del texto
  "exercises": {
    "id": string, // Identificador único (ej: ex-import-1, ex-import-2)
    "type": "translate_to_english" | "fill_in_the_blank" | "correct_the_mistake" | "rewrite_academically" | "active_recall",
    "prompt": string, // El ejercicio (en español si es traducción, en inglés si es corrección/reescritura)
    "expectedAnswer": string, // Respuesta correcta en inglés académico
    "feedback": string // Retroalimentación pedagógica detallada en español explicando la regla
  }[], // Genera exactamente 3 ejercicios
  "suggestedSpeakingPrompts": {
    "prompt": string, // Prompt de expresión oral en inglés (ej: "Explain the main conclusion of the text...")
    "translation": string, // Traducción al español del prompt
    "context": string // Breve contexto bilingüe de cuándo se usaría esta frase en un entorno académico
  }[], // Genera 2 prompts de expresión oral sugeridos para debatir este texto
  "suggestedReviewItems": string[] // Puntos de repaso rápidos en español para recordar (3 o 4)
}

Crucial: Devuelve solo el JSON válido, sin delimitadores de markdown (\`\`\`json). Las explicaciones, resúmenes y feedbacks deben estar en español.`;

  if (provider === "google" && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return ImportedContentSchema.parse(parsed);
      }
    } catch (err) {
      console.error("Gemini Content Importer call failed, using fallback:", err);
    }
  }

  if (provider === "openai" && openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: promptText }],
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        return ImportedContentSchema.parse(parsed);
      }
    } catch (err) {
      console.error("OpenAI Content Importer call failed, using fallback:", err);
    }
  }

  return generateMockImportedContent(input);
}

function generateMockImportedContent(input: ImportContentRequest): ImportedContent {
  return {
    detectedTopic: `Análisis e Importación sobre ${input.domain}`,
    academicSummary: `Este contenido importado se centra en la aplicación de metodologías clave dentro del dominio de ${input.domain}. Se discuten las bases conceptuales para optimizar la redacción y argumentación científica, buscando un nivel de competencia de ${input.level}. A través de este análisis, el estudiante aprenderá a evitar el lenguaje coloquial y aplicar recursos retóricos formales propios de la literatura académica.`,
    vocabularyItems: [
      {
        word: "furthermore",
        translation: "además / por otra parte",
        definition: "In addition; besides (used to introduce a fresh point or an argument).",
        example: "The study identifies significant correlation; furthermore, it proposes a new causal link."
      },
      {
        word: "hypothesis",
        translation: "hipótesis",
        definition: "A proposed explanation made on the basis of limited evidence as a starting point for further investigation.",
        example: "We formulate a null hypothesis stating that the treatment effect is zero."
      },
      {
        word: "robustness",
        translation: "robustez",
        definition: "The quality of being strong and unlikely to fail or be influenced by outliers or specification changes.",
        example: "To verify the robustness of our results, we conduct several sensitivity analyses."
      }
    ],
    grammarNotes: [
      {
        title: "Uso de conectores de transición formales",
        explanation: "En la escritura académica inglesa, se prefieren conectores formales como 'furthermore', 'nevertheless' o 'consequently' al principio de la oración para dar cohesión y fluidez.",
        rule: "Conector de transición + coma (,) + sujeto + verbo.",
        examples: [
          "Consequently, the government implemented new fiscal reforms.",
          "Moreover, the sample size was expanded to ensure statistical validity."
        ],
        commonMistake: "Usar 'besides' o 'also' al inicio de oraciones formales en un paper."
      }
    ],
    phraseBank: [
      "Against this background, we argue that...",
      "This finding is consistent with the hypothesis that...",
      "Our estimation framework accounts for unobserved heterogeneity."
    ],
    exercises: [
      {
        id: `ex-import-1-${Date.now()}`,
        type: "translate_to_english",
        prompt: "Por lo tanto, la hipótesis nula no puede ser rechazada.",
        expectedAnswer: "Therefore, the null hypothesis cannot be rejected.",
        feedback: "Usa 'Therefore' como conector de consecuencia formal y 'cannot be rejected' en voz pasiva."
      },
      {
        id: `ex-import-2-${Date.now()}`,
        type: "correct_the_mistake",
        prompt: "Correct: We also tested the robustness but it was not strong.",
        expectedAnswer: "Additionally, we tested the robustness, but the results were inconclusive.",
        feedback: "Evita usar 'but it was not strong' e introduce formas académicas como 'inconclusive' o 'not statistically significant'."
      },
      {
        id: `ex-import-3-${Date.now()}`,
        type: "rewrite_academically",
        prompt: "Rewrite: We think that this causes endogeneity issues.",
        expectedAnswer: "Our analysis suggests that this may induce endogeneity concerns.",
        feedback: "Usa hedging ('suggests that', 'may') y terminología precisa ('induce concerns' en lugar de 'causes issues')."
      }
    ],
    suggestedSpeakingPrompts: [
      {
        prompt: "Summarize the primary arguments of the imported text in under one minute.",
        translation: "Resume los argumentos principales del texto importado en menos de un minuto.",
        context: "Útil para preparar un elevator pitch de tu investigación o defender tus ideas ante un comité."
      },
      {
        prompt: "Discuss potential limitations of the methodology described in the text.",
        translation: "Discute las posibles limitaciones de la metodología descrita en el texto.",
        context: "Te prepara para responder preguntas difíciles durante la sesión de Q&A de un congreso."
      }
    ],
    suggestedReviewItems: [
      "Usar pasiva para describir rechazo de hipótesis ('cannot be rejected').",
      "Preferir 'consequently' o 'therefore' sobre 'so' en textos de políticas públicas.",
      "Introducir 'may induce concerns' para matizar (hedging) afirmaciones causales."
    ]
  };
}
