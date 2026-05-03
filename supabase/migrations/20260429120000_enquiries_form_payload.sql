-- Structured answers from each site form (transport, package builder, etc.) for admin submission detail.
alter table public.enquiries
  add column if not exists form_payload jsonb;

comment on column public.enquiries.form_payload is 'Optional { form, fields } from /api/enquiry for admin UI; legacy rows null.';
