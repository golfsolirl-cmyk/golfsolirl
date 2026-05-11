-- Run in Supabase SQL Editor if driver desk / client map errors on missing route_waypoints.
-- Idempotent (matches migration 20260505180000_transfer_bookings_route_waypoints.sql).

alter table public.transfer_bookings
  add column if not exists route_waypoints jsonb not null default '[]'::jsonb;

comment on column public.transfer_bookings.route_waypoints is
  'JSON array of {label,lat,lng} for up to 7 via points between pickup and dropoff.';
