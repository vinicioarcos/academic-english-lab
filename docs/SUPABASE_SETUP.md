# Guía de Configuración de Supabase — Academic English Lab

Esta guía detalla los pasos necesarios para configurar y conectar una base de datos en la nube de Supabase con la aplicación Academic English Lab.

---

## 1. Crear un Proyecto en Supabase

1. Regístrate o inicia sesión en [Supabase](https://supabase.com/).
2. Haz clic en **New Project** y selecciona tu organización.
3. Configura los siguientes campos:
   - **Name:** `Academic English Lab` (o el nombre que prefieras).
   - **Database Password:** Elige una contraseña segura (guárdala, la necesitarás si usas accesos directos).
   - **Region:** Selecciona la región geográfica más cercana a tus usuarios (ej: `sa-east-1` o `us-east-1`).
4. Haz clic en **Create new project** y espera a que la base de datos se inicialice (suele tardar 1 o 2 minutos).

---

## 2. Ejecutar el Script de la Base de Datos (schema.sql)

Una vez que el proyecto esté listo, debemos inicializar las tablas, relaciones y políticas necesarias:

1. En el panel izquierdo de Supabase, navega al **SQL Editor** (icono con la etiqueta `SQL`).
2. Haz clic en **New query** (o usa una plantilla vacía).
3. Abre el archivo local [supabase/schema.sql](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/supabase/schema.sql) de este repositorio.
4. Copia todo su contenido y pégalo en el editor SQL de Supabase.
5. Haz clic en **Run** (en la esquina inferior derecha).
6. Verifica que la ejecución haya finalizado con éxito (`Success. No rows returned` o similar).

---

## 3. Tablas Requeridas en la Base de Datos

El script creará las siguientes tablas esenciales para el funcionamiento de la aplicación:

- **`profiles`:** Almacena la información de perfil del usuario, incluyendo su nombre (`full_name`), nivel de inglés predeterminado (`level`) y fecha de creación.
- **`practice_attempts`:** Registra cada respuesta o intento en las tarjetas de ejercicios del MVP (con campos para saber si fue correcto, el input enviado y feedback).
- **`user_mistakes`:** Controla los errores cometidos en los ejercicios (Mistake Tracker), detallando el ejercicio, la respuesta incorrecta enviada, la esperada y su estado de reintento (`pendiente` / `completado`).
- **`review_items`:** Contiene todas las tarjetas agregadas al mazo de repetición espaciada (SRS). Registra el algoritmo SM-2 (intervalo de días, factor de facilidad, racha de aciertos, fecha del próximo repaso y el estado cognitivo).
- **`speaking_attempts`:** Guarda el historial de grabaciones de voz y las autoevaluaciones orales (fluidez, claridad, confianza, vocabulario 1-5, notas escritas y la URL del audio).
- **`speaking_feedback`:** Registra las respuestas completas de feedback académico devueltas por la IA para las transcripciones y resúmenes orales de los usuarios.
- **`ai_generations`:** Bitácora que registra cada consulta de generación por IA de cuadernos, feedback o importación realizada por el usuario para llevar un registro de auditoría de costos/tokens.

---

## 4. Notas de Autenticación (Auth)

Academic English Lab utiliza el sistema de autenticación de Supabase (GoTrue) integrado en el cliente:

1. **Configuración de Proveedores:** Por defecto, el flujo de registro e inicio de sesión utiliza **Email/Password**.
2. **Confirmación de Email:** En un entorno de producción real, Supabase requiere que los usuarios confirmen su correo electrónico. Si deseas desactivar esto para pruebas rápidas:
   - Ve a **Project Settings** -> **Authentication**.
   - Busca la opción **Confirm email** y desactívala.
3. El sistema gestionará automáticamente la creación del perfil del usuario en la tabla `profiles` mediante un trigger interno de PostgreSQL que se activa tras un registro de usuario exitoso.

---

## 5. Funcionamiento del Fallback a Local Storage (Modo Offline)

Una de las características más potentes de la aplicación es su **resiliencia híbrida**:

- **Sin Claves o Desconectado:** Si no configuras las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en tu `.env.local`, el cliente de Supabase se inicializa como `null`.
- **Comportamiento Automático:** La capa de persistencia en [lib/persistence.ts](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/apps/web/lib/persistence.ts) y [lib/spaced-repetition.ts](file:///run/media/vini/OS/Users/vinic/OneDrive/Escritorio/1.-PROYECTOS/4.-INGLES/academic-english-lab-multiagent/apps/web/lib/spaced-repetition.ts) interceptará la ausencia de base de datos o de sesión activa, y redirigirá de manera transparente todas las lecturas y escrituras al almacenamiento local (`localStorage`) del navegador.
- **Sin Errores en Consola:** No verás advertencias molestas ni bloqueos de pantalla. El usuario podrá disfrutar de la experiencia del laboratorio con datos locales simulados y un mazo SRS funcional offline.
- **Visualización del Estado:** En la página **Ajustes**, el usuario puede comprobar en qué modo se encuentra (Modo Local vs. Modo Supabase) y borrar su historial si lo desea.
