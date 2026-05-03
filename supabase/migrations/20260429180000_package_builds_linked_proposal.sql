-- Link saved calculator builds to a formal proposal row (e.g. manual PDF payload) for the client portal.
alter table public.package_builds
  add column if not exists linked_proposal_id uuid references public.proposals (id) on delete set null;

create index if not exists package_builds_linked_proposal_idx
  on public.package_builds (linked_proposal_id)
  where linked_proposal_id is not null;

comment on column public.package_builds.linked_proposal_id is
  'When set, this saved package build shows the linked formal proposal (payload) from proposals in the client dashboard.';
