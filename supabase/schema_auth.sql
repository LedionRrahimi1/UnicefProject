-- MësoLehtë AI — Auth + classes + students (run AFTER schema.sql)
-- Supabase Dashboard → SQL Editor → Run
--
-- IMPORTANT (Auth settings):
-- Authentication → Providers → Email → disable "Confirm email"
-- (otherwise new accounts cannot log in until they confirm)

-- ── Profiles (extend / recreate-safe) ────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default '',
  role text not null check (role in ('teacher', 'student')),
  class text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_anon_read" on public.profiles;
drop policy if exists "profiles_all_mvp" on public.profiles;
create policy "profiles_all_mvp" on public.profiles
  for all using (true) with check (true);

-- ── Classes ──────────────────────────────────────────────────────────────────

create table if not exists public.classes (
  id text primary key,
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists classes_teacher_idx on public.classes (teacher_id);

alter table public.classes enable row level security;

drop policy if exists "classes_all_mvp" on public.classes;
create policy "classes_all_mvp" on public.classes
  for all using (true) with check (true);

-- ── Students (id = auth.users.id) ────────────────────────────────────────────

create table if not exists public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  teacher_id uuid not null references auth.users (id) on delete cascade,
  class_id text not null references public.classes (id) on delete cascade,
  name text not null,
  email text not null,
  class_name text not null,
  age int not null default 12,
  reading_level text not null default 'Mesatar',
  score int not null default 0,
  completed_materials int not null default 0,
  status text not null default 'active'
    check (status in ('active', 'needs-support', 'excellent')),
  preferred_font text not null default 'lexend',
  audio_enabled boolean not null default true,
  visual_preferred boolean not null default false,
  language text not null default 'sq',
  created_at timestamptz not null default now()
);

create index if not exists students_class_idx on public.students (class_id);
create index if not exists students_teacher_idx on public.students (teacher_id);
create index if not exists students_class_name_idx on public.students (class_name);

alter table public.students enable row level security;

drop policy if exists "students_all_mvp" on public.students;
create policy "students_all_mvp" on public.students
  for all using (true) with check (true);

-- Optional: teacher_id on materials for filtering later
alter table public.materials
  add column if not exists teacher_id uuid references auth.users (id) on delete set null;
