-- ============================================================
-- Manejate: Full Database Schema (Current State)
-- Generated: 2026-02-10
-- 
-- This file reflects the CURRENT state of the database
-- after applying all migrations (01-15).
-- It is a REFERENCE FILE — do NOT run it on an existing DB.
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles (linked to auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Budgets (Shared financial spaces)
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  currency text default 'USD' not null,
  created_by uuid references public.profiles(id) not null,
  cutoff_day integer default 1,
  constraint cutoff_day_check check (cutoff_day >= 1 and cutoff_day <= 31)
);

-- Budget Members (Many-to-many: users ↔ budgets)
create table public.budget_members (
  budget_id uuid references public.budgets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'editor', 'viewer')) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (budget_id, user_id)
);

-- Categories (Budget categories with subcategory support)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  name text not null,
  type text check (type in ('fixed', 'variable', 'income', 'savings')) not null,
  budget_limit numeric(12, 2) default 0,
  icon text,
  parent_id uuid references public.categories(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  amount numeric(12, 2) not null,
  date date not null default CURRENT_DATE,
  description text,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Savings Goals
create table public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) default 0,
  contribution_amount numeric default 0,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invitations (Magic links for collaboration)
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  token text unique not null,
  role text check (role in ('admin', 'editor', 'viewer')) not null default 'editor',
  created_by uuid references public.profiles(id) not null,
  expires_at timestamp with time zone not null,
  is_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recurring Expenses
create table public.recurring_expenses (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  amount numeric not null,
  day_of_month integer not null check (day_of_month between 1 and 31),
  is_active boolean default true,
  last_generated_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Settings (Key-value preferences)
create table public.user_settings (
  user_id uuid references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index idx_transactions_budget_date on public.transactions(budget_id, date);
create index idx_transactions_category on public.transactions(category_id);
create index idx_budget_members_user on public.budget_members(user_id);
create index idx_categories_budget on public.categories(budget_id);
create index idx_categories_parent_id on public.categories(parent_id);
create index idx_savings_goals_budget on public.savings_goals(budget_id);
create index idx_recurring_budget on public.recurring_expenses(budget_id);
create index idx_invitations_budget on public.invitations(budget_id);

-- ============================================================
-- 3. SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Get list of budget IDs the current user belongs to (bypasses RLS)
create or replace function get_my_budget_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select budget_id from budget_members where user_id = auth.uid();
$$;

-- Check if current user is admin of a specific budget (bypasses RLS)
create or replace function is_budget_admin(_budget_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from budget_members
    where budget_id = _budget_id
    and user_id = auth.uid()
    and role = 'admin'
  );
$$;

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.invitations enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.user_settings enable row level security;

-- PROFILES
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- BUDGETS
create policy "View budgets member or creator" on budgets for select using (
  created_by = auth.uid() OR id in (select get_my_budget_ids())
);
create policy "Create budgets" on budgets for insert with check (auth.uid() = created_by);
create policy "Update own budgets" on budgets for update using (created_by = auth.uid());
create policy "Delete own budgets" on budgets for delete using (created_by = auth.uid());

-- BUDGET MEMBERS
create policy "View members of same budget" on budget_members for select using (
  budget_id in (select get_my_budget_ids())
);
create policy "Insert self as member" on budget_members for insert with check (user_id = auth.uid());
create policy "Delete membership" on budget_members for delete using (
  user_id = auth.uid() OR is_budget_admin(budget_id)
);

-- CATEGORIES
create policy "View categories of budget" on categories for select using (
  exists (select 1 from budget_members where budget_id = categories.budget_id and user_id = auth.uid())
);
create policy "Create categories" on categories for insert with check (
  exists (select 1 from budget_members where budget_id = categories.budget_id and user_id = auth.uid())
);
create policy "Update categories of budget" on categories for update using (
  budget_id in (select budget_id from budget_members where user_id = auth.uid())
);
create policy "Delete categories of budget" on categories for delete using (
  budget_id in (select budget_id from budget_members where user_id = auth.uid())
);

-- TRANSACTIONS
create policy "View transactions of budget" on transactions for select using (
  exists (select 1 from budget_members where budget_id = transactions.budget_id and user_id = auth.uid())
);
create policy "Create transactions" on transactions for insert with check (
  exists (select 1 from budget_members where budget_id = transactions.budget_id and user_id = auth.uid())
);
create policy "Update transactions of budget" on transactions for update using (
  budget_id in (select budget_id from budget_members where user_id = auth.uid())
);
create policy "Delete transactions of budget" on transactions for delete using (
  budget_id in (select budget_id from budget_members where user_id = auth.uid())
);

-- SAVINGS GOALS
create policy "Enable read access for budget members" on savings_goals for select using (
  exists (select 1 from budget_members bm where bm.budget_id = savings_goals.budget_id and bm.user_id = auth.uid())
);
create policy "Enable insert for budget members" on savings_goals for insert with check (
  exists (select 1 from budget_members bm where bm.budget_id = budget_id and bm.user_id = auth.uid())
);
create policy "Enable update for budget members" on savings_goals for update using (
  exists (select 1 from budget_members bm where bm.budget_id = savings_goals.budget_id and bm.user_id = auth.uid())
);
create policy "Enable delete for budget members" on savings_goals for delete using (
  exists (select 1 from budget_members bm where bm.budget_id = savings_goals.budget_id and bm.user_id = auth.uid())
);

-- INVITATIONS
create policy "Members can view invites" on invitations for select using (
  exists (select 1 from budget_members where budget_id = invitations.budget_id and user_id = auth.uid())
);
create policy "Admins/Editors can create invites" on invitations for insert with check (
  exists (select 1 from budget_members where budget_id = invitations.budget_id and user_id = auth.uid() and role in ('admin', 'editor'))
);

-- RECURRING EXPENSES
create policy "Users can view recurring expenses of their budgets" on recurring_expenses for select using (
  exists (select 1 from budget_members where budget_members.budget_id = recurring_expenses.budget_id and budget_members.user_id = auth.uid())
);
create policy "Users can insert recurring expenses to their budgets" on recurring_expenses for insert with check (
  exists (select 1 from budget_members where budget_members.budget_id = budget_id and budget_members.user_id = auth.uid() and budget_members.role in ('admin', 'editor'))
);
create policy "Users can update recurring expenses of their budgets" on recurring_expenses for update using (
  exists (select 1 from budget_members where budget_members.budget_id = recurring_expenses.budget_id and budget_members.user_id = auth.uid() and budget_members.role in ('admin', 'editor'))
);
create policy "Users can delete recurring expenses of their budgets" on recurring_expenses for delete using (
  exists (select 1 from budget_members where budget_members.budget_id = recurring_expenses.budget_id and budget_members.user_id = auth.uid() and budget_members.role in ('admin', 'editor'))
);

-- USER SETTINGS
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

-- ============================================================
-- 5. TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on user_settings
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = NOW();
  return NEW;
end;
$$ language plpgsql;

create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row execute function update_updated_at_column();
