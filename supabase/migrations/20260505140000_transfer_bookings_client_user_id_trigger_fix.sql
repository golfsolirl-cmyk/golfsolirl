-- Fix: trigger previously set client_user_id only when NOT is_admin().
-- Admins using the client dashboard left client_user_id null → NOT NULL violation.
-- Always default null client_user_id from auth.uid() when the JWT subject is present.
-- Admin-created rows for another client should pass client_user_id explicitly in the insert.

create or replace function public.transfer_bookings_set_client_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.client_user_id is null and auth.uid() is not null then
    new.client_user_id := auth.uid();
  end if;
  if not public.is_admin() then
    if new.client_email is null or btrim(new.client_email) = '' then
      new.client_email := coalesce((select trim(p.email) from public.profiles p where p.id = auth.uid()), '');
    end if;
  end if;
  return new;
end;
$$;
