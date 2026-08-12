/** Mirrors server/admin-send-document-service.mjs ADMIN_DOCUMENT_CATALOG for the admin UI. */
export type AdminDocumentCatalogItem = {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly needsMessage: boolean
}

export const ADMIN_DOCUMENT_CATALOG: readonly AdminDocumentCatalogItem[] = [
  {
    id: 'custom_letter',
    label: 'Custom letter / quote note',
    description: 'Your message + client ID on a branded PDF (quotes, notes, confirmations).',
    needsMessage: true
  },
  {
    id: 'booking_confirmation',
    label: 'Booking confirmation letter',
    description: 'Branded confirmation with client / booking ID and your message.',
    needsMessage: true
  },
  {
    id: 'quote_summary_letter',
    label: 'Quote summary letter',
    description: 'Branded quote note — put totals and inclusions in the message box.',
    needsMessage: true
  },
  {
    id: 'receipt_letter',
    label: 'Payment receipt note',
    description: 'Branded receipt-style letter (use Transfers for Stripe receipts when paid).',
    needsMessage: true
  },
  {
    id: 'enquiry_ack',
    label: 'Enquiry acknowledgement',
    description: 'Website enquiry trip brief PDF (needs a GSI- enquiry ref).',
    needsMessage: false
  },
  {
    id: 'terms',
    label: 'Terms & conditions',
    description: 'Full Golf Sol Ireland terms PDF.',
    needsMessage: false
  },
  {
    id: 'traveller_contacts',
    label: 'Traveller contacts',
    description: 'Costa del Sol contacts sheet for the guest.',
    needsMessage: false
  },
  {
    id: 'packing_checklist',
    label: 'Packing checklist',
    description: 'Golf trip packing checklist PDF.',
    needsMessage: false
  },
  {
    id: 'terms_summary',
    label: 'Transfer terms summary',
    description: 'One-page transfer terms summary.',
    needsMessage: false
  },
  {
    id: 'trip_overview',
    label: 'Trip overview',
    description: 'Branded trip desk overview with client details and your message.',
    needsMessage: true
  }
] as const
