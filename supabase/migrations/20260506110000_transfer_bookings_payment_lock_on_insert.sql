-- Clients can create transfer bookings, but payment/quote fields remain admin/service-role only.

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
