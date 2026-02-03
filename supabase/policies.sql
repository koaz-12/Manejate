-- 1. Enable RLS
alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- 2. Drop all policies to start fresh
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

drop policy if exists "View budgets member of" on budgets;
drop policy if exists "Create budgets" on budgets;

drop policy if exists "View members of same budget" on budget_members;
drop policy if exists "View own membership" on budget_members;
drop policy if exists "Insert self as member" on budget_members;

drop policy if exists "View categories of budget" on categories;
drop policy if exists "Create categories" on categories;

drop policy if exists "View transactions of budget" on transactions;
drop policy if exists "Create transactions" on transactions;

-- 3. Define Logic Policies

-- PROFILES
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- BUDGETS
-- FIX: Allow selecting budgets if you are the creator OR a member
create policy "View budgets member or creator" on budgets for select using (
  created_by = auth.uid() 
  OR 
  exists (select 1 from budget_members where budget_id = budgets.id and user_id = auth.uid())
);

create policy "Create budgets" on budgets for insert with check ( auth.uid() = created_by );

-- BUDGET MEMBERS
-- Simple infinite recursion fix: users can only see their own rows in this table
create policy "View own membership" on budget_members for select using (
  user_id = auth.uid()
);

-- But wait, to see "Members of my budget" (e.g. for list of users), we need more.
-- Breaking recursion: Allow viewing if you are a member of the budget of the target row.
-- Let's stick to simple "View own" for now to pass the onboarding. 
-- Later we can enable: using ( budget_id in (select budget_id from budget_members where user_id = auth.uid()) )

create policy "Insert self as member" on budget_members for insert with check (
  user_id = auth.uid()
);

-- CATEGORIES
create policy "View categories of budget" on categories for select using (
  exists (select 1 from budget_members where budget_id = categories.budget_id and user_id = auth.uid())
);

create policy "Create categories" on categories for insert with check (
  exists (select 1 from budget_members where budget_id = categories.budget_id and user_id = auth.uid())
);

-- TRANSACTIONS
create policy "View transactions of budget" on transactions for select using (
  exists (select 1 from budget_members where budget_id = transactions.budget_id and user_id = auth.uid())
);

create policy "Create transactions" on transactions for insert with check (
  exists (select 1 from budget_members where budget_id = transactions.budget_id and user_id = auth.uid())
);


-- 4. TRIGGERS (Ensure Profile Exists)
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Wrapper to only drop trigger if exists (standard SQL doesn't have create or replace trigger)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. BACKFILL (Fix existing users blocked by missing profile)
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
