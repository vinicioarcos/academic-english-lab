# Final QA Checklist — Academic English Lab

Este documento sirve como la lista de verificación final y exhaustiva para validar el estado de preparación para producción, accesibilidad y estabilidad de todos los componentes y flujos de aprendizaje en la plataforma.

---

## 📋 Módulos y Flujos Funcionales

### 1. Dashboard & Analíticas
- [ ] **Acción Recomendada Dinámica:** Comprobar que el cartel superior guíe al usuario al paso correcto:
  - Repasos pendientes $\rightarrow$ "Iniciar Repaso" (`/practice`).
  - Sin repasos pero con errores $\rightarrow$ "Generar Cuaderno" (`/notebooks?reviewMistakes=true`).
  - Sin repasos ni errores $\rightarrow$ "Comenzar Práctica Oral" (`/speaking`) o "Importar Contenido" (`/importer`).
- [ ] **Indicadores Métricos (MetricCard):** Comprobar que se calculan y renderizan correctamente:
  - Intentos Totales.
  - Tasa de Acierto (%).
  - Errores Pendientes.
  - Repasos Pendientes (SRS due).
  - Tarjetas Dominadas (Mastered).
- [ ] **Desglose de Composición del Mazo:** Verificar que se diferencien tarjetas por origen (Vocabulario, Gramática, Expresiones, Teoría, Ejercicios fallidos, Cuadernos de IA).
- [ ] **Mistake Tracker:** Comprobar que la grilla o tabla de errores lista de manera descendente por fecha, muestra inputs fallidos y correctos, clasifica por tipo y permite marcar como "resuelto" reactivamente.
- [ ] **Dominios Críticos y Análisis de Errores:** Validar la visualización del dominio más débil basado en SRS y las barras de porcentajes de tipos de error.

### 2. Gramática Académica (`/grammar`)
- [ ] **Exploración de Reglas:** Verificar la lectura de notas, ejemplos estandarizados y errores de estilo académico vinculados a hispanohablantes.
- [ ] **Sincronización SRS:** Validar que el botón "+ Agregar a Repaso" inserte la tarjeta en el mazo y actualice el estado a "✓ En Mazo".

### 3. Vocabulario por Dominio (`/vocabulary`)
- [ ] **Filtros de Dominio:** Cambiar entre Econometría, Docencia, Escritura y Presentaciones, verificando la carga instantánea.
- [ ] **Sincronización SRS:** Comprobar que al agregar una palabra se guarde con su traducción, definición y ejemplo como guía de respuesta en el mazo.

### 4. Biblioteca (`/library`) & Cuadernos (`/notebooks`)
- [ ] **Navegación:** Comprobar la visualización de libros y cuadernos predefinidos y la redirección correcta.
- [ ] **AI Notebook Generator:** 
  - Ingresar un tema y comprobar la llamada de carga.
  - Previsualizar bloques de teoría, vocabulario y expresiones.
  - Sincronizar items de IA al mazo SRS heredando metadatos de origen (título, nivel, dominio).
  - Resolver el bloque de ejercicios y verificar que las respuestas incorrectas entren al Mistake Tracker.

### 5. Importador de Contenido (`/importer`)
- [ ] **Formulario:** Ingresar textos académicos en español o inglés, seleccionar nivel y dominio, y pulsar generar.
- [ ] **Loading & Empty States:** Validar que se muestre el loader interactivo (`LoadingState`) al procesar, y la pantalla inicial vacía (`EmptyState`) antes de la entrada.
- [ ] **Tabs de Resultados:** Validar el correcto desglose de Resumen, Vocabulario, Gramática, Expresiones, Ejercicios (comportamiento de `<ExerciseCard />`) e instrucciones de Habla.
- [ ] **Integración SRS e Importer:** Guardar términos individuales en el mazo SRS y verificar que no se dupliquen.
- [ ] **Abrir como Cuaderno:** Pulsar el botón y validar la redirección reactiva a `/notebooks` con la carga limpia de los datos estructurados en cache.

### 6. Repaso Espaciado (SRS Practice - `/practice`)
- [ ] **Estados de Repaso (SM-2):**
  - **Inicio:** Pantalla con cantidades pendientes y botón de inicio.
  - **Activa:** Visualizar barra de progreso, botón para voltear la tarjeta y los 4 atajos de calificación (Again, Hard, Good, Easy) aplicando el algoritmo SM-2.
  - **Sumario:** Comprobar resumen de tarjetas repasadas, tasa de retención y desglose individual.
- [ ] **Mazo Completo:** Comprobar la visualización de todas las tarjetas y los filtros (Todos, Pendientes, Próximas, Dominadas, Olvidadas) con el badge `ReviewStateBadge` correcto.

### 7. Expresión Oral y Audio (`/speaking`)
- [ ] **Permisos del Micrófono:** Denegar/aceptar el acceso al micrófono y comprobar que la aplicación no se rompe y muestra alertas claras ante bloqueos.
- [ ] **Grabación MediaRecorder:** Grabar voz, detener la grabación, reproducir el audio grabado y descartar/grabar de nuevo sin excepciones de consola.
- [ ] **Autoevaluación:** Calificar fluidez, claridad, confianza y léxico de 1 a 5, redactar notas de mejora y guardar el intento con éxito.
- [ ] **Contador de Sesión:** Comprobar que el badge superior `"Grabaciones hoy: X / 3"` incremente tras guardar.
- [ ] **SRS:** Comprobar que se inyecte el prompt de voz como tarjeta al mazo SRS.

### 8. Feedback de IA para Expresión Oral
- [ ] **Análisis de Transcripción:** Escribir un resumen del audio y solicitar feedback.
- [ ] **Loader & Error Handling:** Mostrar el indicador de carga y manejar errores de validación JSON.
- [ ] **Comparativas Visuales:** Renderizar la versión corregida, la académica sugerida, los issues gramaticales, vocabulario y frases recomendadas.
- [ ] **SRS Sync:** Validar la adición de frases académicas sugeridas directamente al mazo.

---

## 🔄 Persistencia y Fallbacks

- [ ] **Modo Local (localStorage):** Limpiar cookies/claves API, correr en desarrollo y comprobar que todos los intentos, errores, mazo SRS y grabaciones persistan tras recargar la página.
- [ ] **Modo Supabase:** Configurar claves locales de Supabase en `.env.local`, registrar una cuenta en Ajustes, realizar repasos y validar que los datos se reflejen en Supabase Cloud.
- [ ] **Modo Mock Fallback:** Configurar `AI_PROVIDER=mock` o quitar claves API de IA y verificar que la generación de cuadernos, importer y feedback hablen con datos estructurados locales sin fallar.

---

## 🎨 Layout & Compilación

- [ ] **Diseño Responsivo:** 
  - Probar la vista móvil (Sidebar colapsable o adaptativo, tablas con truncado horizontal y grillas de una sola columna).
  - Probar la vista en tablet y pantallas de alta resolución.
- [ ] **Compilación de Producción:** Correr `npm --prefix apps/web run build` y asegurar la compilación completa exitosa de Next.js libre de advertencias y errores de TypeScript.
