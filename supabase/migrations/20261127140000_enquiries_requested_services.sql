-- Additive: structured trip-builder services on enquiries (forms + admin offers).

alter table public.enquiries
  add column if not exists requested_services jsonb;

comment on column public.enquiries.requested_services is
  'Trip-builder selection: { transfers, accommodation, golf_courses } booleans from website forms / admin.';

alter table public.enquiries
  add column if not exists service_offer_log jsonb not null default '[]'::jsonb;

comment on column public.enquiries.service_offer_log is
  'Array of { service, sentAt, subject, to } when admin sent Offer transfers/accommodation/golf emails.';

create index if not exists enquiries_requested_services_gin_idx
  on public.enquiries using gin (requested_services);

-- Helper expression indexes for admin filters (Postgres jsonb boolean extract).
create index if not exists enquiries_req_transfers_idx
  on public.enquiries ((requested_services->>'transfers'))
  where requested_services is not null;

create index if not exists enquiries_req_accommodation_idx
  on public.enquiries ((requested_services->>'accommodation'))
  where requested_services is not null;

create index if not exists enquiries_req_golf_idx
  on public.enquiries ((requested_services->>'golf_courses'))
  where requested_services is not null;
