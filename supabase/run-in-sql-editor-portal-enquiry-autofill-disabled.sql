-- Same as migration 20260503190000_profiles_portal_enquiry_autofill_disabled.sql

alter table public.profiles
  add column if not exists portal_enquiry_autofill_disabled boolean not null default false;

comment on column public.profiles.portal_enquiry_autofill_disabled is
  'When true, sync-portal-profile skips filling empty full_name/phone from enquiries.';
