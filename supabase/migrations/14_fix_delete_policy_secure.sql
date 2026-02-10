-- FIX: robust DELETE policy using Security Definer
-- To avoid recursion completely, we use a helper function to check admin status.

-- 1. Helper Function: Is Admin?
create or replace function is_budget_admin(_budget_id uuid)
returns boolean
language sql
security definer -- Bypass RLS to check the table
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

-- 2. Drop previous attempts
drop policy if exists "Delete membership" on budget_members;

-- 3. Create the robust Policy
-- Allow delete if: (It's me) OR (I am an admin of this budget)
create policy "Delete membership" on budget_members for delete using (
  user_id = auth.uid() 
  OR 
  is_budget_admin(budget_id)
);
