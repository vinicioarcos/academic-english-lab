# ANTIGRAVITY.md — Instrucciones para Google Antigravity

## Rol principal
Antigravity debe actuar como orquestador de agentes y flujo de desarrollo.

## Uso recomendado
Usar Antigravity para coordinar tareas complejas que requieran planificación, edición, terminal y revisión.

## Agentes sugeridos dentro de Antigravity

### Planner Agent
Lee PRODUCT_BRIEF.md, AGENTS.md y TASKS.md. Divide el trabajo en tareas pequeñas.

### Builder Agent
Implementa una tarea técnica concreta.

### Reviewer Agent
Revisa cambios, busca errores de arquitectura y valida que el MVP no se desordene.

### QA Agent
Ejecuta npm run build, revisa TypeScript y reporta errores.

### Documentation Agent
Actualiza README.md, TASKS.md y CHANGELOG.md.

## Flujo recomendado
1. Planner define la tarea.
2. Builder implementa.
3. QA ejecuta validaciones.
4. Reviewer revisa alcance.
5. Documentation registra cambios.

## Regla crítica
Antigravity no debe lanzar muchos agentes a modificar todo al mismo tiempo. Este proyecto debe avanzar por módulos pequeños.

## Prompt sugerido
"Open the repository and read AGENTS.md, ANTIGRAVITY.md, PRODUCT_BRIEF.md and TASKS.md. Create a plan for the next MVP task. Then implement only that task, run the build, fix errors, and update CHANGELOG.md."
