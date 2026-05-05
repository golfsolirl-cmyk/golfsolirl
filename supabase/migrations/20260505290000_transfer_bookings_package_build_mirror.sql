-- Link optional mirror row: client trip workspace (package_builds) → transfer_bookings for Operations.

alter table public.transfer_bookings
  add column if not exists package_build_id uuid references public.package_builds (id) on delete set null;

comment on column public.transfer_bookings.package_build_id is 'When set, this row mirrors portal trip workspace route for that package (one row per build).';

create unique index if not exists transfer_bookings_package_build_mirror_uidx
  on public.transfer_bookings (package_build_id)
  where package_build_id is not null;

-- Client may remove the mirrored ops row when they clear the trip route (package mirror only).
drop policy if exists "transfer_bookings_delete_client_package_mirror" on public.transfer_bookings;

create policy "transfer_bookings_delete_client_package_mirror"
  on public.transfer_bookings for delete
  using (
    auth.uid() = client_user_id
    and package_build_id is not null
  );
