# PROMPTS - Guía de Prompts del Sistema

## 1. Generar Cuaderno Académico Personalizado

Este prompt instruye al modelo de lenguaje (Gemini o GPT) para estructurar un cuaderno académico enfocado en economía, docencia y escritura científica, adaptado a hispanohablantes.

### Estructura del Prompt

```text
Crea un cuaderno estructurado de inglés académico para un docente o investigador hispanohablante de economía.
Tema a tratar: "{{topic}}"
Nivel objetivo: "{{level}}"
Dominio: "{{domain}}"
Habilidad clave: "{{targetSkill}}"
Errores del usuario para repasar/corregir:
{{userMistakes}}

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

Crucial: Devuelve solo el JSON válido, sin delimitadores de markdown (```json). Las explicaciones y feedbacks deben estar en español. Los ejemplos de vocabulario y frases deben estar en inglés académico avanzado.
```

### Reglas de Diseño del Prompt
1. **Idioma de Explicaciones:** Las explicaciones de teoría y retroalimentaciones (*feedback*) de ejercicios se escriben en **español** para afianzar el aprendizaje comparativo.
2. **Contexto Académico:** Las oraciones, ejemplos y ejercicios deben simular la estructura de *papers*, disertaciones econométricas o discursos universitarios reales.
3. **Validación:** El JSON devuelto es contrastado con un validador Zod en el backend del endpoint `/api/generate-notebook`.

## 2. Integración con el Motor de Repetición Espaciada (SRS)

Los elementos generados por la IA se integran con el motor SM-2 de la siguiente manera:
1. **Ejercicios:** El componente `ExerciseCard` intercepta las respuestas del usuario y llama a `upsertExerciseReview` para registrar el éxito o fracaso en el mazo de repaso.
2. **Vocabulario, Expresiones y Gramática:** La interfaz permite al usuario registrar explícitamente cualquier término del "Vocabulary Items", "Phrase Bank" o bloque de teoría en su mazo de repaso personal haciendo clic en "+ Repasar".

## 3. Uso de Analíticas de Aprendizaje en Prompts

Las estadísticas avanzadas del Dashboard (como los tipos de errores más comunes y los dominios académicos más débiles del usuario) sirven de contexto para personalizar el prompt de generación de cuadernos de repaso. Al generar cuadernos dinámicos enfocado en "Repaso de Errores Personales", el sistema prioriza los temas y habilidades donde las métricas revelan mayor dificultad.

## 4. Prompts de Expresión Oral (Speaking Practice)

La práctica de expresión oral cuenta con prompts predeterminados diseñados para cubrir las situaciones críticas de un investigador o docente en el ámbito internacional:
1. **Classroom English:** Enfocado en la articulación clara al iniciar clases, resumir objetivos y realizar preguntas interactivas.
2. **Econometrics:** Práctica del discurso preciso al describir especificaciones de modelos (ej. efectos fijos, OLS) y significancia de coeficientes.
3. **Research Presentation:** Resumen rápido de objetivos empíricos e instrucciones guiadas para referenciar figuras o tablas durante una conferencia.
4. **Conference Q&A:** Respuestas estructuradas y diplomáticas ante comentarios difíciles (ej. pruebas de robustez, endogeneidad).
5. **Academic Writing Oral Summary:** Elevator pitch oral del abstract del paper del usuario.
6. **Public Policy:** Práctica pasiva del inglés al describir la evaluación de impacto y predicciones de políticas públicas.

### Integración con SRS
Cualquier prompt de expresión oral complejo o frase académica difícil se puede añadir al mazo de repetición espaciada mediante el botón "+ Agregar a Repaso (SRS)" inyectando metadatos para que el usuario pueda practicar active recall y pronunciación de forma continua.

## 5. Feedback de IA para Expresión Oral (Speaking Feedback)

Este prompt se encarga de analizar la transcripción (o resumen escrito de lo que intentó decir) del habla del usuario, devolviendo un análisis estructurado y bilingüe para mejorar su estilo y precisión académica.

### Estructura del Prompt

```text
Analiza la transcripción hablada de un docente o investigador en economía que practica inglés académico.
Prompt de habla original: "{{prompt}}"
Categoría: "{{category}}"
Nivel objetivo: "{{level}}"
Dominio: "{{domain}}"
Lo que el usuario intentó decir o su transcripción: "{{userText}}"

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

Crucial: Devuelve solo el JSON válido, sin delimitadores de markdown (```json). Las explicaciones y feedbacks deben estar en español.
```

### Reglas de Diseño del Prompt
1. **Bilingüe:** Las versiones y sugerencias en inglés se acompañan de explicaciones y traducciones claras en **español** para optimizar la comprensión del usuario hispanohablante.
2. **Estilo Académico:** Incentiva el uso de *hedging* (ej. *suggest*, *likely*), terminología econométrica precisa y evita construcciones excesivamente informales del habla coloquial.
3. **SRS Directo:** El usuario puede seleccionar y añadir al mazo SRS: la versión corregida, sugerencias específicas de vocabulario, o las frases académicas alternativas de forma directa.

## 6. Importador de Contenido Académico (Content Importer)

Este prompt se encarga de analizar textos académicos en bruto (ej. notas de clases, resúmenes, papers) y estructurarlos en materiales pedagógicos interactivos con explicaciones en español y ejemplos avanzados en inglés.

### Estructura del Prompt

```text
Eres un agente pedagógico experto en inglés académico.
Analiza el siguiente contenido de texto (puedes recibir apuntes, fragmentos de artículos, notas sueltas en español, inglés o mixto):
"""
{{content}}
"""

Idioma del texto recibido: {{language}}
Dominio académico objetivo: {{domain}}
Nivel objetivo: {{level}}

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

Crucial: Devuelve solo el JSON válido, sin delimitadores de markdown (```json). Las explicaciones, resúmenes y feedbacks deben estar en español.
```

### Reglas de Diseño del Prompt
1. **Comprensión Bilingüe:** Transforma textos fragmentados o mal estructurados del usuario en resúmenes organizados en español, sirviendo como anclaje conceptual.
2. **Ejercicios Reutilizables:** Genera ejercicios del tipo `translate_to_english`, `correct_the_mistake` o `rewrite_academically` que son traducidos por el cliente Next.js al formato nativo del motor interactivo `ExerciseCard`.
3. **Conversión en Cuadernos:** El JSON estructurado es compatible con el mazo de repaso y puede ser convertido sobre la marcha en un Cuaderno de Estudio (`AINotebook`) guardado en caché de sesión para su carga reactiva.

