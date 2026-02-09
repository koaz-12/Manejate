-- Enable RLS
ALTER TABLE "public"."savings_goals" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts/duplicates (optional but safer for idempotency if named differently)
DROP POLICY IF EXISTS "Enable read access for budget members" ON "public"."savings_goals";
DROP POLICY IF EXISTS "Enable insert for budget members" ON "public"."savings_goals";
DROP POLICY IF EXISTS "Enable update for budget members" ON "public"."savings_goals";
DROP POLICY IF EXISTS "Enable delete for budget members" ON "public"."savings_goals";

-- Policy for SELECT
CREATE POLICY "Enable read access for budget members" ON "public"."savings_goals"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM budget_members bm
    WHERE bm.budget_id = savings_goals.budget_id
    AND bm.user_id = auth.uid()
  )
);

-- Policy for INSERT
CREATE POLICY "Enable insert for budget members" ON "public"."savings_goals"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_members bm
    WHERE bm.budget_id = budget_id
    AND bm.user_id = auth.uid()
  )
);

-- Policy for UPDATE
CREATE POLICY "Enable update for budget members" ON "public"."savings_goals"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM budget_members bm
    WHERE bm.budget_id = savings_goals.budget_id
    AND bm.user_id = auth.uid()
  )
);

-- Policy for DELETE
CREATE POLICY "Enable delete for budget members" ON "public"."savings_goals"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM budget_members bm
    WHERE bm.budget_id = savings_goals.budget_id
    AND bm.user_id = auth.uid()
  )
);
