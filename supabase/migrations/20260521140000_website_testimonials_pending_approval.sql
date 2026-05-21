-- Testimonials require admin approval before homepage (published_at set).

alter table public.website_testimonials
  alter column published_at drop not null;

alter table public.website_testimonials
  alter column published_at drop default;

comment on table public.website_testimonials is
  'Testimonials from /testimonials form; homepage when published_at is set and hidden_at is null.';

drop index if exists public.website_testimonials_live_idx;

create index website_testimonials_live_idx
  on public.website_testimonials (published_at desc)
  where hidden_at is null and published_at is not null;

create index if not exists website_testimonials_pending_idx
  on public.website_testimonials (created_at desc)
  where published_at is null;
