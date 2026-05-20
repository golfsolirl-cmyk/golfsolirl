-- Client read: own enquiries by email / account reference (for dashboard data card).
drop policy if exists "enquiries_select_own" on public.enquiries;

create policy "enquiries_select_own"
  on public.enquiries for select
  to authenticated
  using (
    lower(trim(coalesce(email, ''))) = lower(trim(coalesce((select p.email from public.profiles p where p.id = auth.uid()), '')))
    or (
      (select p.account_reference_id from public.profiles p where p.id = auth.uid()) is not null
      and reference_id = (select p.account_reference_id from public.profiles p where p.id = auth.uid())
    )
  );

-- Driver role on profiles (used with is_driver()).
alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('client', 'admin', 'driver'));

create or replace function public.is_driver()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  );
$$;

revoke all on function public.is_driver() from public, anon, authenticated;

-- Operational drivers (linked to auth when invited).
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete set null unique,
  display_name text not null,
  email text not null default '',
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists drivers_auth_user_id_idx on public.drivers (auth_user_id);

comment on table public.drivers is 'Transfer drivers; auth_user_id set when driver can sign in.';

alter table public.drivers enable row level security;

drop policy if exists "drivers_select_admin" on public.drivers;
create policy "drivers_select_admin"
  on public.drivers for select
  using (public.is_admin());

drop policy if exists "drivers_select_self" on public.drivers;
create policy "drivers_select_self"
  on public.drivers for select
  using (auth_user_id = auth.uid());

drop policy if exists "drivers_write_admin" on public.drivers;
create policy "drivers_write_admin"
  on public.drivers for all
  using (public.is_admin())
  with check (public.is_admin());

-- Costa transfer job (client-requested; admin assigns driver).
create table if not exists public.transfer_bookings (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users (id) on delete cascade,
  client_email text not null default '',
  pickup_lat double precision,
  pickup_lng double precision,
  pickup_label text not null default '',
  dropoff_lat double precision,
  dropoff_lng double precision,
  dropoff_label text not null default '',
  scheduled_at timestamptz,
  status text not null default 'pending'
    check (status in (
      'pending', 'allocated', 'driver_accepted', 'en_route', 'picked_up', 'completed', 'cancelled'
    )),
  assigned_driver_id uuid references public.drivers (id) on delete set null,
  review_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transfer_bookings_client_idx on public.transfer_bookings (client_user_id);
create index if not exists transfer_bookings_driver_idx on public.transfer_bookings (assigned_driver_id);
create index if not exists transfer_bookings_status_idx on public.transfer_bookings (status);

comment on table public.transfer_bookings is 'Client Costa transfer requests and driver workflow status.';

alter table public.transfer_bookings enable row level security;

drop policy if exists "transfer_bookings_select_client" on public.transfer_bookings;
create policy "transfer_bookings_select_client"
  on public.transfer_bookings for select
  using (client_user_id = auth.uid());

drop policy if exists "transfer_bookings_insert_client" on public.transfer_bookings;
create policy "transfer_bookings_insert_client"
  on public.transfer_bookings for insert
  with check (client_user_id = auth.uid());

drop policy if exists "transfer_bookings_update_client" on public.transfer_bookings;
create policy "transfer_bookings_update_client"
  on public.transfer_bookings for update
  using (client_user_id = auth.uid())
  with check (client_user_id = auth.uid());

drop policy if exists "transfer_bookings_admin_all" on public.transfer_bookings;
create policy "transfer_bookings_admin_all"
  on public.transfer_bookings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "transfer_bookings_driver_select" on public.transfer_bookings;
create policy "transfer_bookings_driver_select"
  on public.transfer_bookings for select
  using (
    public.is_driver()
    and assigned_driver_id is not null
    and exists (
      select 1
      from public.drivers d
      where d.id = transfer_bookings.assigned_driver_id
        and d.auth_user_id = auth.uid()
    )
  );

drop policy if exists "transfer_bookings_driver_update" on public.transfer_bookings;
create policy "transfer_bookings_driver_update"
  on public.transfer_bookings for update
  using (
    public.is_driver()
    and assigned_driver_id is not null
    and exists (
      select 1
      from public.drivers d
      where d.id = transfer_bookings.assigned_driver_id
        and d.auth_user_id = auth.uid()
    )
  )
  with check (
    public.is_driver()
    and assigned_driver_id is not null
    and exists (
      select 1
      from public.drivers d
      where d.id = transfer_bookings.assigned_driver_id
        and d.auth_user_id = auth.uid()
    )
  );

create table if not exists public.transfer_booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.transfer_bookings (id) on delete cascade,
  actor_kind text not null check (actor_kind in ('system', 'client', 'admin', 'driver')),
  action text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transfer_booking_events_booking_idx on public.transfer_booking_events (booking_id);

alter table public.transfer_booking_events enable row level security;

drop policy if exists "transfer_booking_events_select_related" on public.transfer_booking_events;
create policy "transfer_booking_events_select_related"
  on public.transfer_booking_events for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.transfer_bookings b
      where b.id = booking_id and b.client_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.transfer_bookings b
      join public.drivers d on d.id = b.assigned_driver_id
      where b.id = booking_id and d.auth_user_id = auth.uid()
    )
  );

drop policy if exists "transfer_booking_events_insert_admin" on public.transfer_booking_events;
create policy "transfer_booking_events_insert_admin"
  on public.transfer_booking_events for insert
  with check (public.is_admin());

drop policy if exists "transfer_booking_events_insert_driver" on public.transfer_booking_events;
create policy "transfer_booking_events_insert_driver"
  on public.transfer_booking_events for insert
  with check (
    public.is_driver()
    and actor_kind = 'driver'
    and exists (
      select 1
      from public.transfer_bookings b
      join public.drivers d on d.id = b.assigned_driver_id
      where b.id = booking_id and d.auth_user_id = auth.uid()
    )
  );

create table if not exists public.driver_positions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.transfer_bookings (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamptz not null default now()
);

create index if not exists driver_positions_booking_idx on public.driver_positions (booking_id desc);

alter table public.driver_positions enable row level security;

drop policy if exists "driver_positions_select_client" on public.driver_positions;
create policy "driver_positions_select_client"
  on public.driver_positions for select
  using (
    exists (
      select 1 from public.transfer_bookings b
      where b.id = booking_id and b.client_user_id = auth.uid()
    )
  );

drop policy if exists "driver_positions_select_admin" on public.driver_positions;
create policy "driver_positions_select_admin"
  on public.driver_positions for select
  using (public.is_admin());

drop policy if exists "driver_positions_insert_driver" on public.driver_positions;
create policy "driver_positions_insert_driver"
  on public.driver_positions for insert
  with check (
    public.is_driver()
    and exists (
      select 1
      from public.transfer_bookings b
      join public.drivers d on d.id = b.assigned_driver_id
      where b.id = booking_id and d.auth_user_id = auth.uid()
    )
  );

drop policy if exists "driver_positions_select_driver" on public.driver_positions;
create policy "driver_positions_select_driver"
  on public.driver_positions for select
  using (
    public.is_driver()
    and exists (
      select 1
      from public.transfer_bookings b
      join public.drivers d on d.id = b.assigned_driver_id
      where b.id = booking_id and d.auth_user_id = auth.uid()
    )
  );

-- Post-trip reviews (admin can publish to homepage strip).
create table if not exists public.trip_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.transfer_bookings (id) on delete cascade,
  client_user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  display_name text,
  submitted_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists trip_reviews_published_idx on public.trip_reviews (published_at desc);

alter table public.trip_reviews enable row level security;

drop policy if exists "trip_reviews_select_own" on public.trip_reviews;
create policy "trip_reviews_select_own"
  on public.trip_reviews for select
  using (client_user_id = auth.uid());

drop policy if exists "trip_reviews_insert_own" on public.trip_reviews;
create policy "trip_reviews_insert_own"
  on public.trip_reviews for insert
  with check (
    client_user_id = auth.uid()
    and exists (
      select 1
      from public.transfer_bookings b
      where b.id = booking_id
        and b.client_user_id = auth.uid()
    )
  );

drop policy if exists "trip_reviews_select_admin" on public.trip_reviews;
create policy "trip_reviews_select_admin"
  on public.trip_reviews for select
  using (public.is_admin());

drop policy if exists "trip_reviews_update_admin" on public.trip_reviews;
create policy "trip_reviews_update_admin"
  on public.trip_reviews for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "trip_reviews_public_published" on public.trip_reviews;
create policy "trip_reviews_public_published"
  on public.trip_reviews for select
  to anon, authenticated
  using (published_at is not null);

-- Ensure client inserts always own the row and have an email snapshot.
create or replace function public.transfer_bookings_set_client_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.client_user_id := auth.uid();
    if new.client_email is null or btrim(new.client_email) = '' then
      new.client_email := coalesce((select trim(p.email) from public.profiles p where p.id = auth.uid()), '');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_transfer_bookings_client_defaults on public.transfer_bookings;
create trigger tr_transfer_bookings_client_defaults
  before insert on public.transfer_bookings
  for each row
  execute function public.transfer_bookings_set_client_defaults();
