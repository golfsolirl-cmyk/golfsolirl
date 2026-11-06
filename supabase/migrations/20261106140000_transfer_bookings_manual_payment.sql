-- Manual payment tracking: admin-typed total received, distinct from Stripe.

alter table public.transfer_bookings
  add column if not exists payment_source text
    check (payment_source is null or payment_source in ('stripe', 'manual'));

alter table public.transfer_bookings
  add column if not exists amount_received_eur numeric(12, 2)
    check (amount_received_eur is null or amount_received_eur >= 0);

comment on column public.transfer_bookings.payment_source is
  'stripe = card checkout; manual = admin typed the amount received.';

comment on column public.transfer_bookings.amount_received_eur is
  'Euros actually received so far. Stripe writes the card amount. Manual marks store the amount the admin typed.';

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
  new.payment_source := old.payment_source;
  new.amount_received_eur := old.amount_received_eur;
  return new;
end;
$$;
