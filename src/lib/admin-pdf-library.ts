export type AdminPdfDoc = {
  readonly id: string
  readonly group: string
  readonly title: string
  readonly description: string
  readonly href: string
}

/** House PDFs served from `public/`. Same files as the sample pack and official quotation letters. */
export const ADMIN_PDF_LIBRARY: readonly AdminPdfDoc[] = [
  {
    id: 'enquiry-acknowledgement',
    group: 'Enquiry pack',
    title: 'Enquiry acknowledgement',
    description: 'Summary of what the guest submitted.',
    href: '/pdf-samples/1-enquiry-pack/enquiry-acknowledgement.pdf'
  },
  {
    id: 'terms-and-conditions',
    group: 'Enquiry pack',
    title: 'Terms and conditions',
    description: 'Full terms sent with an enquiry.',
    href: '/pdf-samples/1-enquiry-pack/terms-and-conditions.pdf'
  },
  {
    id: 'traveller-contacts',
    group: 'Enquiry pack',
    title: 'Traveller contacts',
    description: 'Costa del Sol emergency and useful contacts.',
    href: '/pdf-samples/1-enquiry-pack/traveller-contacts.pdf'
  },
  {
    id: 'packing-checklist',
    group: 'Enquiry pack',
    title: 'Packing checklist',
    description: 'Golf trip packing list.',
    href: '/pdf-samples/1-enquiry-pack/packing-checklist.pdf'
  },
  {
    id: 'formal-proposal',
    group: 'Proposal',
    title: 'Formal proposal',
    description: 'Multi-page proposal with pricing and terms.',
    href: '/pdf-samples/2-formal-proposal/formal-proposal.pdf'
  },
  {
    id: 'original-request-snapshot',
    group: 'Transfer paper trail',
    title: 'Original request',
    description: 'What the guest originally requested.',
    href: '/pdf-samples/3-transfer-portal-paper-trail/original-request-snapshot.pdf'
  },
  {
    id: 'transfer-vat-quote',
    group: 'Transfer paper trail',
    title: 'Transfer VAT quote',
    description: 'Quoted price with the VAT breakdown.',
    href: '/pdf-samples/3-transfer-portal-paper-trail/transfer-vat-quote.pdf'
  },
  {
    id: 'terms-summary',
    group: 'Transfer paper trail',
    title: 'Terms summary',
    description: 'One-page terms summary.',
    href: '/pdf-samples/3-transfer-portal-paper-trail/terms-summary.pdf'
  },
  {
    id: 'deposit-receipt',
    group: 'Transfer paper trail',
    title: 'Deposit receipt',
    description: 'After a deposit card payment.',
    href: '/pdf-samples/3-transfer-portal-paper-trail/deposit-receipt.pdf'
  },
  {
    id: 'paid-in-full',
    group: 'Transfer paper trail',
    title: 'Paid in full',
    description: 'After the balance is paid.',
    href: '/pdf-samples/3-transfer-portal-paper-trail/paid-in-full-confirmation.pdf'
  },
  {
    id: 'trip-invoice',
    group: 'Invoice',
    title: 'Trip invoice',
    description: 'Formal invoice with amount, reference, and client details.',
    href: '/pdf-samples/4-portal-invoice/trip-invoice.pdf'
  },
  {
    id: 'refund-confirmation',
    group: 'Refund',
    title: 'Refund confirmation',
    description: 'Refund amount, Stripe references, and route.',
    href: '/pdf-samples/5-transfer-refund/refund-confirmation.pdf'
  },
  {
    id: 'homepage-client-document',
    group: 'Trip overview',
    title: 'Homepage trip overview',
    description: 'Branded visual overview of the guest’s trip.',
    href: '/pdf-samples/6-homepage-branded-document/homepage-client-document.pdf'
  },
  {
    id: 'unified-template',
    group: 'Design reference',
    title: 'Letterhead template',
    description: 'Shared header, tables, and footer used on invoices and quotes.',
    href: '/pdf-samples/7-unified-template-reference/unified-document-template.pdf'
  },
  {
    id: 'branded-layout',
    group: 'Design reference',
    title: 'Branded layout sample',
    description: 'Green bar, crest, and cream page style.',
    href: '/pdf-samples/8-branded-layout-reference/branded-layout-sample.pdf'
  },
  {
    id: 'blank-quotation',
    group: 'Official quotations',
    title: 'Blank quotation letter',
    description: 'Official blank quotation PDF.',
    href: '/docs/GolfSol_Ireland_Blank_Quotation_Template.pdf'
  },
  {
    id: 'branded-quotation',
    group: 'Official quotations',
    title: 'Branded quotation letter',
    description: 'Official branded quotation letter. Gmail uses this layout.',
    href: '/docs/GolfSol_Ireland_Quotation_Maura_Branded.pdf'
  }
] as const

export const ADMIN_PDF_LIBRARY_DEFAULT_ID = 'trip-invoice'

export function adminPdfLibraryGroups(): { group: string; docs: AdminPdfDoc[] }[] {
  const order: string[] = []
  const byGroup = new Map<string, AdminPdfDoc[]>()
  for (const doc of ADMIN_PDF_LIBRARY) {
    const list = byGroup.get(doc.group)
    if (list) {
      list.push(doc)
    } else {
      order.push(doc.group)
      byGroup.set(doc.group, [doc])
    }
  }
  return order.map((group) => ({ group, docs: byGroup.get(group) ?? [] }))
}

export function adminPdfByHref(href: string): AdminPdfDoc | undefined {
  return ADMIN_PDF_LIBRARY.find((doc) => doc.href === href)
}
