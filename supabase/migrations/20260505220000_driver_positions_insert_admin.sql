-- Let admins insert driver_positions (e.g. driver desk preview / ops testing without a driver session).
drop policy if exists "driver_positions_insert_admin" on public.driver_positions;
create policy "driver_positions_insert_admin"
  on public.driver_positions for insert
  with check (public.is_admin());
