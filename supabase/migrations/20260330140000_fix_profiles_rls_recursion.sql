-- Fix: "infinite recursion detected in policy for relation profiles"
-- Admin policies queried `profiles` under RLS, which re-evaluated the same policies.
-- Run this in Supabase SQL Editor if you already applied the older migration.

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

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_if_admin" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_if_admin"
  on public.profiles for select
  using (public.is_admin());

-- enquiries
drop policy if exists "enquiries_select_admin" on public.enquiries;

create policy "enquiries_select_admin"
  on public.enquiries for select
  using (public.is_admin());

-- proposals (admin paths only — owner policies unchanged)
drop policy if exists "proposals_select_admin" on public.proposals;
drop policy if exists "proposals_write_admin" on public.proposals;

create policy "proposals_select_admin"
  on public.proposals for select
  using (public.is_admin());

create policy "proposals_write_admin"
  on public.proposals for all
  using (public.is_admin())
  with check (public.is_admin());
