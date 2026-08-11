-- Clients may clear unpaid package-mirror transfer rows only.
-- Previous policy allowed DELETE whenever package_build_id was set, including
-- deposit/paid/refunded bookings (data loss via authenticated Supabase client).

drop policy if exists "transfer_bookings_delete_client_package_mirror" on public.transfer_bookings;

create policy "transfer_bookings_delete_client_package_mirror"
  on public.transfer_bookings for delete
  to authenticated
  using (
    auth.uid() = client_user_id
    and package_build_id is not null
    and lower(coalesce(payment_status, 'unpaid')) = 'unpaid'
    and lower(coalesce(transfer_refund_status, 'none')) = 'none'
    and coalesce(transfer_refund_total_eur, 0) = 0
    and stripe_payment_intent_id is null
    and stripe_checkout_session_id is null
    and assigned_driver_id is null
  );

comment on policy "transfer_bookings_delete_client_package_mirror" on public.transfer_bookings is
  'Client may delete only unpaid, unrefunded, unassigned package-mirror transfer rows.';
