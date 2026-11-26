-- TOW-style admin CRM fields: enquiry workflow, trip tracker, launch offer, customer logs.

-- Enquiry admin workflow (separate from payment_status ledger)
alter table public.enquiries
  add column if not exists admin_status text not null default 'new';

alter table public.enquiries
  drop constraint if exists enquiries_admin_status_check;

alter table public.enquiries
  add constraint enquiries_admin_status_check
  check (admin_status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam', 'bad-lead'));

alter table public.enquiries
  add column if not exists admin_private_notes text not null default '';

alter table public.enquiries
  add column if not exists payment_customer_reported_at timestamptz;

alter table public.enquiries
  add column if not exists paid_via text;

alter table public.enquiries
  drop constraint if exists enquiries_paid_via_check;

alter table public.enquiries
  add constraint enquiries_paid_via_check
  check (
    paid_via is null
    or paid_via in ('monzo', 'revolut', 'bank_transfer', 'cash', 'other')
  );

create index if not exists enquiries_admin_status_idx on public.enquiries (admin_status);

-- Trip tracker on each enquiry/lead (same steps as customer records)
alter table public.enquiries
  add column if not exists trip_tracker jsonb not null default '{}'::jsonb;

alter table public.enquiries
  add column if not exists email_trip_on_step_change boolean not null default true;

alter table public.enquiries
  add column if not exists trip_step_email_log jsonb not null default '[]'::jsonb;

comment on column public.enquiries.trip_tracker is
  'TOW-style stage checklist: enquiry_received…trip_complete → todo|doing|done|skip.';
comment on column public.enquiries.email_trip_on_step_change is
  'When true (default), changing a trip step emails the customer a branded stage update.';
comment on column public.enquiries.trip_step_email_log is
  'Log of stage-update emails sent: [{at, stepId, status, to, subject}].';

-- Customer CRM extensions on profiles
alter table public.profiles
  add column if not exists business_name text;

alter table public.profiles
  add column if not exists billing_address text;

alter table public.profiles
  add column if not exists admin_notes text not null default '';

alter table public.profiles
  add column if not exists trip_tracker jsonb not null default '{}'::jsonb;

alter table public.profiles
  add column if not exists email_recipients jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists payments_log jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists invoices_log jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists activity_log jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists email_trip_on_step_change boolean not null default true;

alter table public.profiles
  add column if not exists trip_step_email_log jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists archived_at timestamptz;

alter table public.profiles
  add column if not exists linked_enquiry_id uuid references public.enquiries (id) on delete set null;

-- Site launch offer (shown on public site when enabled)
create table if not exists public.site_launch_offer (
  id smallint primary key check (id = 1),
  enabled boolean not null default false,
  total_places integer not null default 25 check (total_places >= 0),
  places_claimed integer not null default 0 check (places_claimed >= 0),
  deadline_at timestamptz,
  headline text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_launch_offer (id, enabled, total_places, places_claimed, headline)
values (1, false, 25, 0, '')
on conflict (id) do nothing;

comment on table public.site_launch_offer is
  'Singleton launch/scarcity offer for the public site; admin-edited at /admin/offer.';

alter table public.site_launch_offer enable row level security;

drop policy if exists "site_launch_offer_select_authenticated" on public.site_launch_offer;
create policy "site_launch_offer_select_authenticated"
  on public.site_launch_offer for select
  to authenticated
  using (true);

drop policy if exists "site_launch_offer_admin_all" on public.site_launch_offer;
create policy "site_launch_offer_admin_all"
  on public.site_launch_offer for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Public read of offer for marketing banner (anon)
drop policy if exists "site_launch_offer_select_anon" on public.site_launch_offer;
create policy "site_launch_offer_select_anon"
  on public.site_launch_offer for select
  to anon
  using (enabled = true);
