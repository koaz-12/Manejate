create table recurring_expenses (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references budgets(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  description text,
  amount numeric not null,
  day_of_month integer not null check (day_of_month between 1 and 31),
  is_active boolean default true,
  last_generated_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table recurring_expenses enable row level security;

create policy "Users can view recurring expenses of their budgets"
  on recurring_expenses for select
  using (
    exists (
      select 1 from budget_members
      where budget_members.budget_id = recurring_expenses.budget_id
      and budget_members.user_id = auth.uid()
    )
  );

create policy "Users can insert recurring expenses to their budgets"
  on recurring_expenses for insert
  with check (
    exists (
      select 1 from budget_members
      where budget_members.budget_id = budget_id
      and budget_members.user_id = auth.uid()
      and budget_members.role in ('admin', 'editor')
    )
  );

create policy "Users can update recurring expenses of their budgets"
  on recurring_expenses for update
  using (
    exists (
      select 1 from budget_members
      where budget_members.budget_id = recurring_expenses.budget_id
      and budget_members.user_id = auth.uid()
      and budget_members.role in ('admin', 'editor')
    )
  );

create policy "Users can delete recurring expenses of their budgets"
  on recurring_expenses for delete
  using (
    exists (
      select 1 from budget_members
      where budget_members.budget_id = recurring_expenses.budget_id
      and budget_members.user_id = auth.uid()
      and budget_members.role in ('admin', 'editor')
    )
  );
