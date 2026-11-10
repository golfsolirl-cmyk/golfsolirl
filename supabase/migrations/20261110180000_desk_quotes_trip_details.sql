-- Booking lines saved with an admin quote or invoice.
-- The Customers desk prints these on the PDF and in the email.

alter table public.desk_quotes
  add column if not exists trip_details jsonb not null default '{}'::jsonb;

comment on column public.desk_quotes.trip_details is
  'Golfers, dates, transfers, courses, accommodation, and extra booking lines for a desk quote or invoice.';
