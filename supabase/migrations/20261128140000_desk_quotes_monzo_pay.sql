-- Monzo pay-page fields on desk quotes (TOW-style bank transfer flow).
-- Stripe checkout remains optional secondary when STRIPE_SECRET_KEY is set.

alter table public.desk_quotes
  add column if not exists customer_reported_paid_at timestamptz,
  add column if not exists pay_details_emailed_at timestamptz,
  add column if not exists valid_until date,
  add column if not exists due_date date,
  add column if not exists line_items jsonb not null default '[]'::jsonb,
  add column if not exists document_kind text;

comment on column public.desk_quotes.customer_reported_paid_at is
  'Customer tapped I’ve paid on the Monzo pay page; admin still confirms Paid.';
comment on column public.desk_quotes.line_items is
  'Optional quote/invoice lines [{description, qty, unitEur}] for PDF and emails.';

-- Allow customer_reported status without breaking existing check constraint: store on timestamp only.
