-- Non-privileged clients can insert transfer_bookings rows directly through
-- Supabase. Keep all payment, quote, Stripe, and refund fields server-owned
-- on inserts as well as updates.

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
    new.stripe_payment_intent_id := null;
    new.stripe_checkout_session_id := null;
    new.transfer_refund_total_eur := 0;
    new.transfer_refund_status := 'none';
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

drop trigger if exists tr_transfer_bookings_payment_lock on public.transfer_bookings;

create trigger tr_transfer_bookings_payment_lock
  before insert or update on public.transfer_bookings
  for each row
  execute function public.transfer_bookings_payment_columns_privileged_only();
