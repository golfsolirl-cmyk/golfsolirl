-- Cancel a priced booking that is still unpaid after 3 days.
-- payment_attempt 1 is the first chance. Rebook sets 2. A second miss cannot be reopened.

alter table public.transfer_bookings
  add column if not exists payment_attempt integer not null default 1,
  add column if not exists unpaid_deadline_at timestamptz;

alter table public.transfer_bookings
  drop constraint if exists transfer_bookings_payment_attempt_check;

alter table public.transfer_bookings
  add constraint transfer_bookings_payment_attempt_check
  check (payment_attempt >= 1 and payment_attempt <= 2);

comment on column public.transfer_bookings.payment_attempt is
  '1 = first chance to pay a deposit or the full amount. 2 = reopened once after an unpaid cancellation. No further rebook.';

comment on column public.transfer_bookings.unpaid_deadline_at is
  'When a pending priced booking is cancelled if payment_status is still unpaid.';
