-- MësoLehtë AI — Learning profiles, reports, flashcards, Memory Booster, events
-- Run AFTER schema.sql + schema_auth.sql + schema_gamification.sql

-- ── Learning profiles (one row per student) ───────────────────────────────────

create table if not exists public.learning_profiles (
  student_id text primary key,
  traits jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  support_needs jsonb not null default '[]'::jsonb,
  preferred_formats jsonb not null default '[]'::jsonb,
  teacher_recommendations jsonb not null default '[]'::jsonb,
  session_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ── Learning reports (post-quiz AI reports) ───────────────────────────────────

create table if not exists public.learning_reports (
  id text primary key,
  student_id text not null,
  material_id text not null,
  assignment_id text not null,
  performance_summary text not null default '',
  strengths jsonb not null default '[]'::jsonb,
  difficulties jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  next_lesson_steps jsonb not null default '[]'::jsonb,
  patterns jsonb not null default '[]'::jsonb,
  teacher_recommendations jsonb not null default '[]'::jsonb,
  student_message text not null default '',
  study_plan jsonb not null default '[]'::jsonb,
  full_teacher_report text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists learning_reports_student_idx on public.learning_reports (student_id);
create index if not exists learning_reports_assignment_idx on public.learning_reports (assignment_id);

-- ── Flashcards (per material) ─────────────────────────────────────────────────

create table if not exists public.flashcards (
  id text primary key,
  material_id text not null,
  front text not null default '',
  back text not null default '',
  type text not null default 'quick'
    check (type in ('definition', 'concept', 'quick')),
  created_at timestamptz not null default now()
);

create index if not exists flashcards_material_idx on public.flashcards (material_id);

-- ── Memory Booster packs ──────────────────────────────────────────────────────

create table if not exists public.memory_boosters (
  id text primary key,
  student_id text not null,
  material_id text not null,
  assignment_id text not null,
  short_summary text not null default '',
  flashcards jsonb not null default '[]'::jsonb,
  review_questions jsonb not null default '[]'::jsonb,
  review_schedule jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists memory_boosters_student_idx on public.memory_boosters (student_id);
create index if not exists memory_boosters_assignment_idx on public.memory_boosters (assignment_id);

-- ── Learning events (reading/quiz telemetry) ──────────────────────────────────

create table if not exists public.learning_events (
  id text primary key,
  student_id text not null,
  material_id text not null,
  assignment_id text,
  type text not null
    check (type in ('explain', 'audio', 'vocab', 'simplified_view', 'hint', 'quiz_wrong', 'quiz_correct')),
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists learning_events_session_idx
  on public.learning_events (student_id, material_id);
create index if not exists learning_events_created_idx
  on public.learning_events (created_at desc);

-- ── MVP RLS (open — tighten for production) ───────────────────────────────────

alter table public.learning_profiles enable row level security;
alter table public.learning_reports enable row level security;
alter table public.flashcards enable row level security;
alter table public.memory_boosters enable row level security;
alter table public.learning_events enable row level security;

drop policy if exists "learning_profiles_all_mvp" on public.learning_profiles;
create policy "learning_profiles_all_mvp" on public.learning_profiles
  for all using (true) with check (true);

drop policy if exists "learning_reports_all_mvp" on public.learning_reports;
create policy "learning_reports_all_mvp" on public.learning_reports
  for all using (true) with check (true);

drop policy if exists "flashcards_all_mvp" on public.flashcards;
create policy "flashcards_all_mvp" on public.flashcards
  for all using (true) with check (true);

drop policy if exists "memory_boosters_all_mvp" on public.memory_boosters;
create policy "memory_boosters_all_mvp" on public.memory_boosters
  for all using (true) with check (true);

drop policy if exists "learning_events_all_mvp" on public.learning_events;
create policy "learning_events_all_mvp" on public.learning_events
  for all using (true) with check (true);
