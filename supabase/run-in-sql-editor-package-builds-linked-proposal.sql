-- Same as migration 20260429180000_package_builds_linked_proposal.sql — run in Supabase SQL Editor if needed.
alter table public.package_builds
  add column if not exists linked_proposal_id uuid references public.proposals (id) on delete set null;

create index if not exists package_builds_linked_proposal_idx
  on public.package_builds (linked_proposal_id)
  where linked_proposal_id is not null;
