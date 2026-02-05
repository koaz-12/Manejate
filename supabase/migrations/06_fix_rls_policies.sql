-- Fix missing RLS policies for Update/Delete operations

-- Categories
create policy "Update categories of budget" on categories for update using (
  budget_id in (
    select budget_id from budget_members where user_id = auth.uid()
  )
);

create policy "Delete categories of budget" on categories for delete using (
  budget_id in (
    select budget_id from budget_members where user_id = auth.uid()
  )
);

-- Transactions
create policy "Update transactions of budget" on transactions for update using (
  budget_id in (
    select budget_id from budget_members where user_id = auth.uid()
  )
);

create policy "Delete transactions of budget" on transactions for delete using (
  budget_id in (
    select budget_id from budget_members where user_id = auth.uid()
  )
);

-- Budgets (Update/Delete for Owner)
create policy "Update own budgets" on budgets for update using (
  created_by = auth.uid()
);

create policy "Delete own budgets" on budgets for delete using (
  created_by = auth.uid()
);
