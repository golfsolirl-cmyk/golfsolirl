-- Seed Monzo payment details when the singleton row is still empty (do not overwrite admin edits).

insert into public.site_payment_settings (
  id,
  monzo_account_name,
  monzo_bank_name,
  monzo_iban,
  monzo_bic,
  monzo_iban_display
)
values (
  1,
  'Gregory Mc Donald',
  'Monzo Bank',
  'IE07MONZ91004078972387',
  'MONZIE22',
  'IE07 MONZ 9100 4078 9723 87'
)
on conflict (id) do nothing;

update public.site_payment_settings
set
  monzo_account_name = 'Gregory Mc Donald',
  monzo_bank_name = 'Monzo Bank',
  monzo_iban = 'IE07MONZ91004078972387',
  monzo_bic = 'MONZIE22',
  monzo_iban_display = 'IE07 MONZ 9100 4078 9723 87',
  updated_at = now()
where id = 1
  and (
    coalesce(trim(monzo_iban), '') = ''
    or coalesce(trim(monzo_account_name), '') = ''
  );
