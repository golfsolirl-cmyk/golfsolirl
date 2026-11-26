-- Canonical form type / source on every enquiry (admin badge, filter, CSV, email subject).

alter table public.enquiries
  add column if not exists form_type text not null default 'unknown';

alter table public.enquiries
  add column if not exists form_type_label text not null default 'Unknown';

alter table public.enquiries
  add column if not exists form_source_page text;

alter table public.enquiries
  drop constraint if exists enquiries_form_type_check;

alter table public.enquiries
  add constraint enquiries_form_type_check
  check (
    form_type in (
      'quote',
      'booking',
      'trip_builder',
      'package_bundle',
      'golf_map',
      'contact',
      'callback',
      'seo_landing',
      'unknown'
    )
  );

create index if not exists enquiries_form_type_idx on public.enquiries (form_type);

comment on column public.enquiries.form_type is
  'Canonical desk category: quote|booking|trip_builder|package_bundle|golf_map|contact|callback|seo_landing|unknown.';
comment on column public.enquiries.form_type_label is
  'Human label for badges (e.g. SEO landing · Marbella).';
comment on column public.enquiries.form_source_page is
  'Path or page key when known (SEO landing, map page, etc.).';

-- Best-effort backfill from form_payload.form / Page / interest / legacy source.
update public.enquiries e
set
  form_type = sub.resolved_type,
  form_type_label = sub.resolved_label,
  form_source_page = nullif(sub.source_page, '')
from (
  select
    id,
    coalesce(
      nullif(
        case
          when coalesce(form_payload->>'form', form_payload->>'source', '') = 'course_map' then 'golf_map'
          when coalesce(form_payload->>'form', '') = 'bundle_quote' then 'package_bundle'
          when coalesce(form_payload->>'form', '') in ('package_builder', 'continue_trip') then 'trip_builder'
          when coalesce(form_payload->>'form', '') in (
            'malaga_airport_transfer',
            'transport_service_page',
            'homepage_hotel_booked_snapshot'
          ) then 'booking'
          when coalesce(form_payload->>'form', '') = 'trip_service_cta' then 'quote'
          when lower(coalesce(interest, '')) ~ 'callback|call me|request a call' then 'callback'
          when coalesce(form_payload->'fields'->>'Page', '') ~* 'contact|/footer' then 'contact'
          when coalesce(form_payload->'fields'->>'_sourcePage', form_payload->'fields'->>'Page', '') ~
            '^/(golf-holidays|golf-packages|guides|transfers|golf-courses)'
            then 'seo_landing'
          when coalesce(form_payload->>'form', '') in ('content_quick_enquiry', 'website_form', 'quote')
            then 'quote'
          when coalesce(form_payload->>'form', form_payload->>'source', '') <> '' then 'quote'
          else 'unknown'
        end,
        ''
      ),
      'unknown'
    ) as resolved_type,
    case
      when coalesce(form_payload->>'form', form_payload->>'source', '') = 'course_map' then
        'Golf map course'
      when coalesce(form_payload->>'form', '') = 'bundle_quote' then
        coalesce(
          nullif(trim(form_payload->'fields'->>'_bundleName'), ''),
          'Package / bundle'
        )
      when coalesce(form_payload->>'form', '') in ('package_builder', 'continue_trip') then
        'Trip builder'
      when coalesce(form_payload->>'form', '') in (
        'malaga_airport_transfer',
        'transport_service_page',
        'homepage_hotel_booked_snapshot'
      ) then 'Booking'
      when lower(coalesce(interest, '')) ~ 'callback|call me|request a call' then
        'Callback'
      when coalesce(form_payload->'fields'->>'_sourcePage', form_payload->'fields'->>'Page', '') ~
        '^/(golf-holidays|golf-packages|guides|transfers|golf-courses)'
        then
          'SEO landing · ' || coalesce(
            nullif(trim(form_payload->'fields'->>'Page'), ''),
            nullif(trim(form_payload->'fields'->>'_sourcePage'), ''),
            'landing page'
          )
      when coalesce(form_payload->>'form', '') in ('content_quick_enquiry', 'website_form', 'quote', 'trip_service_cta')
        then 'Quote request'
      when coalesce(form_payload->>'form', form_payload->>'source', '') <> '' then 'Quote request'
      else 'Unknown'
    end as resolved_label,
    coalesce(
      nullif(trim(form_payload->'fields'->>'_sourcePage'), ''),
      case
        when trim(coalesce(form_payload->'fields'->>'Page', '')) ~ '^/'
          then trim(form_payload->'fields'->>'Page')
        else null
      end,
      ''
    ) as source_page
  from public.enquiries
) sub
where e.id = sub.id
  and (e.form_type = 'unknown' or e.form_type_label = 'Unknown' or e.form_type_label = '');
