-- Same as migration 20260430140000_website_form_packages_portal_updates.sql — run in Supabase SQL Editor if needed.

alter table public.package_builds drop constraint if exists package_builds_source_check;

alter table public.package_builds
  add constraint package_builds_source_check
  check (
    source in (
      'landing',
      'packages',
      'admin_transfer',
      'admin_golf',
      'admin_hotel',
      'website_form'
    )
  );

create table if not exists public.portal_client_updates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  summary text,
  email_subject text not null,
  template_key text not null default 'branded',
  attachment_filenames jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portal_client_updates_owner_created_idx
  on public.portal_client_updates (owner_id, created_at desc);

alter table public.portal_client_updates enable row level security;

drop policy if exists "portal_client_updates_select_own" on public.portal_client_updates;
drop policy if exists "portal_client_updates_select_admin" on public.portal_client_updates;

create policy "portal_client_updates_select_own"
  on public.portal_client_updates for select
  using (auth.uid() = owner_id);

create policy "portal_client_updates_select_admin"
  on public.portal_client_updates for select
  using (public.is_admin());
