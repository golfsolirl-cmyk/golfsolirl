-- Performance indexes for admin queue, portal lookups, and profile search.

CREATE INDEX IF NOT EXISTS idx_enquiries_email_created_at
  ON public.enquiries (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_account_reference_id
  ON public.profiles (account_reference_id)
  WHERE account_reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_portal_interest_tickets_owner_status
  ON public.portal_interest_tickets (owner_id, status, updated_at DESC);
