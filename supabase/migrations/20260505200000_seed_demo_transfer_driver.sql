-- Idempotent demo driver for admin “Assign driver” in the transfer pipeline (local/staging/prod).
-- Fixed UUID so re-apply is safe; auth_user_id null = ops-only row until a real driver account is linked.

insert into public.drivers (id, display_name, email, phone, active, auth_user_id)
values (
  'c0ffee00-0000-4000-8000-000000000001'::uuid,
  'Demo Driver — Costa (assign in admin)',
  'demo.driver@golfsol.local',
  null,
  true,
  null
)
on conflict (id) do update set
  display_name = excluded.display_name,
  email = excluded.email,
  active = excluded.active;
