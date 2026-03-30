-- Paste into Supabase Dashboard → SQL Editor → New query → Run
-- Fixes: "column package_builds.client_details does not exist"

alter table public.package_builds
  add column if not exists client_details jsonb not null default '{}'::jsonb;

drop policy if exists "package_builds_delete_own_or_admin" on public.package_builds;

create policy "package_builds_delete_own_or_admin"
  on public.package_builds for delete
  using (owner_id = auth.uid() or public.is_admin());
