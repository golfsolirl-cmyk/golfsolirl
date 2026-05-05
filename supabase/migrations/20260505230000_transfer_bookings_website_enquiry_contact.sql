-- Website enquiries can create transfer_bookings rows (ops pipeline) without a portal user.
-- Drivers see name + phone + route + timing; email stays for admin/client emails only.

alter table public.transfer_bookings
  alter column client_user_id drop not null;

alter table public.transfer_bookings
  add column if not exists client_display_name text not null default '',
  add column if not exists client_phone text not null default '',
  add column if not exists enquiry_reference_id text,
  add column if not exists booking_source text not null default 'client_dashboard',
  add column if not exists client_timing_note text not null default '';

alter table public.transfer_bookings
  drop constraint if exists transfer_bookings_booking_source_check;

alter table public.transfer_bookings
  add constraint transfer_bookings_booking_source_check
  check (booking_source in ('client_dashboard', 'website_enquiry'));

alter table public.transfer_bookings
  drop constraint if exists transfer_bookings_client_or_enquiry_check;

alter table public.transfer_bookings
  add constraint transfer_bookings_client_or_enquiry_check
  check (
    client_user_id is not null
    or (
      booking_source = 'website_enquiry'
      and btrim(client_email) <> ''
    )
  );

create unique index if not exists transfer_bookings_enquiry_reference_id_key
  on public.transfer_bookings (enquiry_reference_id)
  where enquiry_reference_id is not null;

comment on column public.transfer_bookings.client_display_name is 'Guest name for driver desk (no email there).';
comment on column public.transfer_bookings.client_phone is 'Phone / WhatsApp for driver desk.';
comment on column public.transfer_bookings.enquiry_reference_id is 'Website enquiry reference_id when booking_source=website_enquiry.';
comment on column public.transfer_bookings.booking_source is 'client_dashboard: map request; website_enquiry: mirrored from /api/enquiry.';
comment on column public.transfer_bookings.client_timing_note is 'Human collection timing from forms when scheduled_at is null or for admin context.';

-- Interpret datetime-local style strings as Europe/Madrid wall clock → timestamptz (service RPC).
create or replace function public.parse_malaga_local_datetime_to_timestamptz(p text)
returns timestamptz
language sql
stable
as $$
  select case
    when p is not null and btrim(p) ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' then
      ((left(btrim(p), 10) || ' ' || substring(btrim(p) from 12 for 5))::timestamp without time zone
        at time zone 'Europe/Madrid')
    else null
  end
$$;

revoke all on function public.parse_malaga_local_datetime_to_timestamptz(text) from public;
grant execute on function public.parse_malaga_local_datetime_to_timestamptz(text) to service_role;

create or replace function public.transfer_bookings_set_client_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.client_user_id is null and auth.uid() is not null then
    new.client_user_id := auth.uid();
  end if;
  if not public.is_admin() then
    if new.client_user_id is not null then
      if new.client_email is null or btrim(new.client_email) = '' then
        new.client_email := coalesce((select trim(p.email) from public.profiles p where p.id = new.client_user_id), '');
      end if;
    end if;
  end if;
  return new;
end;
$$;
