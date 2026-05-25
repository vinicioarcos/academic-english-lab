# Instrucciones para activar Academic English Lab

## 1. Descomprimir

```bash
unzip academic-english-lab.zip
cd academic-english-lab
```

## 2. Entrar a la app web

```bash
cd apps/web
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Crear variables de entorno

```bash
cp .env.example .env.local
```

Por ahora puedes dejar las claves vacías. El MVP funciona con datos locales.

## 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir en el navegador:

```text
http://localhost:3000
```

## 6. Rutas principales

```text
/              Landing local
/dashboard     Progreso
/grammar       Gramática académica
/vocabulary    Vocabulario
/library       Biblioteca de libros
/notebooks     Cuadernos
/practice      Ejercicios activos
/settings      Ajustes
```

## 7. Probar la API local de generación simulada

Con el servidor activo:

```bash
curl -X POST http://localhost:3000/api/generate-notebook \
  -H "Content-Type: application/json" \
  -d '{"topic":"explaining a Probit model","level":"B1-B2","domain":"Econometrics"}'
```

## 8. Inicializar Git

Desde la carpeta raíz:

```bash
git init
git add .
git commit -m "Inicializar Academic English Lab MVP"
```

## 9. Despliegue en Vercel

Desde `apps/web`:

```bash
npm run build
```

Si compila correctamente, puedes conectar el repo a Vercel.

Configuración sugerida en Vercel:

```text
Root Directory: apps/web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

## 10. Siguiente mejora recomendada

Primero valida el MVP local. Luego conecta Supabase y después la API de IA. No metas todo al mismo tiempo, porque ahí empieza la novela turca del debugging.
