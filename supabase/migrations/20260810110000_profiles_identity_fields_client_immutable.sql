-- Lock client-writable identity fields that authorize portal RLS / checkout.
-- Without this, authenticated clients can UPDATE profiles.email or
-- profiles.account_reference_id (only role was immutable) and then read other
-- guests' enquiries / transfers via enquiries_select_own and
-- transfer_bookings_select_client, or create Stripe Checkout for a victim transfer
-- via clientOwnsTransferBooking account_reference_id matching.

-- ---------------------------------------------------------------------------
-- 1) BEFORE UPDATE guard — clients cannot change identity columns
-- ---------------------------------------------------------------------------
create or replace function public.profiles_identity_columns_privileged_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privileged boolean;
begin
  privileged :=
    public.is_admin()
    or coalesce(auth.role(), '') = 'service_role'
    or coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), '') = 'service_role';

  if privileged then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.email is distinct from old.email
     or new.account_reference_id is distinct from old.account_reference_id then
    raise exception 'Clients cannot change profile identity fields (email, account reference, role)'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.profiles_identity_columns_privileged_only() from public, anon, authenticated;

drop trigger if exists tr_profiles_identity_lock on public.profiles;

create trigger tr_profiles_identity_lock
  before update on public.profiles
  for each row
  execute function public.profiles_identity_columns_privileged_only();

-- ---------------------------------------------------------------------------
-- 2) enquiries_select_own — prefer JWT email over mutable profiles.email
-- ---------------------------------------------------------------------------
drop policy if exists "enquiries_select_own" on public.enquiries;

create policy "enquiries_select_own"
  on public.enquiries for select
  to authenticated
  using (
    lower(trim(coalesce(email, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    or (
      (select p.account_reference_id from public.profiles p where p.id = auth.uid()) is not null
      and reference_id = (select p.account_reference_id from public.profiles p where p.id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 3) transfer_bookings_select_client — email fallback only for unattached rows,
--    matched against JWT email (not profiles.email)
-- ---------------------------------------------------------------------------
drop policy if exists "transfer_bookings_select_client" on public.transfer_bookings;

create policy "transfer_bookings_select_client"
  on public.transfer_bookings for select
  to authenticated
  using (
    client_user_id = auth.uid()
    or (
      client_user_id is null
      and btrim(coalesce(client_email, '')) <> ''
      and lower(btrim(client_email)) = lower(btrim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );
