-- Track Stripe refunds for transfer bookings (admin-initiated).

alter table public.transfer_bookings
  add column if not exists transfer_refund_total_eur numeric(12, 2) not null default 0
    check (transfer_refund_total_eur >= 0);

alter table public.transfer_bookings
  add column if not exists transfer_refund_status text not null default 'none'
    check (transfer_refund_status in ('none', 'partial', 'full'));

comment on column public.transfer_bookings.transfer_refund_total_eur is
  'Cumulative EUR refunded to the card (Stripe) for this transfer.';

comment on column public.transfer_bookings.transfer_refund_status is
  'none | partial | full — derived from Stripe refunds vs amount received.';

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
    or coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), '') = 'service_role'
    or coalesce((auth.jwt() ->> 'role'), '') = 'service_role';

  if privileged then
    return new;
  end if;

  new.payment_status := old.payment_status;
  new.deposit_percent := old.deposit_percent;
  new.balance_remind_at := old.balance_remind_at;
  new.balance_remind_sent_at := old.balance_remind_sent_at;
  new.admin_price_eur := old.admin_price_eur;
  new.admin_price_vat_treatment := old.admin_price_vat_treatment;
  new.stripe_payment_intent_id := old.stripe_payment_intent_id;
  new.stripe_checkout_session_id := old.stripe_checkout_session_id;
  new.transfer_refund_total_eur := old.transfer_refund_total_eur;
  new.transfer_refund_status := old.transfer_refund_status;
  return new;
end;
$$;
