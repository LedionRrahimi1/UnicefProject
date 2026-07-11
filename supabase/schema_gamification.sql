-- MësoLehtë AI — Stars (XP) + Titles (badges) on Supabase
-- Run AFTER schema.sql + schema_auth.sql

create table if not exists public.xp_transactions (
  id text primary key,
  student_id text not null,
  amount int not null default 0,
  reason text not null default '',
  source_type text not null default 'teacher'
    check (source_type in ('material', 'quiz', 'vocabulary', 'level', 'badge', 'teacher', 'improvement')),
  source_id text,
  awarded_by text not null default 'system'
    check (awarded_by in ('system', 'teacher')),
  teacher_id text,
  created_at timestamptz not null default now()
);

create index if not exists xp_student_idx on public.xp_transactions (student_id);
create index if not exists xp_created_idx on public.xp_transactions (created_at desc);

create table if not exists public.student_badges (
  id text primary key,
  student_id text not null,
  badge_id text not null,
  earned_at date not null default (current_date),
  awarded_by text not null default 'system'
    check (awarded_by in ('system', 'teacher')),
  teacher_id text,
  teacher_message text,
  created_at timestamptz not null default now(),
  unique (student_id, badge_id)
);

create index if not exists student_badges_student_idx on public.student_badges (student_id);

alter table public.xp_transactions enable row level security;
alter table public.student_badges enable row level security;

drop policy if exists "xp_all_mvp" on public.xp_transactions;
create policy "xp_all_mvp" on public.xp_transactions
  for all using (true) with check (true);

drop policy if exists "badges_all_mvp" on public.student_badges;
create policy "badges_all_mvp" on public.student_badges
  for all using (true) with check (true);
