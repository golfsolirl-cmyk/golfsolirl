-- Fixes Security Advisor ERROR: security_definer_view on driver_booked_service_days_public.
-- Same as migration 20260520020000_driver_booked_service_days_public_table.sql

drop view if exists public.driver_booked_service_days_public;

create table if not exists public.driver_booked_service_days_public (
  service_day date primary key
);

comment on table public.driver_booked_service_days_public is
  'Blocked calendar days for public date pickers; synced from driver_calendar_bookings (no PII).';

alter table public.driver_booked_service_days_public enable row level security;

drop policy if exists "driver_booked_service_days_public_select" on public.driver_booked_service_days_public;
drop policy if exists "driver_booked_service_days_public_admin_write" on public.driver_booked_service_days_public;

create policy "driver_booked_service_days_public_select"
  on public.driver_booked_service_days_public for select
  to anon, authenticated
  using (true);

create policy "driver_booked_service_days_public_admin_write"
  on public.driver_booked_service_days_public for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.sync_driver_booked_service_days_public()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.driver_booked_service_days_public;
  insert into public.driver_booked_service_days_public (service_day)
  select distinct b.service_day
  from public.driver_calendar_bookings b;
  return null;
end;
$$;

revoke all on function public.sync_driver_booked_service_days_public() from public, anon, authenticated;

drop trigger if exists driver_calendar_bookings_sync_public_days on public.driver_calendar_bookings;

create trigger driver_calendar_bookings_sync_public_days
  after insert or update or delete on public.driver_calendar_bookings
  for each statement
  execute function public.sync_driver_booked_service_days_public();

delete from public.driver_booked_service_days_public;
insert into public.driver_booked_service_days_public (service_day)
select distinct b.service_day
from public.driver_calendar_bookings b;
