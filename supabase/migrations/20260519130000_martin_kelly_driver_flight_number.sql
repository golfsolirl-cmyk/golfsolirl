-- Martin Kelly: default ops driver (email dispatch workflow).
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
  active = true;

alter table public.transfer_bookings
  add column if not exists inbound_flight_number text not null default '';

comment on column public.transfer_bookings.inbound_flight_number is
  'Inbound flight number when pickup/collection is Málaga AGP or airport-related.';
