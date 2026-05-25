# Academic English Lab 🔬✍️

Academic English Lab is a premium, specialized web application designed to help Spanish-speaking economists, university lecturers, and researchers master academic English. It moves away from generic language-learning approaches to focus exclusively on standard phrasing for research presentation, lecture delivery, econometrics, public policy, paper writing, and university classroom instruction.

---

## 🚀 Main Features

1. **Dashboard & Learning Analytics:** Tracks total practice attempts, success rates, pending mistakes, and cards mastered. Includes detailed learning analytics (SRS deck composition, common errors mapped by type, and weakest domain tracking).
2. **Recommended Next Action:** An intelligent panel that dynamically guides users through their daily learning flow (revising due reviews, resolving pending mistakes, practicing speaking, or importing new texts).
3. **Spaced Repetition System (SRS):** Built on the SM-2 spaced repetition algorithm, letting users study vocabulary, grammar, and expressions with active recall grading (Again, Hard, Good, Easy) across 5 memory states (*Nuevo*, *Aprendiendo*, *Repaso*, *Dominado*, *Olvidado*).
4. **Mistake Tracker:** An automated log that captures incorrectly answered exercises, detailing the prompt, user's typed input, correct grammar reference, error categorization, and retry status.
5. **Academic Content Importer:** Accepts academic abstracts, policy briefs, or drafts in Spanish, English, or Mixed, and instantly transforms them into interactive grammar rules, vocab cards, exercises, and speaking prompts.
6. **AI Notebook Generator:** Creates custom study notebooks based on specific topics or automatically from the user's logged mistakes to reinforce weakest domains.
7. **Audio & Speaking Practice:** Allows recording spoken responses directly in the browser via the native `MediaRecorder` API, accompanied by self-assessment metrics (Fluency, Clarity, Confidence, Vocabulary) and daily session progress trackers.
8. **AI Speaking Feedback:** Evaluates transcripts or summaries of spoken responses, generating bilingually structured corrections, pronunciation tips, and suggesting SRS card additions.

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (highly customized MIT/Springer-style minimalist theme)
- **Database & Auth:** Supabase / PostgreSQL (optional, with offline fallbacks)
- **AI Integrations:** Google Gemini / OpenAI GPT API clients
- **Validation:** Zod schemas for all dynamic JSON payloads
- **Icons:** Lucide React

---

## 📦 Local Installation

To run the application locally, follow these steps:

1. **Clone the repository and enter the web app directory:**
   ```bash
   git clone <repository-url>
   cd academic-english-lab/apps/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   *(See the Environment Variables section below to configure API keys).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Go to `http://localhost:3000` to start practicing.

---

## ⚙️ Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and set the following keys:

```bash
# Set default provider: openai | gemini | mock
AI_PROVIDER=mock

# AI Provider API Keys
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here       # Used by Gemini API
GOOGLE_API_KEY=your_gemini_key_here       # Alternative key fallback

# Supabase Configurations (Optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## 🔄 Modes & Fallbacks

The application is engineered with high resilience and supports three distinct operating modes:

### 1. Local/Offline Mode (localStorage fallback)
If Supabase variables are missing from `.env.local`, or the user is not authenticated, the app automatically transitions to local mode. All practice attempts, mistakes, custom notebooks, reviews, and recordings are persisted in the browser's `localStorage`. No console errors or interruptions will occur.

### 2. Connected/Supabase Cloud Sync Mode
When Supabase environment variables are present and the user logs in via the **Ajustes (Settings)** page, the app synchronizes all data with Supabase Cloud PostgreSQL. If connection issues or session expirations occur, the app gracefully falls back to local storage.

### 3. AI Mock Fallback Mode
If `AI_PROVIDER=mock` is configured, or if your API keys are empty/invalid, the app will simulate the AI responses locally using structured, high-quality economics-themed mock data. This allows testing the full generation, importer, and speaking feedback flows offline.

---

## 🏗️ Production Build

To verify and compile the project for production, run:

```bash
# From apps/web
npm run build

# Or from the project root
npm --prefix apps/web run build
```

---

## ☁️ Vercel Deployment Instructions

Academic English Lab can be deployed directly to Vercel in a few clicks:

1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to Vercel and import your project.
3. In Vercel Project Settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web` (This is critical since it is a monorepo setup)
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Add the required Environment Variables in Vercel's dashboard (`AI_PROVIDER`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, etc.).
5. Click **Deploy**.

---

## 📈 Project Phases Summary

- **Phase 1: MVP Foundation:** Created folder structures, core Next.js routing, static seeds, and the standard correction engine.
- **Phase 2: Supabase Integration:** Formulated the PostgreSQL schema (`supabase/schema.sql`) and added database connections with local storage fallbacks.
- **Phase 3: AI Notebook Generator:** Connected LLM endpoints (Gemini & OpenAI) validated with strict Zod schemas for generating custom notebooks.
- **Phase 4: Mistake Tracker:** Added interactive logs to record incorrectly answered items for guided retries.
- **Phase 5: Spaced Repetition System (SRS):** Built the SM-2 algorithm to schedule vocab, grammar, and expressions into study intervals.
- **Phase 6: Session Repetitions & Analytics:** Added session flows (Idle -> Active review deck -> Session summary) and advanced dashboard charts.
- **Phase 7: Academic Speaking Practice:** Integrated native browser recording (`MediaRecorder` API) and self-assessment matrices for conference talks.
- **Phase 8: AI Speaking Feedback:** Created bilingually structured speaking review APIs evaluating grammar, vocab, and pronunciation.
- **Phase 9: Content Importer:** Built a full dashboard to paste economic papers or notes and transform them into interactive flashcards and exercise blocks.
- **Phase 10: UX Polish & Refinement:** Created a design system of reusable components and optimized dashboard hierarchy guides.
- **Phase 11: Production Readiness & Deployment:** Standardized project structure, verified the Next.js production build, created setup guides, and documented environment variables.
