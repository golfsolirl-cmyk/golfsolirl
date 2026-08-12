-- Admin-gated Costa Club Concierge perk on the client trip desk (default hidden).
alter table public.profiles
  add column if not exists portal_club_concierge_enabled boolean not null default false;

comment on column public.profiles.portal_club_concierge_enabled is
  'When true, client sees Club Concierge (hotel fitting desk / fly cabin-only) in Perks & deals.';
