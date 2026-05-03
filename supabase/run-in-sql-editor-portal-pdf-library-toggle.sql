-- Same as migration 20260503180000_portal_pdf_library_toggle.sql — run in Supabase SQL editor if needed

alter table public.profiles
  add column if not exists portal_pdf_library_enabled boolean not null default false;

comment on column public.profiles.portal_pdf_library_enabled is
  'When true, client sees the “Your PDF library” block on the dashboard (terms / thank-you) if they have client_document_access rows.';

comment on column public.profiles.portal_proposals_enabled is
  'When true, client sees the formal proposals list on the dashboard.';

update public.profiles
set portal_pdf_library_enabled = true
where portal_proposals_enabled = true
  and portal_pdf_library_enabled = false;
