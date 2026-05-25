# Guía de Despliegue en Vercel — Academic English Lab

Esta guía detalla los pasos para desplegar la aplicación web Next.js en Vercel, considerando que se encuentra dentro de una estructura monorepo en `apps/web`.

---

## 1. Conectar con GitHub / GitLab / Bitbucket

1. Sube tu código a un repositorio privado o público en tu proveedor de Git (ej: GitHub).
   ```bash
   git init
   git add .
   git commit -m "Inicializar Academic English Lab"
   git remote add origin <tu-repositorio-url>
   git branch -M main
   git push -u origin main
   ```
2. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de Git.
3. Haz clic en **Add New...** -> **Project**.
4. Selecciona el repositorio de Git que acabas de subir e impórtalo.

---

## 2. Configurar el Directorio Raíz del Proyecto (Root Directory)

Dado que la aplicación Next.js reside en la subcarpeta `apps/web`, es fundamental indicarle a Vercel la ubicación correcta:

- En la pantalla de importación de Vercel, busca el apartado **Configure Project**.
- En el campo **Root Directory**, haz clic en **Browse** y selecciona la carpeta **`apps/web`** (o escribe directamente `apps/web` en el campo de texto).
- Deja la casilla **Framework Preset** configurada en **Next.js** (Vercel lo detectará automáticamente).

---

## 3. Comandos de Construcción e Instalación (Build & Install)

En la mayoría de los casos, Vercel sobrescribirá de forma óptima los comandos. No obstante, asegúrate de que tengan los siguientes valores:

- **Build Command:** `npm run build` (o `next build`).
- **Output Directory:** `.next` (Directorio de salida por defecto de Next.js).
- **Install Command:** `npm install` (o `yarn install` / `pnpm install` si cambias de gestor de paquetes).

---

## 4. Configurar Variables de Entorno en Vercel

Antes de presionar el botón de desplegar, añade las variables de entorno necesarias para habilitar la persistencia en la nube y las consultas de Inteligencia Artificial:

1. Despliega el apartado **Environment Variables** en la pantalla del proyecto.
2. Añade las siguientes claves:
   - **`AI_PROVIDER`:** `openai` o `gemini` (si deseas usar IA real) o `mock` (si quieres usar respuestas de demostración simuladas en producción).
   - **`OPENAI_API_KEY`:** Tu clave API secreta de OpenAI (si usas `AI_PROVIDER=openai`).
   - **`GEMINI_API_KEY` o `GOOGLE_API_KEY`:** Tu clave de Gemini (si usas `AI_PROVIDER=gemini`).
   - **`NEXT_PUBLIC_SUPABASE_URL`:** URL de tu proyecto en Supabase (ej: `https://xxxx.supabase.co`).
   - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`:** Clave anónima pública de tu Supabase.

---

## 5. Errores Comunes de Despliegue y Soluciones

### Error: `Cannot find module '@/components/...'`
- **Causa:** Problemas de importación sensibles a mayúsculas y minúsculas en Linux (el entorno de Vercel).
- **Solución:** Verifica que el nombre de tus archivos y carpetas coincida exactamente con las sentencias de importación.

### Error: `Type error: Property 'xxx' does not exist on type 'yyy'`
- **Causa:** TypeScript es estricto en la fase de build y no permitirá compilar si hay discrepancias de tipos.
- **Solución:** Corrección de la firma del tipo y ejecución de `npm run build` localmente en tu sistema para corregir las inconsistencias antes de empujar a Git.

### Error: `Supabase key is required`
- **Causa:** Las variables públicas de Supabase no están configuradas en Vercel, o el cliente no puede leerlas.
- **Solución:** Asegúrate de que las variables inicien con el prefijo `NEXT_PUBLIC_` para que Next.js pueda exponerlas al navegador.

---

## 6. Lista de Verificación Post-Despliegue

Una vez que el despliegue finalice con éxito, realiza estas verificaciones rápidas para asegurar la calidad de la plataforma:

- [ ] **Acceso a Dashboard:** Carga la URL provista por Vercel (ej: `academic-english-lab.vercel.app`) y comprueba que cargue el Dashboard al instante.
- [ ] **Modo de Conexión:** Entra a la sección **Ajustes** y comprueba el estado de conexión de la base de datos (debe reflejar "Modo Supabase" si están las claves configuradas y hay sesión, o "Modo Local" si no).
- [ ] **Intento de Ejercicio:** Ve a **Práctica Activa**, responde un ejercicio mal y verifica que aparezca registrado en tu **Mistake Tracker** del Dashboard.
- [ ] **Importación con IA:** Ve a **Importador de Contenido**, pega un párrafo y haz clic en generar. Verifica que carguen los resultados correctos (reales o simulados) sin errores.
- [ ] **Grabación de Habla:** Ve a **Expresión Oral**, presiona grabar, detén el audio y verifique la reproducción limpia en el reproductor web.
- [ ] **Responsividad:** Abre la consola del desarrollador y prueba la aplicación simulando dispositivos móviles y tablets para comprobar la correcta adaptación del sidebar lateral y las tablas de datos.
