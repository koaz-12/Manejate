-- FIX: Infinite Recursion in RLS Policies
-- We need to use a "Security Definer" function to look up memberships without triggering the loop.

-- 1. Create a helper function that bypasses RLS (SECURITY DEFINER)
-- This function allows us to get the list of budgets a user belongs to safely.
create or replace function get_my_budget_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select budget_id from budget_members where user_id = auth.uid();
$$;

-- 2. Drop the problematic recursive policies
drop policy if exists "View members of same budget" on budget_members;
drop policy if exists "View own membership" on budget_members;

-- 3. Create the new Safe Policy
-- "I can see a budget_member row IF that row's budget_id is in my list of budgets"
create policy "View members of same budget" on budget_members
for select using (
  budget_id in (select get_my_budget_ids())
);

-- 4. Ensure the Budgets table also uses this safe logic if it was failing
drop policy if exists "View budgets member or creator" on budgets;

create policy "View budgets member or creator" on budgets for select using (
  created_by = auth.uid() 
  OR 
  id in (select get_my_budget_ids())
);
