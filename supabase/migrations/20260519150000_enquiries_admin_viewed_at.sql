-- Track when an admin has reviewed a website form submission (shared across admin users).

alter table public.enquiries
  add column if not exists admin_viewed_at timestamptz;

comment on column public.enquiries.admin_viewed_at is
  'Set when an admin opens submission detail; moves the row out of “Recent” into “Already viewed”.';

create index if not exists enquiries_admin_viewed_at_idx on public.enquiries (admin_viewed_at desc nulls first);

drop policy if exists "enquiries_update_admin" on public.enquiries;

create policy "enquiries_update_admin"
  on public.enquiries for update
  using (public.is_admin())
  with check (public.is_admin());
