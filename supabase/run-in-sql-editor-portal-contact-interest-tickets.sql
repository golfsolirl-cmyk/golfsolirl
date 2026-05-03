-- Run in Supabase Dashboard → SQL (copy of migration 20260503120000_portal_contact_onboarding_interest_tickets.sql)

alter table public.profiles
  add column if not exists portal_contact_completed_at timestamptz;

comment on column public.profiles.portal_contact_completed_at is
  'When set, client completed the one-time “How we reach you” setup; enquiry sync must not overwrite name/phone.';

create table if not exists public.portal_interest_tickets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  category text not null
    check (category in ('transfers', 'golf_courses', 'hotels')),
  status text not null default 'open'
    check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_interest_tickets_owner_created_idx
  on public.portal_interest_tickets (owner_id, created_at desc);

create index if not exists portal_interest_tickets_status_created_idx
  on public.portal_interest_tickets (status, created_at desc);

create table if not exists public.portal_interest_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.portal_interest_tickets (id) on delete cascade,
  author_kind text not null check (author_kind in ('client', 'admin')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists portal_interest_ticket_messages_ticket_created_idx
  on public.portal_interest_ticket_messages (ticket_id, created_at asc);

alter table public.portal_interest_tickets enable row level security;
alter table public.portal_interest_ticket_messages enable row level security;

drop policy if exists "portal_interest_tickets_insert_own" on public.portal_interest_tickets;
drop policy if exists "portal_interest_tickets_select_own_or_admin" on public.portal_interest_tickets;
drop policy if exists "portal_interest_tickets_update_admin" on public.portal_interest_tickets;

create policy "portal_interest_tickets_insert_own"
  on public.portal_interest_tickets for insert
  with check (auth.uid() = owner_id);

create policy "portal_interest_tickets_select_own_or_admin"
  on public.portal_interest_tickets for select
  using (auth.uid() = owner_id or public.is_admin());

create policy "portal_interest_tickets_update_admin"
  on public.portal_interest_tickets for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "portal_interest_ticket_messages_select_parties" on public.portal_interest_ticket_messages;
drop policy if exists "portal_interest_ticket_messages_insert_parties" on public.portal_interest_ticket_messages;

create policy "portal_interest_ticket_messages_select_parties"
  on public.portal_interest_ticket_messages for select
  using (
    exists (
      select 1
      from public.portal_interest_tickets t
      where t.id = ticket_id
        and (t.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "portal_interest_ticket_messages_insert_parties"
  on public.portal_interest_ticket_messages for insert
  with check (
    exists (
      select 1
      from public.portal_interest_tickets t
      where t.id = ticket_id
        and (
          (t.owner_id = auth.uid() and author_kind = 'client')
          or (public.is_admin() and author_kind = 'admin')
        )
    )
  );

create or replace function public.portal_interest_ticket_message_after_ins()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.portal_interest_tickets
  set
    updated_at = now(),
    status = case
      when new.author_kind = 'admin' then 'answered'
      else 'open'
    end
  where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists portal_interest_ticket_message_after_ins on public.portal_interest_ticket_messages;

create trigger portal_interest_ticket_message_after_ins
  after insert on public.portal_interest_ticket_messages
  for each row
  execute procedure public.portal_interest_ticket_message_after_ins();

update public.profiles
set portal_contact_completed_at = coalesce(portal_contact_completed_at, now())
where portal_contact_completed_at is null
  and trim(coalesce(full_name, '')) <> ''
  and trim(coalesce(phone, '')) <> '';

-- Optional: manual reset for one email (testing — keeps admin role)
-- update public.profiles
-- set
--   full_name = null,
--   phone = null,
--   account_reference_id = null,
--   portal_contact_completed_at = null,
--   updated_at = now()
-- where lower(trim(coalesce(email, ''))) = 'golfsolirl@gmail.com';
