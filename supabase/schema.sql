-- Profiles table to store user meta details linked to Supabase Auth
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  level text default 'B1',
  created_at timestamptz default now()
);

-- Practice attempts table to persist exercise submission history
create table if not exists practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  exercise_id text not null,
  user_answer text not null,
  is_correct boolean not null,
  feedback text,
  prompt text not null,
  expected_answer text not null,
  type text not null,
  created_at timestamptz default now()
);

-- User mistakes table to act as the Mistake Tracker database storage
create table if not exists user_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  exercise_id text not null,
  prompt text not null,
  user_answer text not null,
  expected_answer text not null,
  error_type text not null,
  date timestamptz default now(),
  retry_status text default 'pendiente' not null check (retry_status in ('pendiente', 'completado'))
);

-- Spaced Repetition Review Items table
create table if not exists review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  item_type text not null check (item_type in ('vocabulary', 'grammar', 'phrase', 'exercise', 'mistake')),
  item_id text not null,
  prompt text not null,
  answer_hint text,
  next_review_at timestamptz not null default now(),
  interval_days integer not null default 0,
  ease_factor double precision not null default 2.5,
  review_count integer not null default 0,
  success_streak integer not null default 0,
  last_reviewed_at timestamptz,
  state text not null check (state in ('new', 'learning', 'review', 'mastered', 'forgotten')),
  source_type text check (source_type in ('vocabulary', 'grammar', 'phrase_bank', 'theory_block', 'exercise_error', 'ai_notebook')),
  source_id text,
  notebook_title text,
  domain text,
  level text
);


-- Existing MVP tables for completeness (optional, safe to have)
create table if not exists grammar_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  explanation text,
  rule text,
  examples jsonb default '[]'::jsonb,
  common_mistake text,
  created_at timestamptz default now()
);

create table if not exists vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  word text not null,
  translation text,
  part_of_speech text,
  domain text,
  examples jsonb default '[]'::jsonb,
  common_mistake text,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists notebooks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  title text not null,
  level text,
  theory text,
  phrases jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid references notebooks(id) on delete cascade,
  type text not null,
  prompt text not null,
  expected_answer text not null,
  feedback text,
  created_at timestamptz default now()
);

create table if not exists ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  provider text,
  prompt text,
  response jsonb,
  created_at timestamptz default now()
);

-- Speaking attempts table for Phase 7
create table if not exists speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  prompt text not null,
  category text not null,
  transcript text,
  self_rating jsonb not null default '{}'::jsonb,
  notes text,
  audio_url text,
  created_at timestamptz default now()
);

-- Speaking feedback table for Phase 8
create table if not exists speaking_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  speaking_attempt_id uuid,
  prompt text not null,
  category text not null,
  user_text text not null,
  corrected_version text not null,
  academic_version text not null,
  grammar_issues jsonb not null default '[]'::jsonb,
  vocabulary_suggestions jsonb not null default '[]'::jsonb,
  stronger_academic_phrases jsonb not null default '[]'::jsonb,
  suggested_review_items jsonb not null default '[]'::jsonb,
  overall_feedback text not null,
  next_practice_prompt text not null,
  created_at timestamptz default now()
);
