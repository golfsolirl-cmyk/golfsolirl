-- Optional ordered via stops between pickup and drop-off (client map), max 7 in app.

alter table public.transfer_bookings
  add column if not exists route_waypoints jsonb not null default '[]'::jsonb;

comment on column public.transfer_bookings.route_waypoints is 'JSON array of {label,lat,lng} for up to 7 via points between pickup and dropoff.';
