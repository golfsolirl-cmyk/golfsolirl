-- Allow portal paper trail PDFs for card payment receipts (deposit and paid-in-full).

alter table public.portal_client_transfer_documents
  drop constraint if exists portal_client_transfer_documents_document_kind_check;

alter table public.portal_client_transfer_documents
  add constraint portal_client_transfer_documents_document_kind_check
  check (
    document_kind in (
      'form_submission',
      'vat_quote',
      'terms_summary',
      'deposit_receipt',
      'payment_confirmation'
    )
  );

comment on table public.portal_client_transfer_documents is
  'PDFs for client dashboard: quote pack (form, VAT quote, terms), plus deposit_receipt and payment_confirmation after Stripe checkout.';
