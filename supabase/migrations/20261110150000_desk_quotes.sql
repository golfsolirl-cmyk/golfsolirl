-- Quotes and invoices sent from the admin Customers desk.
-- Accept / decline / pay links are resolved on the server with decision_token.

create table if not exists public.desk_quotes (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quote', 'invoice', 'note')),
  profile_id uuid references public.profiles (id) on delete set null,
  enquiry_id uuid references public.enquiries (id) on delete set null,
  portal_invoice_id uuid references public.portal_invoices (id) on delete set null,
  customer_email text not null,
  customer_name text not null default '',
  customer_phone text not null default '',
  reference_code text not null,
  title text not null default '',
  summary text not null default '',
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'eur',
  status text not null default 'sent' check (status in ('sent', 'accepted', 'declined', 'invoiced', 'paid', 'cancelled')),
  decision_token text not null unique,
  stripe_checkout_session_id text,
  stripe_checkout_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_at timestamptz,
  paid_at timestamptz
);

create index if not exists desk_quotes_email_idx
  on public.desk_quotes (lower(customer_email), created_at desc);

comment on table public.desk_quotes is
  'Admin-sent quotes, invoices, and notes. Quote emails use decision_token for accept and decline. Invoices store the Stripe pay link.';

alter table public.desk_quotes enable row level security;

drop policy if exists "desk_quotes_admin_all" on public.desk_quotes;
create policy "desk_quotes_admin_all"
  on public.desk_quotes for all
  using (public.is_admin())
  with check (public.is_admin());
