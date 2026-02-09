-- Add contribution_amount to savings_goals
ALTER TABLE "public"."savings_goals" 
ADD COLUMN "contribution_amount" numeric DEFAULT 0;
