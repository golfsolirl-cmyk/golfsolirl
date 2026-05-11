-- Admin-published manual packages: mirror row in transfer_bookings for client "Transfer requests" + quote PDFs.

alter table public.transfer_bookings
  drop constraint if exists transfer_bookings_booking_source_check;

alter table public.transfer_bookings
  add constraint transfer_bookings_booking_source_check
  check (
    booking_source in (
      'client_dashboard',
      'website_enquiry',
      'admin_package_quote'
    )
  );

comment on column public.transfer_bookings.booking_source is
  'client_dashboard: map request; website_enquiry: mirrored from /api/enquiry; admin_package_quote: staff-published manual package line linked via package_build_id.';
