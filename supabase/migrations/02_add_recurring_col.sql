-- Add is_recurring to transactions if it doesn't exist
alter table public.transactions add column if not exists is_recurring boolean default false;
