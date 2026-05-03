-- Client portal: public account reference + gate proposals/PDF library until admin enables
alter table public.profiles
  add column if not exists account_reference_id text,
  add column if not exists portal_proposals_enabled boolean not null default false;

comment on column public.profiles.account_reference_id is 'Shown on client dashboard as account number (often matches enquiries.reference_id).';
comment on column public.profiles.portal_proposals_enabled is 'When true, client sees proposals and PDF library; admin toggles.';

drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
