-- Fix: authenticated users could not read profiles because RLS policies call public.is_admin()
-- after migration 20260520010000 revoked EXECUTE on that helper from authenticated.
-- Symptom: "permission denied for function is_admin" and null profile on login.

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_driver() to authenticated;
