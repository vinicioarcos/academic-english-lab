# CHANGELOG

## 1.1.0

- **Preparación para Producción, Despliegue y Limpieza del Repositorio (Fase 11):**
  - **Limpieza del Repositorio:** Auditoría de la estructura de archivos, eliminación de variables obsoletas y verificación de no tener restos temporales ni dead components.
  - **Soporte de API Key Dual:** Actualización de `apps/web/lib/ai.ts` para resolver la API Key de Gemini desde `GOOGLE_API_KEY` o `GEMINI_API_KEY` indistintamente, mejorando la compatibilidad de hosting.
  - **Guía de Despliegue en Vercel:** Creación de [docs/DEPLOYMENT_VERCEL.md](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/docs/DEPLOYMENT_VERCEL.md) con configuraciones específicas de directorio raíz (`apps/web`), comandos de instalación, variables de entorno y solución de problemas.
  - **Guía de Configuración de Supabase:** Creación de [docs/SUPABASE_SETUP.md](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/docs/SUPABASE_SETUP.md) explicando la creación de proyectos, carga del esquema SQL, triggers de base de datos y fallbacks locales automáticos en almacenamiento local.
  - **Lista de Control de Calidad Final:** Creación de [docs/FINAL_QA_CHECKLIST.md](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/docs/FINAL_QA_CHECKLIST.md) con pasos interactivos exhaustivos para certificar la responsividad y flujos funcionales del MVP.
  - **Documentación del Entorno:** Actualización de `apps/web/.env.example` estructurando y describiendo las variables locales y de Supabase para mayor claridad de puesta en marcha.

## 1.0.0

- **UX Polish, Sistema de Diseño & Refinamiento del Flujo de Aprendizaje (Fase 10):**
  - **Componentes UI Reutilizables:** Creación de componentes modulares y ligeros (`SectionHeader`, `MetricCard`, `EmptyState`, `LoadingState`, `ProgressBadge`, `ReviewStateBadge`, `ActionPanel`, `OnboardingHint`).
  - **Reestructuración del Dashboard:** Jerarquía visual optimizada con un panel dinámico de **Acción Recomendada** que guía al usuario inteligentemente (repasos -> errores -> expresión oral -> importador), sugerencias de onboarding estructuradas bilingüemente y widgets analíticos.
  - **Refactorización de Práctica Activa (SRS):** Integración de `ReviewStateBadge` en la visualización del mazo, progreso del repaso diario con `ProgressBadge` y control de estados vacíos con `EmptyState`.
  - **Mejoras en Expresión Oral:** Implementación de un contador de sesión activo de grabaciones diarias (`X/3 grabaciones hoy`) para fomentar el hábito constante.
  - **Mejoras en el Importador:** Adición de estados de carga explícitos con `LoadingState` y de pantallas iniciales vacías estilizadas con `EmptyState` en la columna de resultados.
  - **QA & Estabilización:** Verificación y compilación final exitosa de la aplicación en Next.js sin errores de TypeScript ni linter.

## 0.9.0

- **Importador de Contenido Académico (`/importer`):**
  - **Página de Importación:** Creación de una interfaz interactiva y adaptativa de dos columnas para pegar textos sueltos o papers en inglés, español o mixto, y convertirlos instantáneamente con IA.
  - **API de Procesamiento de Contenido (`/api/import-content`):** Ruta API desacoplada con soporte de IA (Gemini/OpenAI) y fallback local robusto para modo offline.
  - **Validación Estricta con Zod:** Esquemas para estructurar las respuestas bilingües con resúmenes explicativos, tablas de vocabulario, notas de gramática y estilo, fraseología, ejercicios y prompts de habla.
  - **Práctica Interactiva en Importer:** Integración del componente `ExerciseCard` permitiendo interactuar con los ejercicios de forma inline, computando aciertos e inyectando errores en el Mistake Tracker.
  - **Integración SRS Directa:** Botones "+ SRS" para registrar de forma instantánea términos de vocabulario, reglas gramaticales, fraseología y prompts de habla en el mazo de repaso.
  - **Generación Dinámica de Cuadernos:** Botón "Abrir como Cuaderno" que empaqueta las secciones en un formato de cuaderno compatible y las precarga de forma reactiva al redirigir al usuario a la página de `/notebooks`.
  - **Navegación:** Adición del enlace en la barra lateral utilizando la iconografía de Lucide `FileUp`.

## 0.8.0

- **Feedback de IA para Expresión Oral (`/speaking`):**
  - **Transcripción y Resumen:** Campo de texto opcional agregado para que el usuario escriba la transcripción de su audio, resumen o lo que intentó decir.
  - **API de Feedback Académico (`/api/speaking-feedback`):** Creación del endpoint API desacoplado con soporte de IA y fallback de retroalimentación mockeada bilingüe si no hay API key configurada.
  - **Esquema de Validación Zod:** Validación estricta con Zod de la respuesta de la IA (versión corregida, versión académica mejorada, issues gramaticales, sugerencias de vocabulario, pronunciación, etc.).
  - **Persistencia en Base de Datos:** Actualización de `supabase/schema.sql` con la tabla `speaking_feedback` y lógica de guardado híbrido en `persistence.ts`.
  - **Integración con SRS (+ Repaso):** Botones directos para agregar las frases sugeridas, vocabulario y versiones académicas al mazo de repetición espaciada.
  - **Métricas en Dashboard:** Integración de total de feedbacks recibidos y error gramatical oral más frecuente en el panel de analíticas del Dashboard.
  - **QA y Build Exitoso:** Verificación y validación de compilación con Turbopack libre de errores.

## 0.7.0

- Implementación de la sección de Práctica de Expresión Oral y Pronunciación Académica (`/speaking`):
  - **Categorías Académicas:** Agrupación de prompts estructurados en Economía, Docencia Universitaria, Presentación de Papers, Sesión de Q&A en Congresos, Resumen de Abstract oral y Políticas Públicas.
  - **Grabadora de Audio Local:** Integración con la API nativa de `MediaRecorder` para iniciar, detener, reproducir, descartar y repetir grabaciones de voz directamente en el navegador.
  - **Autoevaluación Académica:** Formulario interactivo que evalúa Fluidez, Claridad, Confianza y Vocabulario Académico en escala 1-5, con campo para notas cualitativas de mejora.
  - **Integración con SRS:** Botón "+ Agregar a Repaso (SRS)" que permite enviar frases académicas o prompts directamente al mazo de repetición espaciada.
  - **Persistencia Híbrida:** Guardado automático en Supabase (tabla `speaking_attempts`) si el usuario está autenticado y conectado, cayendo a `localStorage` (`academic-english-lab-speaking`) en modo offline.
- Integración de analíticas de habla en el Dashboard:
  - Widget exclusivo "Métricas de Expresión Oral" que muestra: Intentos Totales de Habla, Promedio General de Autoevaluación, Fecha de Última Práctica y la Categoría más débil (menor puntaje promedio).
- Adición de la pestaña de navegación "Expresión Oral" con icono `Mic` en el Sidebar.
- **QA Pass de Expresión Oral:**
  - Implementación de la verificación reactiva en el botón "+ Agregar a Repaso (SRS)" para que refleje correctamente el estado real en el mazo a la carga de la página.
  - Corrección de un error ortográfico en el prompt SRS ("Speaking Promt" -> "Speaking Prompt").
  - Actualización de la documentación de pruebas de QA en `docs/QA_CHECKLIST.md`.

## 0.6.0

- Implementación del flujo de sesión de repaso diario en `/practice` con 3 estados interactivos:
  - **Inicio:** Pantalla de bienvenida con resumen de pendientes, próximas y mazo total.
  - **Activa:** Interfaz optimizada con barra de progreso visual ("Tarjeta X de Y") y atajos para calificar (Again, Hard, Good, Easy).
  - **Sumario:** Resumen final detallando tarjetas repasadas, tasa de retención (Good/Easy vs Again) y lista desglosada con calificaciones obtenidas.
- Incorporación de analíticas de aprendizaje avanzadas en el Dashboard principal:
  - Tarjetas de progreso dedicadas para: Intentos Totales, Tasa de Acierto, Errores Pendientes, Repasos Pendientes y Tarjetas Dominadas (Mastered).
  - Sección lateral con desglose de composición del mazo SRS por tipo de origen (Vocabulario, Gramática, Phrase Bank, Teoría IA, Errores de Ejercicios, Cuadernos de repaso).
  - Mapeo y análisis de tipos de errores comunes detectados por el Mistake Tracker.
  - Detección automática y representación visual de dominios académicos de mayor dificultad (weakest domains).
- Sincronización híbrida optimizada para Supabase Cloud y `localStorage` local/offline.
- **QA Pass & Estabilización:**
  - Creación de [QA_CHECKLIST.md](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/docs/QA_CHECKLIST.md) para verificar el flujo completo de aprendizaje end-to-end.
  - Corrección de bug en `/notebooks` para heredar correctamente metadatos de origen (`source_type`, `notebook_title`, `domain`, `level`) al agregar elementos de vocabulario, fraseología y gramática generados por la IA al mazo de repetición espaciada (SRS).
  - Corrección en la invocación de `ExerciseCard` en la previsualización del cuaderno de IA para inyectar correctamente los metadatos.


## 0.5.0


- Implementación del motor de repetición espaciada basado en el algoritmo SM-2 en `lib/spaced-repetition.ts`.
- Actualización de `supabase/schema.sql` para soportar la tabla `review_items` (sincronizada en la nube si Supabase está activo).
- Creación de una sección de práctica de mazo espaciado en `/practice` con botones interactivos de calificación (Again, Hard, Good, Easy) y soporte de active recall escrito.
- Integración de intentos fallidos y acertados en `ExerciseCard` para crear y programar automáticamente los repeticiones espaciadas correspondientes.
- Integración de tarjetas y estadísticas en el Dashboard (tarjeta "Repasos Pendientes") con enlace directo al ciclo de repaso.
- Integración de botones dinámicos "+ Agregar a Repaso" en `VocabularyCard`, `GrammarNoteCard` y en secciones del previsualizador de cuadernos autogenerados por IA para registrar manualmente vocabulario, expresiones y conceptos de gramática académica en el mazo.
- Prevención de duplicados de repaso mediante comprobación previa en base de datos Supabase y almacenamiento local.
- Preservación de metadatos de origen (`source_type`, `source_id`, `notebook_title`, `domain`, `level`) para cada tarjeta del mazo.
- Vista de "Mazo Completo" en `/practice` para examinar todas las tarjetas agrupadas y filtradas por estado (Pendientes hoy, Próximas, Dominadas, Olvidadas).



## 0.4.0

- Creación del generador de cuadernos con IA (/api/generate-notebook) con soporte opcional para Gemini y OpenAI.
- Definición de esquemas de validación estrictos con Zod (`lib/ai-schemas.ts`) para garantizar que la respuesta de la IA contenga teoría, vocabulario, fraseología, ejercicios y retroalimentación académica coherente.
- Creación de la interfaz de generación de cuadernos con IA en la página `/notebooks` con estados de carga, previsualización interactiva de teoría/vocabulario y tarjetas de práctica activa.
- Integración con el Mistake Tracker: enlace interactivo desde el Dashboard para generar automáticamente cuadernos de repaso a partir de los errores registrados del usuario.
- Actualización de `docs/PROMPTS.md` con los templates y estructuras de prompts estructurados utilizados para las llamadas a la IA.

## 0.3.0

- Integración de Supabase Cloud Database & Auth con soporte completo para variables de entorno locales.
- Actualización de `supabase/schema.sql` con las tablas `profiles`, `practice_attempts` y `user_mistakes`.
- Implementación de un `AuthContext` minimalista para controlar el estado de sesión sin romper el modo sin conexión (localStorage).
- Extensión del archivo `persistence.ts` para persistir automáticamente a la base de datos de Supabase si hay variables y el usuario tiene sesión, cayendo a localStorage si no.
- Controles de autenticación mínimos agregados en la página de Ajustes (formulario login/signup) y visualización del estado de conexión de la base de datos.

## 0.2.0

- Solución al problema de compilación con Tailwind CSS v4 mediante la degradación a v3 estable, garantizando compatibilidad con postcss.config.mjs y tailwind.config.ts.
- Implementación de persistencia híbrida en `persistence.ts` con almacenamiento local (`localStorage`) para registrar los intentos de práctica y los errores.
- Actualización de `ExerciseCard` para persistir automáticamente cada intento de respuesta y agregar soporte para reiniciar el ejercicio (botón "Reintentar").
- Dashboard dinámico conectado a la persistencia local de intentos, con estadísticas de frases practicadas y porcentaje de acierto.
- Creación de una tabla detallada de errores en el Dashboard (Mistake Tracker) que detalla el ejercicio original, la respuesta del usuario, la respuesta esperada, el tipo de error, la fecha exacta y el estado de reintento.
- Controles agregados en la página de Ajustes para limpiar las estadísticas locales del historial de práctica.

## 0.1.0

- Estructura inicial del proyecto.
- App Next.js con páginas principales.
- Datos semilla de gramática, vocabulario, libros y cuadernos.
- Motor básico de corrección exacta.
- API route simulada para generar cuadernos.
