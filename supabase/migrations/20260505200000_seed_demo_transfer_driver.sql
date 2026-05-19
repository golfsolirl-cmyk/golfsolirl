-- Idempotent default driver for admin dispatch (Martin Kelly — email workflow).
-- Fixed UUID so re-apply is safe; auth_user_id null = no driver portal sign-in required.

insert into public.drivers (id, display_name, email, phone, active, auth_user_id)
values (
  'c0ffee00-0000-4000-8000-000000000001'::uuid,
  'Martin Kelly',
  'info@golfsolirl.com',
  '+353 87 446 4766',
  true,
  null
)
on conflict (id) do update set
  display_name = excluded.display_name,
  email = excluded.email,
  phone = excluded.phone,
  active = excluded.active;
