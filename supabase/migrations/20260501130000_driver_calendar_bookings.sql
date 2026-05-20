-- Driver / transfer calendar: admin-managed bookings that block a service day on public forms.
-- PII is not exposed to anon — use RPC for date-only list.

create table if not exists public.driver_calendar_bookings (
  id uuid primary key default gen_random_uuid(),
  service_day date not null,
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  reference_id text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists driver_calendar_bookings_service_day_idx
  on public.driver_calendar_bookings (service_day);

comment on table public.driver_calendar_bookings is 'Admin-entered bookings; each row blocks that calendar day for website date pickers.';

alter table public.driver_calendar_bookings enable row level security;

drop policy if exists "driver_calendar_bookings_admin_all" on public.driver_calendar_bookings;

create policy "driver_calendar_bookings_admin_all"
  on public.driver_calendar_bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Date-only list for website forms: table + sync in 20260520020000_driver_booked_service_days_public_table.sql
