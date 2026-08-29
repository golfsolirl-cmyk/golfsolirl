-- Paste into the Supabase SQL editor if migrations are not applied automatically.
-- Admin-authored client letters / quotations (structured data; Word/PDF regenerated on demand).

create table if not exists public.client_enquiry_documents (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries (id) on delete set null,
  enquiry_reference text,
  customer_name text not null default '',
  customer_company text not null default '',
  customer_contact_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  customer_address text not null default '',
  document_type text not null default 'enquiry_response'
    check (document_type in (
      'enquiry_response',
      'quotation',
      'proposal',
      'booking_confirmation',
      'invoice',
      'deposit_receipt',
      'payment_receipt',
      'paid_in_full',
      'customer_letter',
      'custom'
    )),
  document_title text not null default 'Enquiry Response',
  reference text not null unique,
  subject text not null default '',
  document_date date not null default (timezone('utc', now()))::date,
  valid_until date,
  message text not null default '',
  enquiry_summary text not null default '',
  notes text not null default '',
  terms text not null default '',
  payment_details text not null default '',
  sections jsonb not null default '{}'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  subtotal numeric(12, 2),
  vat_amount numeric(12, 2),
  total numeric(12, 2),
  status text not null default 'draft'
    check (status in ('draft', 'completed', 'sent')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_enquiry_documents_updated_idx
  on public.client_enquiry_documents (updated_at desc);

create index if not exists client_enquiry_documents_enquiry_idx
  on public.client_enquiry_documents (enquiry_id);

create index if not exists client_enquiry_documents_status_idx
  on public.client_enquiry_documents (status);

comment on table public.client_enquiry_documents is
  'Admin client letters and quotations. Structured payload only — Word/PDF files are generated on download.';

alter table public.client_enquiry_documents enable row level security;

drop policy if exists "client_enquiry_documents_admin_all" on public.client_enquiry_documents;
create policy "client_enquiry_documents_admin_all"
  on public.client_enquiry_documents for all
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.client_enquiry_documents to authenticated;
grant all on public.client_enquiry_documents to service_role;
