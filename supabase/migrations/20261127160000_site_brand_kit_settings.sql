-- Singleton share-token settings for the public Brand Kit page (/brand/<token>).

create table if not exists public.site_brand_kit_settings (
  id smallint primary key check (id = 1),
  share_token text,
  share_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint site_brand_kit_settings_share_token_unique unique (share_token)
);

comment on table public.site_brand_kit_settings is
  'Singleton Brand Kit share link: token + enable flag; admin-managed via /api/brand-kit.';

insert into public.site_brand_kit_settings (id, share_token, share_enabled)
values (
  1,
  encode(gen_random_bytes(18), 'hex'),
  true
)
on conflict (id) do nothing;

alter table public.site_brand_kit_settings enable row level security;

drop policy if exists "site_brand_kit_settings_admin_all" on public.site_brand_kit_settings;
create policy "site_brand_kit_settings_admin_all"
  on public.site_brand_kit_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
