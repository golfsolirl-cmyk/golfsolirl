-- Client-editable trip details (proposal-style fields) + delete own builds

alter table public.package_builds
  add column if not exists client_details jsonb not null default '{}'::jsonb;

drop policy if exists "package_builds_delete_own_or_admin" on public.package_builds;

create policy "package_builds_delete_own_or_admin"
  on public.package_builds for delete
  using (owner_id = auth.uid() or public.is_admin());
