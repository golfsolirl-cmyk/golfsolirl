-- Normalized phone for one trip-desk identity per number (website enquiry dedupe + profile uniqueness).

alter table public.enquiries
  add column if not exists phone_e164 text;

comment on column public.enquiries.phone_e164 is
  'Normalized phone key from computePhoneUniquenessKey (E.164-style); used to block repeat /api/enquiry for same number.';

create index if not exists enquiries_phone_e164_idx
  on public.enquiries (phone_e164)
  where phone_e164 is not null and length(trim(phone_e164)) > 0;

alter table public.profiles
  add column if not exists phone_e164 text;

comment on column public.profiles.phone_e164 is
  'Normalized phone; unique when set so one portal account maps to one mobile identity.';

create unique index if not exists profiles_phone_e164_unique
  on public.profiles (phone_e164)
  where phone_e164 is not null and length(trim(phone_e164)) > 0;
