-- Add parent_id to categories for nesting
alter table public.categories
add column parent_id uuid references public.categories(id) on delete cascade;

-- Optional: Index for performance on lookups
create index idx_categories_parent_id on public.categories(parent_id);

-- Policy to ensure you can only see/link categories in your budget is already covered by existing policies 
-- as long as RLS checks budget_id, which both parent and child should share.
