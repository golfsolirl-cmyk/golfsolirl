-- Same as migration 20260524120000_grant_is_admin_execute_for_rls.sql
-- Run in Supabase Dashboard → SQL → New query.

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_driver() to authenticated;
