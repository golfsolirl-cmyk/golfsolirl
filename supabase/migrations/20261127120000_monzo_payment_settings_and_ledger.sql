-- Monzo manual bank-transfer settings (singleton) and enquiry payment ledger.

create table if not exists public.site_payment_settings (
  id smallint primary key check (id = 1),
  monzo_account_name text not null default '',
  monzo_bank_name text not null default 'Monzo Bank',
  monzo_iban text not null default '',
  monzo_bic text not null default '',
  monzo_iban_display text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_payment_settings (id)
values (1)
on conflict (id) do nothing;

comment on table public.site_payment_settings is
  'Singleton Monzo bank details for client-facing transfer instructions; empty strings until admin configures.';

alter table public.site_payment_settings enable row level security;

drop policy if exists "site_payment_settings_select_authenticated" on public.site_payment_settings;
create policy "site_payment_settings_select_authenticated"
  on public.site_payment_settings for select
  to authenticated
  using (id = 1);

drop policy if exists "site_payment_settings_admin_all" on public.site_payment_settings;
create policy "site_payment_settings_admin_all"
  on public.site_payment_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Enquiry payment tracking (manual bank transfer)
alter table public.enquiries
  add column if not exists amount_due_eur numeric(12, 2)
    check (amount_due_eur is null or amount_due_eur >= 0);

alter table public.enquiries
  add column if not exists deposit_eur numeric(12, 2)
    check (deposit_eur is null or deposit_eur >= 0);

alter table public.enquiries
  add column if not exists amount_received_eur numeric(12, 2) not null default 0
    check (amount_received_eur >= 0);

alter table public.enquiries
  add column if not exists payment_reference text;

alter table public.enquiries
  add column if not exists payment_status text not null default 'awaiting_payment'
    check (payment_status in ('awaiting_payment', 'deposit_received', 'paid_in_full', 'refunded'));

alter table public.enquiries
  add column if not exists payment_notes text;

alter table public.enquiries
  add column if not exists last_payment_at timestamptz;

comment on column public.enquiries.payment_reference is
  'Bank transfer reference guests should use; defaults to enquiry reference_id when unset in app logic.';

create index if not exists enquiries_payment_status_awaiting_idx
  on public.enquiries (payment_status)
  where payment_status = 'awaiting_payment';

create table if not exists public.enquiry_payment_events (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  amount_eur numeric(12, 2) not null check (amount_eur > 0),
  paid_at date not null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists enquiry_payment_events_enquiry_id_idx
  on public.enquiry_payment_events (enquiry_id, paid_at desc);

alter table public.enquiry_payment_events enable row level security;

drop policy if exists "enquiry_payment_events_admin_all" on public.enquiry_payment_events;
create policy "enquiry_payment_events_admin_all"
  on public.enquiry_payment_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "enquiry_payment_events_select_own_enquiry" on public.enquiry_payment_events;
create policy "enquiry_payment_events_select_own_enquiry"
  on public.enquiry_payment_events for select
  to authenticated
  using (
    exists (
      select 1
      from public.enquiries e
      where e.id = enquiry_payment_events.enquiry_id
        and (
          lower(trim(coalesce(e.email, ''))) = lower(trim(coalesce((select p.email from public.profiles p where p.id = auth.uid()), '')))
          or (
            (select p.account_reference_id from public.profiles p where p.id = auth.uid()) is not null
            and e.reference_id = (select p.account_reference_id from public.profiles p where p.id = auth.uid())
          )
        )
    )
  );