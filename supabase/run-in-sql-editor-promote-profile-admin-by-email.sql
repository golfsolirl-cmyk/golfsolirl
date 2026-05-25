-- Run in Supabase → SQL Editor.
-- Only info@golfsolirl.ie should have admin access (matches ADMIN_LOGIN_EMAIL default).

update public.profiles
set role = 'client', updated_at = now()
where role = 'admin';

update public.profiles
set role = 'admin', updated_at = now(), full_name = coalesce(nullif(trim(full_name), ''), 'Golf Sol Admin')
where lower(trim(coalesce(email, ''))) = lower(trim('info@golfsolirl.ie'));

select email, role, updated_at
from public.profiles
where role = 'admin'
order by email;
