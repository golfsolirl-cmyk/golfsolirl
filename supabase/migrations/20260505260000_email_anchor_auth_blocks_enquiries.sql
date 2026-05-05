-- Stable account reference per contact email (first website form creates it; later forms reuse it).
-- Optional auth blocks for magic link / enquiries / manual portal creates.

create table if not exists public.email_account_anchors (
  email text primary key,
  account_reference_id text not null unique,
  created_at timestamptz not null default now(),
  constraint email_account_anchors_email_lower check (email = lower(email))
);

comment on table public.email_account_anchors is 'One stable GSI-style account_reference_id per contact email; tied to enquiries and copied to profiles on first sign-in when empty.';

create index if not exists email_account_anchors_ref_idx on public.email_account_anchors (account_reference_id);

alter table public.email_account_anchors enable row level security;

create table if not exists public.auth_email_blocks (
  email text primary key,
  blocked_at timestamptz not null default now(),
  reason text,
  constraint auth_email_blocks_email_lower check (email = lower(email))
);

comment on table public.auth_email_blocks is 'Admin-only block list: magic link, enquiries, and manual portal user create are rejected for these addresses.';

alter table public.auth_email_blocks enable row level security;

alter table public.enquiries
  add column if not exists account_anchor_ref text;

comment on column public.enquiries.account_anchor_ref is 'Stable account id from email_account_anchors for this submitter email (same across repeat forms).';

drop policy if exists "email_account_anchors_admin_all" on public.email_account_anchors;
create policy "email_account_anchors_admin_all"
  on public.email_account_anchors for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth_email_blocks_admin_all" on public.auth_email_blocks;
create policy "auth_email_blocks_admin_all"
  on public.auth_email_blocks for all
  using (public.is_admin())
  with check (public.is_admin());
