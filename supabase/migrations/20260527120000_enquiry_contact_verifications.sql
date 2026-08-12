-- Email OTP codes used to confirm contact details before website enquiry submit.
-- Service role only (no anon/authenticated policies).

create table if not exists public.enquiry_contact_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone_e164 text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  consume_token text unique,
  consume_token_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists enquiry_contact_verifications_email_phone_created_idx
  on public.enquiry_contact_verifications (email, phone_e164, created_at desc);

create index if not exists enquiry_contact_verifications_consume_token_idx
  on public.enquiry_contact_verifications (consume_token)
  where consume_token is not null;

comment on table public.enquiry_contact_verifications is
  'Short-lived email OTP + consume tokens for website form mobile/email confirmation.';

alter table public.enquiry_contact_verifications enable row level security;

-- Intentionally no policies: only service_role bypasses RLS for this table.
