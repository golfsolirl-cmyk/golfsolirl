-- Paid portal invoices can create the transfer row that turns on the trip pass.

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
  'client_dashboard: map request; website_enquiry: mirrored from /api/enquiry; admin_package_quote: staff-published package line; portal_invoice: created when a portal invoice is paid and no transfer row exists yet.';
