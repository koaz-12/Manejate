-- Add role column to invitations
alter table public.invitations 
add column role text check (role in ('admin', 'editor', 'viewer')) not null default 'editor';

-- Update RLS if needed (Created policies usually don't filter by column content, so likely fine)
