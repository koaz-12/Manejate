-- Fix Member Visibility
-- Currently, users can only see their own row in budget_members.
-- We need to allow them to see ALL members of any budget they are part of.

-- 1. Drop the restrictive policy
drop policy if exists "View own membership" on budget_members;

-- 2. Create a new, broader policy
-- "Users can view members of budgets they belong to"
create policy "View members of same budget" on budget_members for select using (
  budget_id in (
    select budget_id from budget_members where user_id = auth.uid()
  )
);

-- Note: This uses a subquery. For performance in very large tables, we might index budget_id and user_id.
-- But for this app, it's fine.
