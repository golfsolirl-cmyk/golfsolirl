-- General PDFs sent to a client (admin desk / portal email) — shown on Documents tab.

create table if not exists public.portal_client_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  document_kind text not null default 'admin_sent'
    check (document_kind in ('admin_sent', 'letter', 'quote', 'receipt', 'other')),
  storage_path text not null,
  source_label text,
  created_at timestamptz not null default now()
);

create index if not exists portal_client_documents_owner_created_idx
  on public.portal_client_documents (owner_id, created_at desc);

comment on table public.portal_client_documents is
  'PDFs emailed to the client from admin tools; stored in client-portal-pdfs and listed on the Documents tab.';

alter table public.portal_client_documents enable row level security;

drop policy if exists "portal_client_documents_select_own" on public.portal_client_documents;
create policy "portal_client_documents_select_own"
  on public.portal_client_documents for select
  using (owner_id = auth.uid());

drop policy if exists "portal_client_documents_select_admin" on public.portal_client_documents;
create policy "portal_client_documents_select_admin"
  on public.portal_client_documents for select
  using (public.is_admin());

do $body$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_client_documents'
  ) then
    execute 'alter publication supabase_realtime add table public.portal_client_documents';
  end if;
end
$body$;
