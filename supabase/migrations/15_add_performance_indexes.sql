-- Performance Indexes
-- These indexes target the most frequently queried columns,
-- especially those used in RLS policies and page data fetching.

-- 1. TRANSACTIONS: The most queried table. Every page filters by budget_id + date range.
CREATE INDEX IF NOT EXISTS idx_transactions_budget_date ON public.transactions(budget_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);

-- 2. BUDGET_MEMBERS: Used by EVERY RLS policy via EXISTS sub-select.
CREATE INDEX IF NOT EXISTS idx_budget_members_user ON public.budget_members(user_id);

-- 3. CATEGORIES: Filtered by budget_id on every budget/settings page.
CREATE INDEX IF NOT EXISTS idx_categories_budget ON public.categories(budget_id);

-- 4. SAVINGS_GOALS: Filtered by budget_id on goals page.
CREATE INDEX IF NOT EXISTS idx_savings_goals_budget ON public.savings_goals(budget_id);

-- 5. RECURRING_EXPENSES: Filtered by budget_id on settings + home page.
CREATE INDEX IF NOT EXISTS idx_recurring_budget ON public.recurring_expenses(budget_id);

-- 6. INVITATIONS: Filtered by budget_id on settings page.
CREATE INDEX IF NOT EXISTS idx_invitations_budget ON public.invitations(budget_id);
