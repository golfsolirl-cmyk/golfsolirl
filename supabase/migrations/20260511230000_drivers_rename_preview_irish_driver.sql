-- Rename seeded preview driver row (fixed UUID from 20260505200000) for existing databases.

update public.drivers
set display_name = 'Irish Driver — Costa (assign in admin)'
where id = 'c0ffee00-0000-4000-8000-000000000001'::uuid;
