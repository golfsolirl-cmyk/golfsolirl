-- Next available driver / ASAP: full payment upfront (no 20% + balance split).

alter table public.transfer_bookings
  add column if not exists next_available_driver boolean not null default false;

comment on column public.transfer_bookings.next_available_driver is
  'When true (e.g. client chose next available driver / ASAP), client pays quoted total in one checkout — no deposit split.';
