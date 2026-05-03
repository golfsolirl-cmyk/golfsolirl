-- Run in Supabase SQL editor if migrations are not applied.

create table if not exists public.transport_form_public_flags (
  id smallint primary key default 1 check (id = 1),
  hide_collection_datetime boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.transport_form_public_flags (id, hide_collection_datetime)
values (1, false)
on conflict (id) do nothing;

alter table public.transport_form_public_flags enable row level security;

drop policy if exists "transport_form_public_flags_select_anon" on public.transport_form_public_flags;
drop policy if exists "transport_form_public_flags_admin_all" on public.transport_form_public_flags;

create policy "transport_form_public_flags_select_anon"
  on public.transport_form_public_flags for select
  using (true);

create policy "transport_form_public_flags_admin_all"
  on public.transport_form_public_flags for all
  using (public.is_admin())
  with check (public.is_admin());
