-- Same as migration 20260520010000_security_function_grants_and_public_dates_view.sql
-- Run in Supabase Dashboard → SQL → New query.

create or replace function public.parse_malaga_local_datetime_to_timestamptz(p text)
returns timestamptz
language sql
stable
set search_path = public
as $$
  select case
    when p is not null and btrim(p) ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' then
      ((left(btrim(p), 10) || ' ' || substring(btrim(p) from 12 for 5))::timestamp without time zone
        at time zone 'Europe/Madrid')
    else null
  end
$$;

revoke all on function public.parse_malaga_local_datetime_to_timestamptz(text) from public, anon, authenticated;
grant execute on function public.parse_malaga_local_datetime_to_timestamptz(text) to service_role;

drop function if exists public.get_driver_booked_service_days();
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

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_driver() from public, anon, authenticated;
revoke all on function public.portal_interest_ticket_message_after_ins() from public, anon, authenticated;
revoke all on function public.transfer_bookings_payment_columns_privileged_only() from public, anon, authenticated;
revoke all on function public.transfer_bookings_set_client_defaults() from public, anon, authenticated;

drop function if exists public.mark_portal_interest_ticket_read(uuid);

drop policy if exists "portal_interest_tickets_update_own_read" on public.portal_interest_tickets;

create policy "portal_interest_tickets_update_own_read"
  on public.portal_interest_tickets for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create or replace function public.portal_interest_tickets_client_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  ) then
    return new;
  end if;

  if auth.uid() is distinct from old.owner_id then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.category is distinct from old.category
     or new.status is distinct from old.status
     or new.created_at is distinct from old.created_at then
    raise exception 'Clients may only update read timestamps on interest tickets'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.portal_interest_tickets_client_update_guard() from public, anon, authenticated;

drop trigger if exists portal_interest_tickets_client_update_guard on public.portal_interest_tickets;

create trigger portal_interest_tickets_client_update_guard
  before update on public.portal_interest_tickets
  for each row
  execute function public.portal_interest_tickets_client_update_guard();
