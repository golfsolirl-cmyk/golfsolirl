-- Stripe Checkout identifiers for admin receipt links (client card payments).

alter table public.transfer_bookings
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_checkout_session_id text;

comment on column public.transfer_bookings.stripe_payment_intent_id is
  'Stripe PaymentIntent id when the guest paid via Checkout (pi_…).';

comment on column public.transfer_bookings.stripe_checkout_session_id is
  'Stripe Checkout Session id when the guest paid via Checkout (cs_…).';

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
  return new;
end;
$$;
