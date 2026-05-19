-- Client dashboard subscribes to transfer_bookings changes; include in Realtime publication.

do $body$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transfer_bookings'
  ) then
    execute 'alter publication supabase_realtime add table public.transfer_bookings';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_client_transfer_documents'
  ) then
    execute 'alter publication supabase_realtime add table public.portal_client_transfer_documents';
  end if;
end
$body$;
