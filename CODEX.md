# CODEX.md — Instrucciones para OpenAI Codex

## Rol principal
Codex debe actuar como implementador técnico principal del MVP.

## Prioridades
1. Implementar componentes React/Next.js.
2. Mantener TypeScript limpio.
3. Crear API routes desacopladas.
4. Añadir validaciones con Zod.
5. Ejecutar build y corregir errores.

## Tareas ideales para Codex
- Crear páginas funcionales.
- Implementar componentes reutilizables.
- Conectar Supabase.
- Crear motor básico de ejercicios.
- Implementar endpoint /api/generate-notebook.
- Crear pruebas iniciales.

## Reglas de implementación
- Cambios pequeños y verificables.
- No meter IA real si no existe .env configurado.
- Usar mocks cuando falten claves API.
- Separar UI, datos, lógica e integración IA.
- Actualizar CHANGELOG.md después de cada avance.

## Comando sugerido de trabajo
"Lee CODEX.md, AGENTS.md y docs/TASKS.md. Implementa la siguiente tarea pendiente del MVP. Ejecuta npm run build y corrige errores antes de terminar."
