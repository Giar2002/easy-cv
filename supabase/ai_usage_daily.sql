-- Run this in Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- Tracks AI usage per anonymous browser user per UTC day.

create table if not exists public.ai_usage_daily (
  anon_id text not null,
  usage_date date not null default (now() at time zone 'utc')::date,
  requests integer not null default 0,
  survey_requests integer not null default 0,
  summary_requests integer not null default 0,
  experience_requests integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_usage_daily_requests_non_negative check (requests >= 0),
  constraint ai_usage_daily_pkey primary key (anon_id, usage_date)
);

alter table public.ai_usage_daily add column if not exists survey_requests integer not null default 0;
alter table public.ai_usage_daily add column if not exists summary_requests integer not null default 0;
alter table public.ai_usage_daily add column if not exists experience_requests integer not null default 0;

alter table public.ai_usage_daily enable row level security;

create index if not exists ai_usage_daily_usage_date_idx
  on public.ai_usage_daily (usage_date);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_usage_daily_touch_updated_at on public.ai_usage_daily;
create trigger ai_usage_daily_touch_updated_at
before update on public.ai_usage_daily
for each row
execute function public.touch_updated_at();
