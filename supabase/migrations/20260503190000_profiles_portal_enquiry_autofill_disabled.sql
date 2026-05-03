-- After admin clears/resets portal contact, block /api/sync-portal-profile from re-copying name/phone from enquiries.
alter table public.profiles
  add column if not exists portal_enquiry_autofill_disabled boolean not null default false;

comment on column public.profiles.portal_enquiry_autofill_disabled is
  'When true, sync-portal-profile skips filling empty full_name/phone from enquiries (set on dashboard clear / onboarding reset). Cleared when the client saves portal contact or admin saves a non-empty account reference.';
