-- Admin Gmail connection (encrypted tokens) + branded/Gmail send history.
-- Tokens are never exposed to the browser. Service role only.

create table if not exists public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'gmail' check (provider in ('gmail')),
  email_address text not null default '',
  access_token_encrypted text not null default '',
  refresh_token_encrypted text not null default '',
  token_expires_at timestamptz,
  scopes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists email_accounts_user_idx on public.email_accounts (user_id);

comment on table public.email_accounts is
  'Connected admin mailboxes. OAuth tokens are encrypted at rest and must not be selected from the browser.';

create table if not exists public.email_activity (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles (id) on delete set null,
  enquiry_id uuid references public.enquiries (id) on delete set null,
  gmail_thread_id text,
  gmail_message_id text,
  provider text not null check (provider in ('gmail', 'resend')),
  provider_message_id text,
  to_email text not null default '',
  cc_email text not null default '',
  bcc_email text not null default '',
  from_email text not null default '',
  subject text not null default '',
  template_id text,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  attachment_names text[] not null default '{}',
  idempotency_key text unique,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_activity_thread_idx on public.email_activity (gmail_thread_id);
create index if not exists email_activity_enquiry_idx on public.email_activity (enquiry_id);
create index if not exists email_activity_to_email_idx on public.email_activity (to_email);
create index if not exists email_activity_sent_at_idx on public.email_activity (sent_at desc);
create index if not exists email_activity_created_at_idx on public.email_activity (created_at desc);
create index if not exists email_activity_status_idx on public.email_activity (status);

comment on table public.email_activity is
  'Admin outbound email history (Gmail thread replies and Resend branded mail). No OAuth secrets.';

create table if not exists public.email_template_overrides (
  template_id text primary key,
  heading text not null default '',
  introduction text not null default '',
  body text not null default '',
  cta_label text not null default '',
  cta_url text not null default '',
  closing text not null default '',
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

comment on table public.email_template_overrides is
  'Admin-editable template copy only. Branding and HTML layout stay in code.';

alter table public.email_accounts enable row level security;
alter table public.email_activity enable row level security;
alter table public.email_template_overrides enable row level security;

revoke all on public.email_accounts from anon, authenticated;
revoke all on public.email_activity from anon, authenticated;
revoke all on public.email_template_overrides from anon, authenticated;

grant all on public.email_accounts to service_role;
grant all on public.email_activity to service_role;
grant all on public.email_template_overrides to service_role;
