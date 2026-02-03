-- Invitations Table for Magic Links
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  token text unique not null, /* Secure Random Token */
  created_by uuid references public.profiles(id) not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_used boolean default false /* Optional: One-time vs Multi-use? Let's assume Multi-use for 24h for simplicity initially, or One-time per person? Multi-use is easier for WhatsApp */
);

-- RLS
alter table public.invitations enable row level security;

-- Policy: Only members can see/create invites for their budget
create policy "Members can view invites"
on public.invitations for select
using (
  exists (
    select 1 from public.budget_members
    where budget_id = public.invitations.budget_id
    and user_id = auth.uid()
  )
);

create policy "Admins/Editors can create invites"
on public.invitations for insert
with check (
  exists (
    select 1 from public.budget_members
    where budget_id = public.invitations.budget_id
    and user_id = auth.uid()
    and role in ('admin', 'editor')
  )
);
