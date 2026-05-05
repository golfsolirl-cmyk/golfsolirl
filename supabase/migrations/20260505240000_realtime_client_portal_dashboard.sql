-- Let logged-in clients receive postgres_changes on their own rows so the dashboard
-- refetches after admin clears portal data (no full page reload required).
-- Idempotent: safe if some tables were already in the publication.

do $body$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    execute 'alter publication supabase_realtime add table public.profiles';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_client_updates'
  ) then
    execute 'alter publication supabase_realtime add table public.portal_client_updates';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'package_builds'
  ) then
    execute 'alter publication supabase_realtime add table public.package_builds';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'proposals'
  ) then
    execute 'alter publication supabase_realtime add table public.proposals';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'client_document_access'
  ) then
    execute 'alter publication supabase_realtime add table public.client_document_access';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_interest_tickets'
  ) then
    execute 'alter publication supabase_realtime add table public.portal_interest_tickets';
  end if;
end
$body$;
