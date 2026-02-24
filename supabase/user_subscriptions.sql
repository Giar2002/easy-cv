-- Run this in Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- Stores current plan status for each authenticated user.

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_plan_check
    check (plan in ('free', 'pro', 'premium', 'business')),
  constraint user_subscriptions_status_check
    check (status in ('inactive', 'active', 'trialing', 'past_due', 'canceled', 'expired'))
);

alter table public.user_subscriptions enable row level security;

create index if not exists user_subscriptions_status_idx
  on public.user_subscriptions (status);

create index if not exists user_subscriptions_current_period_end_idx
  on public.user_subscriptions (current_period_end);

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

drop trigger if exists user_subscriptions_touch_updated_at on public.user_subscriptions;
create trigger user_subscriptions_touch_updated_at
before update on public.user_subscriptions
for each row
execute function public.touch_updated_at();

-- Allow users to read their own plan.
drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
  on public.user_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);
