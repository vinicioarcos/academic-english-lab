# TASKS

## Fase 1 — MVP local

- [x] Crear estructura de carpetas.
- [x] Crear app Next.js manual.
- [x] Crear páginas principales.
- [x] Crear datos semilla.
- [x] Crear motor básico de ejercicios.
- [x] Crear API route simulada.

## Fase 2 — Supabase

- [ ] Crear proyecto Supabase.
- [x] Ejecutar schema.sql.
- [ ] Cargar seed.sql.
- [x] Conectar Auth.
- [x] Persistir intentos de ejercicios.

## Fase 3 — IA

- [x] Elegir proveedor: OpenAI, Claude o Gemini.
- [x] Implementar generación real de cuadernos.
- [x] Validar salida con Zod.
- [x] Guardar generaciones.

## Fase 5 — Motor de Repetición Espaciada

- [x] Crear tabla review_items.
- [x] Implementar estados: new, learning, review, mastered, forgotten.
- [x] Mezclar vocabulario viejo y nuevo.
- [x] Evitar duplicados actualizando metadatos si el item ya existe.
- [x] Preservar metadatos de origen (tipo, ID, cuaderno, dominio, nivel).
- [x] Filtrar y diferenciar mazo en UI (pendientes hoy, próximas, dominadas, olvidadas).

## Fase 6 — Analíticas y UX del Mazo (Review Deck UX & Learning Analytics)

- [x] Crear flujo de sesión de repaso diario (idle, activa con progreso, sumario de sesión).
- [x] Agregar analíticas de aprendizaje avanzadas al Dashboard (intentos, tasa de acierto, errores pendientes, tarjetas dominadas).
- [x] Mostrar distribución del mazo agrupado por origen (vocabulario, gramática, frase bank, errores, teoría IA).
- [x] Clasificar errores comunes por tipo y detectar dominios de mayor dificultad (weakest domains).
- [x] Mantener compatibilidad total local (localStorage) y persistencia en Supabase.
- [x] Realizar paso de QA, estabilización y corrección de bugs de metadatos.

## Fase 7 — Expresión Oral y Audio (Academic Speaking & Audio Practice)

- [x] Crear tabla `speaking_attempts` en `supabase/schema.sql`.
- [x] Implementar funciones de persistencia de intentos de expresión oral en `lib/persistence.ts`.
- [x] Diseñar página de Práctica de Expresión Oral en `/speaking` con grabadora MediaRecorder nativa.
- [x] Incorporar formulario de autoevaluación (fluidez, claridad, confianza, vocabulario 1-5) con campo de notas.
- [x] Integrar botón "+ Agregar a Repaso (SRS)" para registrar prompts de voz en el mazo de repaso.
- [x] Diseñar widget de métricas de Expresión Oral en el Dashboard (total, promedio, fecha y categoría débil).
- [x] Agregar enlace en el Sidebar con icono de Micrófono.
- [x] Compilar build de producción sin errores de compilación ni de TypeScript.
- [x] Realizar paso de QA enfocado para Expresión Oral y Audio, documentando en QA_CHECKLIST.md.

## Fase 8 — Feedback de IA para Expresión Oral (AI Speaking Feedback)

- [x] Crear tabla `speaking_feedback` en `supabase/schema.sql`.
- [x] Definir esquema de validación Zod para retroalimentación académica en `lib/ai-schemas.ts`.
- [x] Crear ruta API `/api/speaking-feedback` para procesar el texto transcrito.
- [x] Implementar fallback local en `lib/persistence.ts` e integración con el backend de IA en `lib/ai.ts`.
- [x] Extender la página `/speaking` para ingresar transcripción opcional y solicitar retroalimentación.
- [x] Mostrar comparativa de texto original, versión corregida y versión académica con sugerencias.
- [x] Integrar botones "+ SRS" para agregar sugerencias gramaticales, vocabulario y frases al mazo.
- [x] Mostrar métricas en el Dashboard (total de feedbacks de IA y error gramatical oral común).
- [x] Compilar build Next.js sin errores de TypeScript o Turbopack.
- [x] Actualizar documentación de prompts, changelog, qa checklist y walkthrough.

## Fase 9 — Importador de Contenido Académico (Academic Content Importer)

- [x] Crear ruta API `/api/import-content/route.ts` con validación Zod y registro de telemetría.
- [x] Definir esquemas de validación Zod (`ImportedContentSchema` etc.) en `lib/ai-schemas.ts`.
- [x] Implementar llamadas a la IA y mock fallback bilingüe de economía en `lib/ai.ts`.
- [x] Crear la página del Importador de Contenido en `/importer` con grilla interactiva de dos columnas.
- [x] Integrar botones "+ SRS" para registrar palabras, reglas gramaticales, expresiones y prompts de habla en el mazo.
- [x] Integrar botón "Abrir como Cuaderno" para empaquetar y pre-cargar el material como cuaderno activo en `/notebooks`.
- [x] Añadir enlace al Importador con el icono de Lucide `FileUp` en la barra lateral.
- [x] Ejecutar build Next.js sin errores de TypeScript.
- [x] Actualizar documentación de prompts, changelog, qa checklist y walkthrough.

## Fase 10 — UX Polish, Sistema de Diseño & Refinamiento del Flujo de Aprendizaje

- [x] Crear componentes UI ligeros y reutilizables (`SectionHeader`, `MetricCard`, `EmptyState`, `LoadingState`, `ProgressBadge`, `ReviewStateBadge`, `ActionPanel`, `OnboardingHint`).
- [x] Reestructurar Dashboard agregando panel de Acción Recomendada dinámico y pasos de onboarding bilingües.
- [x] Refactorizar la página de Práctica Activa (mazo SRS) con badges de estado, barra de progreso y EmptyState.
- [x] Implementar contador de sesión activo de grabaciones en la página de Expresión Oral (`X/3 grabaciones hoy`).
- [x] Agregar estados de carga (`LoadingState`) y de inicio vacío (`EmptyState`) en el Importador de Contenido.
- [x] Validar build de producción sin errores de TypeScript o linter.
- [x] Actualizar documentación general (Changelog, Tasks, QA Checklist, Walkthrough).

## Fase 11 — Preparación para Producción, Despliegue y Limpieza del Repositorio

- [x] Auditar estructura del repositorio y remover dependencias redundantes o archivos de desarrollo sobrantes.
- [x] Crear la guía de despliegue en Vercel (`docs/DEPLOYMENT_VERCEL.md`).
- [x] Crear la guía de configuración e inicialización de Supabase (`docs/SUPABASE_SETUP.md`).
- [x] Crear la lista de verificación de calidad final (`docs/FINAL_QA_CHECKLIST.md`).
- [x] Documentar detalladamente variables de entorno y claves alternativas para Gemini en `.env.example`.
- [x] Validar build Next.js final en producción sin errores ni advertencias de compilador.
- [x] Actualizar documentación general e historiales de desarrollo.
