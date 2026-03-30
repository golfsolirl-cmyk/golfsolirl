-- Store proposal PDF generation payload so clients can re-download from the dashboard
alter table public.proposals
  add column if not exists payload jsonb;
