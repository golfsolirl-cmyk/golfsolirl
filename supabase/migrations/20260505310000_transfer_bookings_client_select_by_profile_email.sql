-- Allow portal clients to read transfer rows created from website forms (no client_user_id yet)
-- when the row email matches their profile email (same person, later login).

drop policy if exists "transfer_bookings_select_client" on public.transfer_bookings;

create policy "transfer_bookings_select_client"
  on public.transfer_bookings for select
  using (
    client_user_id = auth.uid()
    or (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and btrim(coalesce(client_email, '')) <> ''
          and lower(btrim(client_email)) = lower(btrim(coalesce(p.email, '')))
      )
    )
  );
