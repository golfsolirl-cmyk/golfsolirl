-- Paid portal invoices create a transfer_bookings trip-pass row.
-- createTransferBookingFromPaidInvoice used booking_source = 'portal_invoice',
-- which the 20260511210000 check rejected (23514), so Stripe-paid invoices
-- with no existing transfer never activated ops / the client trip pass.

alter table public.transfer_bookings
  drop constraint if exists transfer_bookings_booking_source_check;

alter table public.transfer_bookings
  add constraint transfer_bookings_booking_source_check
  check (
    booking_source in (
      'client_dashboard',
      'website_enquiry',
      'admin_package_quote',
      'portal_invoice'
    )
  );

comment on column public.transfer_bookings.booking_source is
  'client_dashboard: map / trip-planner request; website_enquiry: mirrored from /api/enquiry; admin_package_quote: staff-published manual package; portal_invoice: created when a portal invoice is paid and no transfer row existed.';
