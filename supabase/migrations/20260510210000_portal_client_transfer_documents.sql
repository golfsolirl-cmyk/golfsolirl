-- Client portal: PDFs generated when admin saves a transfer quoted price (form echo, VAT quote, terms summary).
-- Files live in private Storage bucket `client-portal-pdfs`; metadata in portal_client_transfer_documents.

create table if not exists public.portal_client_transfer_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  transfer_booking_id uuid not null references public.transfer_bookings (id) on delete cascade,
  document_kind text not null check (document_kind in ('form_submission', 'vat_quote', 'terms_summary')),
  title text not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, transfer_booking_id, document_kind)
);

create index if not exists portal_client_transfer_documents_owner_created_idx
  on public.portal_client_transfer_documents (owner_id, created_at desc);

comment on table public.portal_client_transfer_documents is
  'PDFs pushed to the client dashboard when admin sets transfer admin_price_eur; storage_path is relative to bucket client-portal-pdfs.';

alter table public.portal_client_transfer_documents enable row level security;

drop policy if exists "portal_client_transfer_documents_select_own" on public.portal_client_transfer_documents;
create policy "portal_client_transfer_documents_select_own"
  on public.portal_client_transfer_documents for select
  using (owner_id = auth.uid());

drop policy if exists "portal_client_transfer_documents_select_admin" on public.portal_client_transfer_documents;
create policy "portal_client_transfer_documents_select_admin"
  on public.portal_client_transfer_documents for select
  using (public.is_admin());

-- Private bucket for PDF bytes (service role uploads; clients read via signed URL + RLS on this table).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-portal-pdfs',
  'client-portal-pdfs',
  false,
  52428800,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "client_portal_pdfs_select_own" on storage.objects;
create policy "client_portal_pdfs_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'client-portal-pdfs'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "client_portal_pdfs_admin_all" on storage.objects;
create policy "client_portal_pdfs_admin_all"
  on storage.objects for all to authenticated
  using (bucket_id = 'client-portal-pdfs' and public.is_admin())
  with check (bucket_id = 'client-portal-pdfs' and public.is_admin());

do $body$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_client_transfer_documents'
  ) then
    execute 'alter publication supabase_realtime add table public.portal_client_transfer_documents';
  end if;
end
$body$;
