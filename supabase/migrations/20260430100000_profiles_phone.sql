-- Client portal: store phone on profile (synced from enquiries or OAuth metadata).
alter table public.profiles
  add column if not exists phone text;

comment on column public.profiles.phone is 'Customer phone / WhatsApp; may be synced from latest enquiry by email.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'phone_number', '')), ''),
    'client'
  );
  return new;
end;
$$;
