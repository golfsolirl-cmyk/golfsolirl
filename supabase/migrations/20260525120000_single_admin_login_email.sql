-- Restrict admin dashboard access to the single operator inbox (info@golfsolirl.ie).
-- Server also enforces ADMIN_LOGIN_EMAIL / magic-link gate; this cleans existing rows.

update public.profiles
set role = 'client', updated_at = now()
where role = 'admin';

update public.profiles
set
  role = 'admin',
  updated_at = now(),
  full_name = coalesce(nullif(trim(full_name), ''), 'Golf Sol Admin')
where lower(trim(coalesce(email, ''))) = lower(trim('info@golfsolirl.ie'));
