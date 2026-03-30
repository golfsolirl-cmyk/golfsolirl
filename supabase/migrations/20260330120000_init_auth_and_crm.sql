-- Golf Sol Ireland — profiles, enquiries, proposals + RLS
-- Apply in Supabase Dashboard → SQL → New query → Run.
--
-- After migration:
-- 1) Authentication → URL configuration → Site URL = your production origin
-- 2) Redirect URLs: http://localhost:5173/auth/callback and https://YOUR_DOMAIN/auth/callback
-- 3) Enable Email provider + "Confirm email" / magic link as needed
-- 4) Promote admin: UPDATE public.profiles SET role = 'admin' WHERE email = 'you@yourdomain.com';

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- SECURITY DEFINER: reads profiles without re-entering RLS (avoids infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_if_admin" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_if_admin"
  on public.profiles for select
  using (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'client'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Enquiries (written by service role from /api/enquiry; read by admins)
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  email text not null,
  full_name text not null,
  interest text,
  phone_whatsapp text,
  best_time_to_call text,
  created_at timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

drop policy if exists "enquiries_select_admin" on public.enquiries;

create policy "enquiries_select_admin"
  on public.enquiries for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Proposals (optional CRM rows; link owner_id when you persist proposals)
-- ---------------------------------------------------------------------------
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  proposal_id text not null unique,
  owner_id uuid references public.profiles (id) on delete set null,
  title text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposals_owner_idx on public.proposals (owner_id);
create index if not exists proposals_created_at_idx on public.proposals (created_at desc);

alter table public.proposals enable row level security;

drop policy if exists "proposals_select_owner" on public.proposals;
drop policy if exists "proposals_select_admin" on public.proposals;
drop policy if exists "proposals_insert_owner" on public.proposals;
drop policy if exists "proposals_write_admin" on public.proposals;

create policy "proposals_select_owner"
  on public.proposals for select
  using (owner_id is not null and owner_id = auth.uid());

create policy "proposals_select_admin"
  on public.proposals for select
  using (public.is_admin());

create policy "proposals_insert_owner"
  on public.proposals for insert
  with check (owner_id = auth.uid());

create policy "proposals_write_admin"
  on public.proposals for all
  using (public.is_admin())
  with check (public.is_admin());
