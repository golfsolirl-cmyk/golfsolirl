-- Run in Supabase SQL Editor (service role / postgres context).
-- 1) Send a magic link to DRIVER_EMAIL from your app so auth.users + profiles exist.
-- 2) Run this block (edit DRIVER_EMAIL if needed).

do $$
declare
  driver_email constant text := 'driver-test@golfsol.local';
  demo_driver_id constant uuid := 'c0ffee00-0000-4000-8000-000000000001'::uuid;
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(driver_email) limit 1;

  if uid is null then
    raise exception 'No auth user for %. Magic-link sign up that address first.', driver_email;
  end if;

  update public.profiles
  set role = 'driver'
  where id = uid;

  update public.drivers
  set
    auth_user_id = uid,
    display_name = 'Irish Driver — Costa',
    email = driver_email,
    active = true
  where id = demo_driver_id;

  if not found then
    raise exception 'Irish Driver preview row % missing — apply migration 20260505200000_seed_demo_transfer_driver.sql.', demo_driver_id;
  end if;
end $$;
