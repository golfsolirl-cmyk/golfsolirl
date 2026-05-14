-- =============================================================================
-- Golf Sol Ireland — RLS inventory & verification helpers
-- =============================================================================
-- This file does NOT replace migrations in supabase/migrations/.
-- Run verification sections in Supabase SQL editor against staging/prod clones.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Tables in public schema WITHOUT row level security (should be empty)
-- -----------------------------------------------------------------------------
select n.nspname as schema_name,
       c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity
order by c.relname;

-- -----------------------------------------------------------------------------
-- 2) Tables WITH RLS enabled (spot-check new additions land here)
-- -----------------------------------------------------------------------------
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity
order by c.relname;

-- -----------------------------------------------------------------------------
-- 3) Policy count per table (zero policies + RLS ON => blocked — intentional?)
-- -----------------------------------------------------------------------------
select schemaname,
       tablename,
       count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by schemaname, tablename
order by policy_count asc, tablename;

-- =============================================================================
-- 4) Repo migration inventory (tables explicitly enabling RLS)
--    Cross-check with sections (1)-(3) after applying all migrations.
-- =============================================================================
-- profiles, enquiries, proposals          — 20260330120000_init_auth_and_crm.sql
-- package_builds (+ related)              — 20260330180000_package_builds.sql, ...
-- client_document_access                  — 20260330220000_client_document_access.sql
-- portal_client_updates                   — 20260430140000_website_form_packages_portal_updates.sql
-- transport_form_public_flags             — 20260501141500_transport_form_public_flags.sql
-- driver_calendar_bookings                — 20260501130000_driver_calendar_bookings.sql
-- portal_interest_tickets / messages      — 20260503120000_portal_contact_onboarding_interest_tickets.sql
-- portal_invoices                         — 20260505120000_portal_invoices.sql
-- drivers, transfer_bookings, events,
-- driver_positions, trip_reviews          — 20260504120000_portal_enquiries_transfer_reviews.sql
-- email_account_anchors, auth_email_blocks — 20260505260000_email_anchor_auth_blocks_enquiries.sql
-- portal_client_transfer_documents        — 20260510210000_portal_client_transfer_documents.sql
-- realtime publication                    — 20260505240000_realtime_client_portal_dashboard.sql (review exposed tables)

-- =============================================================================
-- 5) Hardening stubs (DO NOT run blindly — tailor to product & migrate properly)
-- =============================================================================
-- Example pattern for a new sensitive table:
--
-- alter table public.my_new_table enable row level security;
-- alter table public.my_new_table force row level security;
--
-- create policy "my_new_table_select_owner"
--   on public.my_new_table for select
--   using (owner_user_id = auth.uid());
--
-- create policy "my_new_table_admin_all"
--   on public.my_new_table for all
--   using (public.is_admin())
--   with check (public.is_admin());
