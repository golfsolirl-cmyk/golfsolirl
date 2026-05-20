-- Decline / no-driver path: cancel_reason for admin declines (email is manual from portal studio).

alter table public.transfer_bookings
  add column if not exists cancel_reason text,
  add column if not exists no_driver_notified_at timestamptz;

comment on column public.transfer_bookings.cancel_reason is 'When status=cancelled: e.g. no_driver_admin (ops declined without auto-email).';
comment on column public.transfer_bookings.no_driver_notified_at is 'Legacy: set when a no-driver email was sent; optional if you email manually later.';
