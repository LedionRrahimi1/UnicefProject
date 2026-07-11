-- MësoLehtë AI — Supabase schema (MVP)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- After running: set in .env
--   VITE_USE_SUPABASE=true
--   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
--   VITE_SUPABASE_ANON_KEY=your-anon-key

-- ── Materials ────────────────────────────────────────────────────────────────

create table if not exists public.materials (
  id text primary key,
  title text not null default '',
  subject text not null default '',
  class text not null default '',
  original_text text not null default '',
  simplified_text text not null default '',
  summary text not null default '',
  key_points jsonb not null default '[]'::jsonb,
  vocabulary jsonb not null default '[]'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  english_text text not null default '',
  teacher_notes text not null default '',
  illustrations jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'published')),
  created_at date not null default (current_date),
  student_count int not null default 0,
  completion_rate int not null default 0,
  estimated_minutes int not null default 15,
  target_student_ids jsonb,
  adaptation_group_id text,
  adaptation_key text,
  adaptation_label text,
  audio_enabled boolean,
  enabled_sections jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists materials_status_idx on public.materials (status);
create index if not exists materials_created_at_idx on public.materials (created_at desc);

-- ── Assignments ──────────────────────────────────────────────────────────────

create table if not exists public.assignments (
  id text primary key,
  material_id text not null references public.materials (id) on delete cascade,
  student_id text not null,
  deadline date,
  start_date date,
  allow_retry boolean not null default true,
  show_answers boolean not null default true,
  enable_audio boolean not null default true,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'in-progress', 'completed')),
  score int,
  completed_at date,
  time_spent_minutes int,
  words_opened int,
  audio_used boolean,
  attempts int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists assignments_student_idx on public.assignments (student_id);
create index if not exists assignments_material_idx on public.assignments (material_id);

-- ── Profiles (optional — for later auth) ─────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default '',
  role text not null check (role in ('teacher', 'student')),
  class text,
  created_at timestamptz not null default now()
);

-- ── MVP security: open anon access (tighten with real Auth + RLS later) ──────
-- WARNING: fine for hackathon / private project only.

alter table public.materials enable row level security;
alter table public.assignments enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "materials_anon_all" on public.materials;
create policy "materials_anon_all" on public.materials
  for all using (true) with check (true);

drop policy if exists "assignments_anon_all" on public.assignments;
create policy "assignments_anon_all" on public.assignments
  for all using (true) with check (true);

drop policy if exists "profiles_anon_read" on public.profiles;
create policy "profiles_anon_read" on public.profiles
  for select using (true);
