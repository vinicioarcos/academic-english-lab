# AGENTS.md — Academic English Lab

## Propósito del proyecto
Construir una plataforma web para aprender inglés académico con enfoque en economía, docencia universitaria, investigación, escritura académica y práctica activa.

La app debe funcionar como sistema personal de aprendizaje: gramática, vocabulario, biblioteca de libros/cuadernos, generación de ejercicios con IA, corrección detallada y repetición espaciada.

## Regla principal
No construir una app genérica de idiomas. Todo debe estar orientado a inglés académico para economistas, docentes e investigadores hispanohablantes.

## Agentes del proyecto

### 1. Product Owner Agent
Responsable de mantener el alcance del MVP.
Debe evitar crecimiento desordenado de funcionalidades.
Prioridades:
- Dashboard
- Grammar
- Vocabulary
- Library
- Notebooks
- Practice Engine
- Mistake Tracker
- AI Notebook Generator

### 2. Pedagogy Agent
Responsable del método de aprendizaje.
Debe garantizar:
- explicación en español
- regla simple
- estructura mental de la frase
- ejemplos repetidos
- active recall
- corrección inmediata
- repetición espaciada
- aplicación académica

### 3. Academic English Agent
Responsable del contenido de inglés académico.
Dominios:
- teaching economics
- econometrics
- public policy
- labor economics
- education economics
- development economics
- research writing
- conference speaking

### 4. Exercise Engine Agent
Responsable de los ejercicios.
Tipos de ejercicios:
- multiple choice
- fill in the blank
- translate into English
- correct the mistake
- rewrite academically
- sentence builder
- active recall
- mini speaking task
- mini writing task

### 5. AI Integration Agent
Responsable de la conexión con proveedores de IA.
Debe diseñar rutas API desacopladas para usar:
- OpenAI / Codex
- Claude
- Gemini
- Antigravity workflows

Reglas:
- validar respuestas JSON con Zod
- registrar generaciones en ai_generations
- nunca confiar ciegamente en la respuesta de IA
- devolver errores claros

### 6. Frontend UI Agent
Responsable de interfaz.
Estilo:
- limpio
- académico
- sobrio
- minimalista
- estilo MIT/Springer
- navegación simple

Debe evitar interfaces infantiles tipo app genérica de idiomas.

### 7. Database Agent
Responsable de Supabase/PostgreSQL.
Tablas clave:
- profiles
- grammar_notes
- vocabulary_items
- books
- notebooks
- notebook_blocks
- exercises
- exercise_attempts
- review_items
- user_errors
- ai_generations

### 8. QA Agent
Responsable de pruebas.
Debe revisar:
- TypeScript sin errores
- npm run build
- rutas funcionales
- componentes reutilizables
- seed data válido
- endpoints API estables

### 9. Documentation Agent
Responsable de documentación.
Debe mantener:
- README.md
- AGENTS.md
- TASKS.md
- CHANGELOG.md
- PRODUCT_BRIEF.md
- PROMPTS.md
- CLAUDE.md
- GEMINI.md
- CODEX.md
- ANTIGRAVITY.md

## Flujo recomendado de trabajo
1. Leer README.md y PRODUCT_BRIEF.md.
2. Revisar AGENTS.md.
3. Elegir una tarea de TASKS.md.
4. Implementar cambios pequeños.
5. Ejecutar validaciones.
6. Actualizar CHANGELOG.md.
7. Documentar decisiones relevantes.

## Prohibiciones
- No copiar contenido de YouTube ni de cursos propietarios.
- No construir funciones sin relación con inglés académico.
- No mezclar lógica de IA directamente en componentes UI.
- No guardar claves API en el repositorio.
- No modificar muchos módulos a la vez sin necesidad.
