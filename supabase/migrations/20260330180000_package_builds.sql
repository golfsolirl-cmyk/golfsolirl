-- Saved calculator / package configurations per client (and admin visibility)

create table if not exists public.package_builds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  source text not null check (source in ('landing', 'packages')),
  label text,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_builds_owner_created_idx on public.package_builds (owner_id, created_at desc);
create index if not exists package_builds_created_idx on public.package_builds (created_at desc);

alter table public.package_builds enable row level security;

drop policy if exists "package_builds_select_own_or_admin" on public.package_builds;
drop policy if exists "package_builds_insert_own" on public.package_builds;
drop policy if exists "package_builds_update_own_or_admin" on public.package_builds;

create policy "package_builds_select_own_or_admin"
  on public.package_builds for select
  using (owner_id = auth.uid() or public.is_admin());

create policy "package_builds_insert_own"
  on public.package_builds for insert
  with check (owner_id = auth.uid());

create policy "package_builds_update_own_or_admin"
  on public.package_builds for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
