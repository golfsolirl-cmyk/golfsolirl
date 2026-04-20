-- Allow admins to delete enquiry rows from the dashboard (anon cannot delete).
drop policy if exists "enquiries_delete_admin" on public.enquiries;

create policy "enquiries_delete_admin"
  on public.enquiries for delete
  using (public.is_admin());
