-- Run in Supabase → SQL Editor.
-- Only golfsolirl+logingolfsol@gmail.com should have admin access.

update public.profiles
set role = 'client', updated_at = now()
where lower(trim(coalesce(email, ''))) = lower(trim('golfsolirl@gmail.com'));

update public.profiles
set role = 'admin', updated_at = now(), full_name = coalesce(nullif(trim(full_name), ''), 'Golf Sol Admin Login')
where lower(trim(coalesce(email, ''))) = lower(trim('golfsolirl+logingolfsol@gmail.com'));

select email, role, updated_at
from public.profiles
where lower(trim(coalesce(email, ''))) in (
  lower(trim('golfsolirl@gmail.com')),
  lower(trim('golfsolirl+logingolfsol@gmail.com'))
)
order by email;
