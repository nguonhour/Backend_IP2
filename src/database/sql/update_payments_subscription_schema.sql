-- Run this once in Supabase SQL editor if DB_SYNC is false.
-- It moves payments away from job-based billing and stores subscription metadata.

alter table public.payments
  add column if not exists plan_name varchar,
  add column if not exists expires_at timestamp;

update public.payments
set plan_name = case
  when amount = 1.00 then 'Basic'
  when amount = .00 then 'Pro Academic'
  when amount = 399.00 then 'Enterprise'
  else coalesce(plan_name, 'Employer subscription')
end
where plan_name is null;

update public.payments
set expires_at = created_at + interval '30 minutes'
where expires_at is null;

alter table public.payments
  drop column if exists job_id;
