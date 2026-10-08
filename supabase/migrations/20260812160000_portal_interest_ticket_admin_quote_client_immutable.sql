-- Clients must not set or change admin_quote_eur on portal_interest_tickets.
-- Column was added in 20260812140000; the existing client update guard only locked
-- id/owner_id/category/status/created_at, so owners could forge trip-desk quotes via RLS.

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

  -- Service role / non-owner paths (e.g. triggers) keep previous behaviour.
  if auth.uid() is distinct from old.owner_id then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.owner_id is distinct from old.owner_id
     or new.category is distinct from old.category
     or new.status is distinct from old.status
     or new.created_at is distinct from old.created_at
     or new.admin_quote_eur is distinct from old.admin_quote_eur then
    raise exception 'Clients may only update read timestamps on interest tickets'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.portal_interest_tickets_client_update_guard() is
  'Non-admin owners may only touch client_last_read_at / updated_at — not status, category, or admin_quote_eur.';

create or replace function public.portal_interest_tickets_client_insert_guard()
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

  -- Authenticated clients (and anon) cannot seed an admin quote on insert.
  if auth.uid() is not null and new.admin_quote_eur is not null then
    new.admin_quote_eur := null;
  end if;

  return new;
end;
$$;

drop trigger if exists portal_interest_tickets_client_insert_guard on public.portal_interest_tickets;

create trigger portal_interest_tickets_client_insert_guard
  before insert on public.portal_interest_tickets
  for each row
  execute function public.portal_interest_tickets_client_insert_guard();

revoke all on function public.portal_interest_tickets_client_insert_guard() from public, anon, authenticated;

comment on function public.portal_interest_tickets_client_insert_guard() is
  'Strip admin_quote_eur on client inserts so trip-desk prices stay admin-authored.';
