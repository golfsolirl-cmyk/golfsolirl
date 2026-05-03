-- Run in Supabase SQL editor if migrations are not applied yet.
alter table public.enquiries
  add column if not exists form_payload jsonb;

comment on column public.enquiries.form_payload is 'Optional { form, fields } from /api/enquiry for admin UI; legacy rows null.';
