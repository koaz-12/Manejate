-- Drop the existing check constraint
ALTER TABLE public.categories DROP CONSTRAINT categories_type_check;

-- Add the new check constraint including 'savings'
ALTER TABLE public.categories ADD CONSTRAINT categories_type_check 
CHECK (type IN ('fixed', 'variable', 'income', 'savings'));
