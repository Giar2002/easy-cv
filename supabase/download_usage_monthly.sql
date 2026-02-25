-- Run this in Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- Tracks PDF download usage per authenticated user per UTC month.

create table if not exists public.download_usage_monthly (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null,
  requests integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint download_usage_monthly_requests_non_negative check (requests >= 0),
  constraint download_usage_monthly_pkey primary key (user_id, usage_month)
);

alter table public.download_usage_monthly enable row level security;

create index if not exists download_usage_monthly_usage_month_idx
  on public.download_usage_monthly (usage_month);

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

drop trigger if exists download_usage_monthly_touch_updated_at on public.download_usage_monthly;
create trigger download_usage_monthly_touch_updated_at
before update on public.download_usage_monthly
for each row
execute function public.touch_updated_at();

-- Optional: allow authenticated users to read their own usage rows.
drop policy if exists "download_usage_monthly_select_own" on public.download_usage_monthly;
create policy "download_usage_monthly_select_own"
  on public.download_usage_monthly
  for select
  to authenticated
  using (auth.uid() = user_id);
