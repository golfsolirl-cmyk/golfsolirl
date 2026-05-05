-- Admin-priced invoices: Stripe Checkout + PDF to client portal.

create table if not exists public.portal_invoices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  enquiry_id uuid references public.enquiries (id) on delete set null,
  enquiry_reference_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur',
  status text not null default 'sent' check (status in ('sent', 'paid', 'cancelled')),
  invoice_number text not null unique,
  stripe_checkout_session_id text,
  stripe_checkout_url text,
  stripe_payment_intent_id text,
  sent_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists portal_invoices_profile_idx on public.portal_invoices (profile_id, created_at desc);

comment on table public.portal_invoices is 'Admin-set trip invoice with Stripe Checkout URL; client pays from dashboard.';

alter table public.portal_invoices enable row level security;

drop policy if exists "portal_invoices_select_own" on public.portal_invoices;
create policy "portal_invoices_select_own"
  on public.portal_invoices for select
  using (profile_id = auth.uid());

drop policy if exists "portal_invoices_admin_all" on public.portal_invoices;
create policy "portal_invoices_admin_all"
  on public.portal_invoices for all
  using (public.is_admin())
  with check (public.is_admin());
