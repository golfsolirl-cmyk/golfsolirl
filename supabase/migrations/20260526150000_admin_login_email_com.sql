-- Move single admin inbox from info@golfsolirl.ie to info@golfsolirl.com.
-- Server enforces ADMIN_LOGIN_EMAIL / magic-link gate; this aligns existing profile rows.

update public.profiles
set role = 'client', updated_at = now()
where role = 'admin';

update public.profiles
set
  role = 'admin',
  email = lower(trim('info@golfsolirl.com')),
  updated_at = now(),
  full_name = coalesce(nullif(trim(full_name), ''), 'Golf Sol Admin')
where lower(trim(coalesce(email, ''))) in (
  lower(trim('info@golfsolirl.com')),
  lower(trim('info@golfsolirl.ie'))
);
