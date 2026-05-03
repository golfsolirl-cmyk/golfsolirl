-- Admin manual package sources + insert policy (same as migration 20260430120000_package_builds_admin_manual.sql).

alter table public.package_builds drop constraint if exists package_builds_source_check;

alter table public.package_builds
  add constraint package_builds_source_check
  check (
    source in (
      'landing',
      'packages',
      'admin_transfer',
      'admin_golf',
      'admin_hotel'
    )
  );

comment on column public.package_builds.source is 'landing|packages = client calculator; admin_* = staff-published manual quote (see config jsonb version 2).';

drop policy if exists "package_builds_insert_admin" on public.package_builds;

create policy "package_builds_insert_admin"
  on public.package_builds for insert
  with check (public.is_admin());
