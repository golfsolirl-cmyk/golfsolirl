-- Run in Supabase → SQL Editor (use default role with access to public + auth).
-- Promotes an existing profile to admin by email.
-- Prerequisite: the user has completed magic-link sign-up at least once so a row exists in public.profiles.

-- 1) Promote by profiles.email (most common)
update public.profiles
set
  role = 'admin',
  updated_at = now()
where lower(trim(coalesce(email, ''))) = lower(trim('golfsolirl@gmail.com'));

-- 2) Verify
select id, email, role, updated_at
from public.profiles
where lower(trim(coalesce(email, ''))) = lower(trim('golfsolirl@gmail.com'));

-- If step 1 updated 0 rows, the account may exist only in auth.users or email differs.
-- Try matching auth.users instead:
-- update public.profiles p
-- set role = 'admin', updated_at = now()
-- from auth.users u
-- where p.id = u.id
--   and lower(trim(coalesce(u.email, ''))) = lower(trim('golfsolirl@gmail.com'));
