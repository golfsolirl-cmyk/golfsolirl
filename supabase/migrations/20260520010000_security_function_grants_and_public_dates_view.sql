-- Fix Security Advisor: function_search_path_mutable, anon/authenticated SECURITY DEFINER RPC warnings.
-- Intentional public booked-day list moves from SECURITY DEFINER RPC → date-only view.

-- ---------------------------------------------------------------------------
-- 1) parse_malaga_local_datetime_to_timestamptz — immutable search_path (service_role only)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 2) Public booked days — date-only table (see 20260520020000 for full sync setup)
-- ---------------------------------------------------------------------------
drop function if exists public.get_driver_booked_service_days();
drop view if exists public.driver_booked_service_days_public;

-- ---------------------------------------------------------------------------
-- 3) Internal / trigger helpers — not callable via PostgREST /rpc
-- ---------------------------------------------------------------------------
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_driver() from public, anon, authenticated;
revoke all on function public.portal_interest_ticket_message_after_ins() from public, anon, authenticated;
revoke all on function public.transfer_bookings_payment_columns_privileged_only() from public, anon, authenticated;
revoke all on function public.transfer_bookings_set_client_defaults() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) Interest ticket mark-read — table update + guard (drop SECURITY DEFINER RPC)
-- ---------------------------------------------------------------------------
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
