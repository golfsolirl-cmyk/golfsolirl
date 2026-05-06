-- Run in Supabase Dashboard → SQL if you see:
--   column transfer_bookings.payment_status does not exist
--
-- This applies migrations:
--   20260505270000_transfer_bookings_payment_reminders.sql
--   20260505300000_transfer_bookings_admin_price_eur.sql
--   20260505320000_transfer_bookings_admin_price_vat_treatment.sql
--   20260505330000_transfer_bookings_payment_trigger_jwt_role.sql
-- (idempotent: safe to re-run)

-- --- 20260505270000 ---

alter table public.transfer_bookings
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'deposit', 'paid'));

alter table public.transfer_bookings
  add column if not exists deposit_percent integer not null default 20
    check (deposit_percent >= 1 and deposit_percent <= 99);

alter table public.transfer_bookings
  add column if not exists balance_remind_at timestamptz,
  add column if not exists balance_remind_sent_at timestamptz;

comment on column public.transfer_bookings.payment_status is 'Admin: unpaid | deposit (partial) | paid (full).';
comment on column public.transfer_bookings.deposit_percent is 'Shown in customer emails when payment_status=deposit (e.g. 20).';
comment on column public.transfer_bookings.balance_remind_at is 'When to email the guest about the remaining balance (set when deposit marked).';
comment on column public.transfer_bookings.balance_remind_sent_at is 'Set after balance reminder email is sent.';

-- --- 20260505300000 ---

alter table public.transfer_bookings
  add column if not exists admin_price_eur numeric(12, 2);

comment on column public.transfer_bookings.admin_price_eur is 'Optional quoted price (EUR) for reporting and calendar totals; admin or service_role only.';

create or replace function public.transfer_bookings_payment_columns_privileged_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privileged boolean;
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  privileged :=
    public.is_admin()
    or coalesce(auth.role(), '') = 'service_role'
    or coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), '') = 'service_role';

  if privileged then
    return new;
  end if;

  new.payment_status := old.payment_status;
  new.deposit_percent := old.deposit_percent;
  new.balance_remind_at := old.balance_remind_at;
  new.balance_remind_sent_at := old.balance_remind_sent_at;
  new.admin_price_eur := old.admin_price_eur;
  return new;
end;
$$;

drop trigger if exists tr_transfer_bookings_payment_lock on public.transfer_bookings;

create trigger tr_transfer_bookings_payment_lock
  before update on public.transfer_bookings
  for each row
  execute function public.transfer_bookings_payment_columns_privileged_only();

-- --- 20260505320000 ---

alter table public.transfer_bookings
  add column if not exists admin_price_vat_treatment text
    check (admin_price_vat_treatment is null or admin_price_vat_treatment in ('tourism', 'services'));

comment on column public.transfer_bookings.admin_price_vat_treatment is
  'When admin_price_eur is set: tourism = reduced rate (13.5%); services = standard (23%). VAT-inclusive gross.';

create or replace function public.transfer_bookings_payment_columns_privileged_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privileged boolean;
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  privileged :=
    public.is_admin()
    or coalesce(auth.role(), '') = 'service_role'
    or coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), '') = 'service_role';

  if privileged then
    return new;
  end if;

  new.payment_status := old.payment_status;
  new.deposit_percent := old.deposit_percent;
  new.balance_remind_at := old.balance_remind_at;
  new.balance_remind_sent_at := old.balance_remind_sent_at;
  new.admin_price_eur := old.admin_price_eur;
  new.admin_price_vat_treatment := old.admin_price_vat_treatment;
  return new;
end;
$$;

-- --- 20260505330000 --- (JWT role claim for service_role — Stripe webhooks)

create or replace function public.transfer_bookings_payment_columns_privileged_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privileged boolean;
begin
  privileged :=
    public.is_admin()
    or coalesce(auth.role(), '') = 'service_role'
    or coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), '') = 'service_role'
    or coalesce((auth.jwt() ->> 'role'), '') = 'service_role';

  if privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.payment_status := 'unpaid';
    new.deposit_percent := 20;
    new.balance_remind_at := null;
    new.balance_remind_sent_at := null;
    new.admin_price_eur := null;
    new.admin_price_vat_treatment := null;
    return new;
  end if;

  new.payment_status := old.payment_status;
  new.deposit_percent := old.deposit_percent;
  new.balance_remind_at := old.balance_remind_at;
  new.balance_remind_sent_at := old.balance_remind_sent_at;
  new.admin_price_eur := old.admin_price_eur;
  new.admin_price_vat_treatment := old.admin_price_vat_treatment;
  return new;
end;
$$;

drop trigger if exists tr_transfer_bookings_payment_lock on public.transfer_bookings;

create trigger tr_transfer_bookings_payment_lock
  before insert or update on public.transfer_bookings
  for each row
  execute function public.transfer_bookings_payment_columns_privileged_only();
