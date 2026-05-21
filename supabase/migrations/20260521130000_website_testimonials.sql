-- Guest testimonials from /testimonials form — admin approves (published_at) before homepage.

create table if not exists public.website_testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  email text not null default '',
  phone text not null default '',
  trip_type text not null default '',
  travel_month text,
  quote_text text not null,
  rating int not null default 5 check (rating >= 1 and rating <= 5),
  source_page text not null default '',
  published_at timestamptz,
  hidden_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists website_testimonials_live_idx
  on public.website_testimonials (published_at desc)
  where hidden_at is null and published_at is not null;

create index if not exists website_testimonials_created_idx
  on public.website_testimonials (created_at desc);

comment on table public.website_testimonials is 'Testimonials submitted via the website testimonials form; shown on homepage when hidden_at is null.';

alter table public.website_testimonials enable row level security;

drop policy if exists "website_testimonials_select_live" on public.website_testimonials;
create policy "website_testimonials_select_live"
  on public.website_testimonials for select
  to anon, authenticated
  using (hidden_at is null and published_at is not null);

drop policy if exists "website_testimonials_select_admin" on public.website_testimonials;
create policy "website_testimonials_select_admin"
  on public.website_testimonials for select
  to authenticated
  using (public.is_admin());

drop policy if exists "website_testimonials_update_admin" on public.website_testimonials;
create policy "website_testimonials_update_admin"
  on public.website_testimonials for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "website_testimonials_delete_admin" on public.website_testimonials;
create policy "website_testimonials_delete_admin"
  on public.website_testimonials for delete
  to authenticated
  using (public.is_admin());
