-- Run this in Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- Stores user feedback submitted after CV download.

create table if not exists public.cv_feedback (
  id bigserial primary key,
  anon_id text,
  user_id uuid references auth.users(id) on delete set null,
  rating smallint not null default 5,
  message text not null default '',
  source text not null default 'builder',
  language text not null default 'en',
  user_agent text,
  created_at timestamptz not null default now(),
  constraint cv_feedback_rating_check check (rating between 1 and 5)
);

alter table public.cv_feedback enable row level security;

create index if not exists cv_feedback_created_at_idx
  on public.cv_feedback (created_at desc);

create index if not exists cv_feedback_user_id_idx
  on public.cv_feedback (user_id);

-- Optional: allow authenticated users to view their own feedback rows.
drop policy if exists "cv_feedback_select_own" on public.cv_feedback;
create policy "cv_feedback_select_own"
  on public.cv_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);
