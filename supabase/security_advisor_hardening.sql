-- Run this in Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- Purpose:
-- 1) Tighten table access for Security Advisor "Auth RLS Initialization Plan" warnings.
-- 2) Keep browser access limited to "read own row" only for authenticated users.
--
-- Notes:
-- - This script does NOT enable "Leaked Password Protection" (that is an Auth UI setting).
-- - Backend API using service_role key is not blocked by these RLS policies.

begin;

-- 1) Ensure RLS is enabled on warned tables
alter table if exists public.cv_feedback enable row level security;
alter table if exists public.download_usage_monthly enable row level security;
alter table if exists public.user_subscriptions enable row level security;

-- 2) Remove broad table grants from anon/authenticated
--    (we will re-grant minimal SELECT for authenticated only)
revoke all on table public.cv_feedback from anon, authenticated;
revoke all on table public.download_usage_monthly from anon, authenticated;
revoke all on table public.user_subscriptions from anon, authenticated;

-- 3) Minimal grants needed for client-side "read own row" flows
grant select on table public.cv_feedback to authenticated;
grant select on table public.download_usage_monthly to authenticated;
grant select on table public.user_subscriptions to authenticated;

-- 4) Recreate strict "select own row" policies
drop policy if exists "cv_feedback_select_own" on public.cv_feedback;
create policy "cv_feedback_select_own"
  on public.cv_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "download_usage_monthly_select_own" on public.download_usage_monthly;
create policy "download_usage_monthly_select_own"
  on public.download_usage_monthly
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
  on public.user_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

commit;

-- After running this SQL:
-- 1) Re-run Security Advisor.
-- 2) For "Leaked Password Protection Disabled", enable it in:
--    Authentication -> Settings -> Password Security.
