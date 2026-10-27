-- Public newsletter list for /newsletter. Service role writes. No API policies.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  full_name text,
  source_page text,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create unique index if not exists newsletter_subscribers_email_normalized_uidx
  on public.newsletter_subscribers (email_normalized);

comment on table public.newsletter_subscribers is
  'Email signups from /newsletter. Written by the service role. No anon or authenticated access.';

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from anon, authenticated;
