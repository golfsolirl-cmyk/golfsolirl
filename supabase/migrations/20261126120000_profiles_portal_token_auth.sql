-- Portal private link + email OTP state (server-only updates via service role).
alter table public.profiles
  add column if not exists portal_token text,
  add column if not exists portal_token_issued_at timestamptz,
  add column if not exists portal_revoked_at timestamptz,
  add column if not exists portal_auth jsonb not null default '{}'::jsonb;

comment on column public.profiles.portal_token is 'Unguessable segment for /portal/<token> client access.';
comment on column public.profiles.portal_token_issued_at is 'When the current portal_token was issued; used for link TTL.';
comment on column public.profiles.portal_revoked_at is 'When set, portal link and OTP sessions are invalid until re-issued.';
comment on column public.profiles.portal_auth is 'Server-managed OTP state: codeHash, codeExp, tries, sends[], verifiedAt.';

create unique index if not exists profiles_portal_token_unique
  on public.profiles (portal_token)
  where portal_token is not null and portal_token <> '';