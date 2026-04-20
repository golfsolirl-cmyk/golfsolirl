-- Supabase → SQL → Run (enables client dashboard PDF re-download + admin send flow)
alter table public.proposals
  add column if not exists payload jsonb;
