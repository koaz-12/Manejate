-- Add cutoff_day to budgets if it doesn't exist
alter table public.budgets add column if not exists cutoff_day integer default 1;

-- Ensure constraints (1-31)
alter table public.budgets drop constraint if exists cutoff_day_check;
alter table public.budgets add constraint cutoff_day_check check (cutoff_day >= 1 and cutoff_day <= 31);
