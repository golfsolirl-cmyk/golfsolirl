-- Decline / no-driver path: reason + timestamp for client comms and auto-sweep idempotency.

alter table public.transfer_bookings
  add column if not exists cancel_reason text,
  add column if not exists no_driver_notified_at timestamptz;

comment on column public.transfer_bookings.cancel_reason is 'When status=cancelled: e.g. no_driver_admin (ops declined), no_driver_auto (2h unassigned sweep).';
comment on column public.transfer_bookings.no_driver_notified_at is 'Set when the no-driver email was sent (manual or automatic).';
