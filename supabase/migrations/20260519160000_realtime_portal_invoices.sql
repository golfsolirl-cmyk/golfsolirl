-- Client dashboard: refetch invoice pay links when admin updates portal_invoices.

do $body$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_invoices'
  ) then
    execute 'alter publication supabase_realtime add table public.portal_invoices';
  end if;
end
$body$;
