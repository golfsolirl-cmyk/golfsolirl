-- Same as migration 20260520000000_security_rls_hardening.sql
-- Paste into Supabase Dashboard → SQL → New query → Run (project axgweqjvvabzzrqpzgoe).

-- Security hardening: enable RLS on every public table + lock down PII (profiles, enquiries, etc.)
-- Fixes Supabase Advisor: rls_disabled_in_public, sensitive_columns_exposed

do $$
declare
  r record;
begin
  for r in
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity
  loop
    execute format('alter table public.%I enable row level security', r.table_name);
    raise notice 'RLS enabled on public.%', r.table_name;
  end loop;
end $$;

alter table if exists public.profiles force row level security;
alter table if exists public.enquiries force row level security;
alter table if exists public.email_account_anchors force row level security;
alter table if exists public.auth_email_blocks force row level security;
alter table if exists public.drivers force row level security;
alter table if exists public.transfer_bookings force row level security;
alter table if exists public.driver_calendar_bookings force row level security;
alter table if exists public.package_builds force row level security;
alter table if exists public.portal_invoices force row level security;
alter table if exists public.portal_interest_tickets force row level security;
alter table if exists public.portal_interest_ticket_messages force row level security;
alter table if exists public.portal_client_transfer_documents force row level security;
alter table if exists public.client_document_access force row level security;

alter table if exists public.profiles enable row level security;
alter table if exists public.enquiries enable row level security;
alter table if exists public.proposals enable row level security;
alter table if exists public.package_builds enable row level security;
alter table if exists public.client_document_access enable row level security;
alter table if exists public.portal_client_updates enable row level security;
alter table if exists public.driver_calendar_bookings enable row level security;
alter table if exists public.transport_form_public_flags enable row level security;
alter table if exists public.portal_interest_tickets enable row level security;
alter table if exists public.portal_interest_ticket_messages enable row level security;
alter table if exists public.drivers enable row level security;
alter table if exists public.transfer_bookings enable row level security;
alter table if exists public.transfer_booking_events enable row level security;
alter table if exists public.driver_positions enable row level security;
alter table if exists public.trip_reviews enable row level security;
alter table if exists public.portal_invoices enable row level security;
alter table if exists public.email_account_anchors enable row level security;
alter table if exists public.auth_email_blocks enable row level security;
alter table if exists public.portal_client_transfer_documents enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_if_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_if_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "enquiries_select_admin" on public.enquiries;
drop policy if exists "enquiries_select_own" on public.enquiries;
drop policy if exists "enquiries_update_admin" on public.enquiries;
drop policy if exists "enquiries_delete_admin" on public.enquiries;

create policy "enquiries_select_admin"
  on public.enquiries for select
  to authenticated
  using (public.is_admin());

create policy "enquiries_select_own"
  on public.enquiries for select
  to authenticated
  using (
    lower(trim(coalesce(email, ''))) = lower(trim(coalesce((select p.email from public.profiles p where p.id = auth.uid()), '')))
    or (
      (select p.account_reference_id from public.profiles p where p.id = auth.uid()) is not null
      and reference_id = (select p.account_reference_id from public.profiles p where p.id = auth.uid())
    )
  );

create policy "enquiries_update_admin"
  on public.enquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "enquiries_delete_admin"
  on public.enquiries for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "email_account_anchors_admin_all" on public.email_account_anchors;
create policy "email_account_anchors_admin_all"
  on public.email_account_anchors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "auth_email_blocks_admin_all" on public.auth_email_blocks;
create policy "auth_email_blocks_admin_all"
  on public.auth_email_blocks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "driver_calendar_bookings_admin_all" on public.driver_calendar_bookings;
create policy "driver_calendar_bookings_admin_all"
  on public.driver_calendar_bookings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "transport_form_public_flags_select_anon" on public.transport_form_public_flags;
drop policy if exists "transport_form_public_flags_admin_all" on public.transport_form_public_flags;

create policy "transport_form_public_flags_select_anon"
  on public.transport_form_public_flags for select
  to anon, authenticated
  using (true);

create policy "transport_form_public_flags_admin_all"
  on public.transport_form_public_flags for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
