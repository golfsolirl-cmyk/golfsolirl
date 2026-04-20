-- Run in Supabase SQL Editor if you have not applied migration 20260330230000_enquiries_delete_admin.sql
drop policy if exists "enquiries_delete_admin" on public.enquiries;

create policy "enquiries_delete_admin"
  on public.enquiries for delete
  using (public.is_admin());
