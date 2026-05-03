-- Separate admin toggle: formal proposals vs PDF library (terms / thank-you) on client dashboard

alter table public.profiles
  add column if not exists portal_pdf_library_enabled boolean not null default false;

comment on column public.profiles.portal_pdf_library_enabled is
  'When true, client sees the “Your PDF library” block on the dashboard (terms / thank-you) if they have client_document_access rows.';

comment on column public.profiles.portal_proposals_enabled is
  'When true, client sees the formal proposals list on the dashboard.';

-- Preserve behaviour for existing accounts that already had proposals area on
update public.profiles
set portal_pdf_library_enabled = true
where portal_proposals_enabled = true
  and portal_pdf_library_enabled = false;
