-- FIX: Enable DELETE on budget_members
-- Currently, no policy allows deleting rows from budget_members.

-- 1. Review existing policies for budget_members
-- We have "View members of same budget" (Select)
-- We have "Insert self as member" (Insert)

-- 2. Create DELETE Policy
-- Logic: 
-- A user can delete a row IF:
--   a) They are deleting THEMSELVES (Leaving the budget)
--   b) They are an ADMIN of that budget (Kicking someone)

create policy "Delete membership" on budget_members for delete using (
  -- Case A: Leaving (User ID matches Auth UID)
  user_id = auth.uid()
  OR
  -- Case B: Kicking (Auth UID is an Admin of this budget)
  exists (
    select 1 from budget_members 
    where budget_id = budget_members.budget_id 
    and user_id = auth.uid() 
    and role = 'admin'
  )
);
