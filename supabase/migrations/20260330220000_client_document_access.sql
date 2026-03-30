-- Gates /documents/terms and /documents/welcome until an admin sends access to the client
create table if not exists public.client_document_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  document_kind text not null check (document_kind in ('terms', 'welcome')),
  created_at timestamptz not null default now(),
  unique (owner_id, document_kind)
);

create index if not exists client_document_access_owner_idx on public.client_document_access (owner_id);

alter table public.client_document_access enable row level security;

drop policy if exists "client_document_access_select_own" on public.client_document_access;
drop policy if exists "client_document_access_select_admin" on public.client_document_access;
drop policy if exists "client_document_access_insert_admin" on public.client_document_access;

create policy "client_document_access_select_own"
  on public.client_document_access for select
  using (owner_id = auth.uid());

create policy "client_document_access_select_admin"
  on public.client_document_access for select
  using (public.is_admin());

create policy "client_document_access_insert_admin"
  on public.client_document_access for insert
  with check (public.is_admin());
