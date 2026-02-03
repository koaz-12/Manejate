-- Profiles linked to auth.users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Budgets (Spaces)
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  currency text default 'USD' not null,
  created_by uuid references public.profiles(id) not null
);

-- Budget Members
create table public.budget_members (
  budget_id uuid references public.budgets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'editor', 'viewer')) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (budget_id, user_id)
);

-- Categories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  name text not null,
  type text check (type in ('fixed', 'variable')) not null,
  budget_limit numeric(12, 2) default 0,
  icon text,
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
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (simplified for initial setup)
alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
