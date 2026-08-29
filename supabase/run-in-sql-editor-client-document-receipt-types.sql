-- Paste into the Supabase SQL editor if the types migration is not applied automatically.

alter table public.client_enquiry_documents
  drop constraint if exists client_enquiry_documents_document_type_check;

alter table public.client_enquiry_documents
  add constraint client_enquiry_documents_document_type_check
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
  ));
