-- Admin-quoted gross EUR is VAT-inclusive; record which Irish VAT breakdown applies for receipts.

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
