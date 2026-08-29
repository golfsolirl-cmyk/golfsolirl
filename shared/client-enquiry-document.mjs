/**
 * Client enquiry / quotation document model.
 * Shared by admin UI, PDF, Word, and save APIs so branding and totals stay aligned.
 *
 * Company details match src/lib/seo/seo-contact.ts and server/email-constants.mjs.
 * Default terms match server/enquiry-form-pdfs-unified.mjs supplementalTermsSections.
 * VAT default matches src/lib/package-build.ts IRISH_VAT_STANDARD_RATE (23%).
 */

export const CLIENT_DOCUMENT_COMPANY = {
  name: 'Golf Sol Ireland',
  tagline: 'Irish-owned Costa del Sol golf travel',
  addressLines: ['6 Richmond Road', 'Drumcondra, Dublin 3', 'D03 C434'],
  irishPhone: '+353 87 446 4766',
  spanishPhone: '+34 641 81 53 66',
  email: 'info@golfsolirl.com',
  websiteDisplay: 'www.golfsolirl.com',
  websiteUrl: 'https://www.golfsolirl.com',
  companyReg: '814210',
  logoPublicPath: '/images/newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png',
  logoFilename: 'newbf9f08a4-8fac-496b-8181-6f6b680d19c3.png'
}

/** Irish standard VAT rate already used for package / quote pricing (not a VAT registration number). */
export const CLIENT_DOCUMENT_VAT_PERCENT = 23

export const CLIENT_DOCUMENT_TYPES = [
  { id: 'enquiry_response', label: 'Enquiry Response' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'booking_confirmation', label: 'Booking Confirmation' },
  { id: 'customer_letter', label: 'Customer Letter' },
  { id: 'custom', label: 'Custom' }
]

export const CLIENT_DOCUMENT_STATUSES = ['draft', 'completed', 'sent']

export const DEFAULT_CLIENT_DOCUMENT_SECTIONS = {
  enquiry: true,
  message: true,
  pricing: false,
  notes: false,
  terms: true,
  payment: false,
  signature: false
}

const QUOTATION_SECTIONS = {
  enquiry: true,
  message: true,
  pricing: true,
  notes: false,
  terms: true,
  payment: true,
  signature: true
}

/**
 * Existing booking terms from the house terms PDF — not invented legal copy.
 */
export const DEFAULT_CLIENT_DOCUMENT_TERMS = [
  'Booking role and supplier responsibility',
  'GolfSol Ireland arranges Costa del Sol golf travel services with third-party hotels, resorts, golf courses, transport providers and other suppliers. We use reasonable care when coordinating your trip, but we do not own or operate those suppliers.',
  'Hotel rooms, accommodation facilities, golf courses, buggies, tee sheets and transfer operations are controlled by the relevant supplier. If a supplier changes, cancels, overbooks or fails to deliver a service, we will help escalate and seek a practical remedy, but we are not liable for that supplier failure. Supplier-specific cancellation, refund, no-show and amendment rules apply once a booking is confirmed.',
  'Deposit and balance',
  'Unless your written proposal states otherwise, a 20% deposit is payable upfront to proceed with the booking. The remaining 80% balance is due within five days of booking confirmation.',
  'If you cancel within 48 hours of paying the deposit, the deposit will be refunded provided no non-refundable supplier cost has already been committed on your instruction. After 48 hours, the 20% deposit is non-refundable because supplier holds, administration and planning work have started. If the balance is not paid on time, suppliers may release rooms, tee times or vehicles and prices may change.',
  'Accommodation, golf and changes',
  'Accommodation is provided by third-party hotels, resorts, apartments or accommodation suppliers. Golf courses control tee times, course condition, course closure, pairing, pace of play, handicap rules, dress codes, buggy availability and refund policy.',
  'Tell us as early as possible if you need to cancel, reduce numbers or change names, dates, hotels, golf rounds or transfer details. Group reductions can increase per-person prices because fixed costs are split across fewer travellers. Travel insurance is strongly recommended.',
  'Liability limits',
  'We are responsible only for our own proven failure to use reasonable care and skill in arranging services. We are not liable for another company mistake, delay, overbooking, cancellation, negligence or operational failure. Where GolfSol Ireland is legally liable, liability is limited to the amount paid to us for the affected service, except where Irish law does not allow that limit. Nothing in these terms excludes liability for fraud, deliberate wrongdoing, death or personal injury caused by negligence, or any legal rights that cannot be excluded.'
].join('\n\n')

/**
 * Payment wording from existing site/terms (Irish-handled EUR payments, deposit split).
 * No bank account / IBAN is stored in the application, so none is printed.
 */
export const DEFAULT_CLIENT_DOCUMENT_PAYMENT = [
  'Payments are handled in Ireland and priced in euro (EUR).',
  'Unless this document states otherwise, a 20% deposit is payable to proceed. The remaining balance is due as set out in our terms.',
  'Card payment can be arranged through your Golf Sol Ireland client portal when a quote is issued.',
  'For payment questions, contact info@golfsolirl.com or +353 87 446 4766.'
].join('\n\n')

export const createClientDocumentReferenceId = () =>
  `GSI-DOC-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

export const formatClientDocumentLongDate = (value) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return ''
  const ymd = raw.slice(0, 10)
  let d = null
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, day] = ymd.split('-').map(Number)
    d = new Date(y, m - 1, day)
  } else {
    d = new Date(raw)
  }
  if (!d || Number.isNaN(d.getTime())) return raw
  return new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

export const todayIsoDate = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const formatClientDocumentEuro = (value) => {
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(safe)
}

const roundMoney = (n) => Math.round((Number(n) || 0) * 100) / 100

const asText = (value) => (typeof value === 'string' ? value.trim() : '')

export const documentTypeLabel = (type, customTitle) => {
  if (type === 'custom') {
    const custom = asText(customTitle)
    return custom || 'Document'
  }
  const found = CLIENT_DOCUMENT_TYPES.find((t) => t.id === type)
  return found?.label ?? 'Document'
}

export const emptyPricingLine = () => ({
  id: `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  description: '',
  qty: 1,
  unitPrice: 0
})

export const defaultClientDocumentDraft = (overrides = {}) => {
  const type = asText(overrides.documentType) || 'enquiry_response'
  const sections =
    type === 'quotation' || type === 'proposal'
      ? { ...QUOTATION_SECTIONS }
      : { ...DEFAULT_CLIENT_DOCUMENT_SECTIONS }
  return {
    id: null,
    enquiryId: null,
    enquiryReference: '',
    status: 'draft',
    documentType: type,
    customTitle: '',
    reference: createClientDocumentReferenceId(),
    subject: '',
    documentDate: todayIsoDate(),
    validUntil: '',
    customer: {
      name: '',
      company: '',
      contactName: '',
      email: '',
      phone: '',
      address: ''
    },
    message: '',
    enquirySummary: '',
    notes: '',
    terms: DEFAULT_CLIENT_DOCUMENT_TERMS,
    paymentDetails: DEFAULT_CLIENT_DOCUMENT_PAYMENT,
    sections,
    pricingMode: 'detailed',
    vatEnabled: true,
    vatPercent: CLIENT_DOCUMENT_VAT_PERCENT,
    pricingLines: [emptyPricingLine()],
    singlePrice: { description: '', total: 0 },
    ...overrides,
    customer: {
      name: '',
      company: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      ...(overrides.customer && typeof overrides.customer === 'object' ? overrides.customer : {})
    },
    sections: {
      ...sections,
      ...(overrides.sections && typeof overrides.sections === 'object' ? overrides.sections : {})
    }
  }
}

export const calculateClientDocumentPricing = (draft) => {
  const vatEnabled = Boolean(draft?.vatEnabled)
  const vatPercent = Number(draft?.vatPercent)
  const rate = Number.isFinite(vatPercent) && vatPercent > 0 ? vatPercent / 100 : 0
  const mode = draft?.pricingMode === 'single' ? 'single' : 'detailed'

  if (mode === 'single') {
    const description = asText(draft?.singlePrice?.description)
    const total = roundMoney(draft?.singlePrice?.total)
    const subtotal = vatEnabled && rate > 0 ? roundMoney(total / (1 + rate)) : total
    const vatAmount = vatEnabled ? roundMoney(total - subtotal) : 0
    return {
      mode,
      lines: description || total ? [{ description: description || 'Total', qty: 1, unitPrice: total, lineTotal: total }] : [],
      subtotal,
      vatAmount,
      vatPercent: vatEnabled ? vatPercent : 0,
      vatEnabled,
      total
    }
  }

  const rawLines = Array.isArray(draft?.pricingLines) ? draft.pricingLines : []
  const lines = rawLines
    .map((line) => {
      const description = asText(line?.description)
      const qty = Number(line?.qty)
      const unitPrice = Number(line?.unitPrice)
      const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 0
      const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0
      return {
        id: typeof line?.id === 'string' ? line.id : emptyPricingLine().id,
        description,
        qty: safeQty,
        unitPrice: roundMoney(safeUnit),
        lineTotal: roundMoney(safeQty * safeUnit)
      }
    })
    .filter((line) => line.description || line.lineTotal)

  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0))
  const vatAmount = vatEnabled && rate > 0 ? roundMoney(subtotal * rate) : 0
  const total = roundMoney(subtotal + vatAmount)
  return {
    mode,
    lines,
    subtotal,
    vatAmount,
    vatPercent: vatEnabled ? (Number.isFinite(vatPercent) ? vatPercent : CLIENT_DOCUMENT_VAT_PERCENT) : 0,
    vatEnabled,
    total
  }
}

const nonEmptyLines = (values) => values.map((v) => asText(v)).filter(Boolean)

export const companyHeaderLines = () => {
  const c = CLIENT_DOCUMENT_COMPANY
  return nonEmptyLines([
    c.name,
    ...c.addressLines,
    `Ireland ${c.irishPhone}`,
    `Spain ${c.spanishPhone}`,
    c.email,
    c.websiteDisplay,
    c.companyReg ? `Registered in Ireland · Co. ${c.companyReg}` : ''
  ])
}

export const companyFooterLine = () => {
  const c = CLIENT_DOCUMENT_COMPANY
  return [c.name, c.websiteDisplay, c.email, c.irishPhone].filter(Boolean).join('  ·  ')
}

export const preparedForLines = (customer) => {
  const contact = asText(customer?.contactName)
  const name = asText(customer?.name)
  const company = asText(customer?.company)
  const lines = []
  if (name) lines.push(name)
  if (company && company !== name) lines.push(company)
  if (contact && contact !== name) lines.push(contact)
  if (asText(customer?.address)) lines.push(asText(customer.address))
  if (asText(customer?.email)) lines.push(asText(customer.email))
  if (asText(customer?.phone)) lines.push(asText(customer.phone))
  return lines
}

export const parseMessageBlocks = (message) => {
  const text = typeof message === 'string' ? message.replace(/\r\n/g, '\n') : ''
  if (!text.trim()) return []
  const blocks = []
  let paragraph = []
  let bullets = []
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
      paragraph = []
    }
  }
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: 'bullets', items: bullets })
      bullets = []
    }
  }
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd()
    const bullet = line.match(/^\s*(?:[-*]|•)\s+(.+)/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)/)
    const heading = line.match(/^\s*#{1,3}\s+(.+)/)
    if (heading) {
      flushParagraph()
      flushBullets()
      blocks.push({ type: 'heading', text: heading[1].trim() })
      continue
    }
    if (bullet || numbered) {
      flushParagraph()
      bullets.push((bullet?.[1] || numbered?.[1] || '').trim())
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      flushBullets()
      continue
    }
    flushBullets()
    paragraph.push(line.trim())
  }
  flushParagraph()
  flushBullets()
  return blocks
}

const sanitizeFilenamePart = (value) =>
  asText(value)
    .replace(/[^\w\s.-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

export const buildClientDocumentFilename = (draft, ext) => {
  const title = sanitizeFilenamePart(documentTypeLabel(draft?.documentType, draft?.customTitle)) || 'Document'
  const name = sanitizeFilenamePart(draft?.customer?.name) || 'Client'
  const ref = sanitizeFilenamePart(draft?.reference) || 'GSI-DOC'
  const safeExt = asText(ext).replace(/^\./, '') || 'pdf'
  return `${title}-${name}-${ref}.${safeExt}`
}

export const buildClientDocumentView = (draft) => {
  const d = draft && typeof draft === 'object' ? draft : defaultClientDocumentDraft()
  const title = documentTypeLabel(d.documentType, d.customTitle)
  const sections = { ...DEFAULT_CLIENT_DOCUMENT_SECTIONS, ...(d.sections && typeof d.sections === 'object' ? d.sections : {}) }
  const pricing = calculateClientDocumentPricing(d)
  const showPricing = Boolean(sections.pricing) && (pricing.lines.length > 0 || pricing.total > 0)
  return {
    title,
    subject: asText(d.subject),
    reference: asText(d.reference),
    dateLabel: formatClientDocumentLongDate(d.documentDate) || formatClientDocumentLongDate(todayIsoDate()),
    validUntilLabel: asText(d.validUntil) ? formatClientDocumentLongDate(d.validUntil) : '',
    company: CLIENT_DOCUMENT_COMPANY,
    companyLines: companyHeaderLines(),
    preparedFor: preparedForLines(d.customer),
    enquirySummary: asText(d.enquirySummary),
    message: asText(d.message),
    messageBlocks: parseMessageBlocks(d.message),
    notes: asText(d.notes),
    terms: asText(d.terms),
    paymentDetails: asText(d.paymentDetails),
    sections: {
      enquiry: Boolean(sections.enquiry) && Boolean(asText(d.enquirySummary)),
      message: Boolean(sections.message) && Boolean(asText(d.message)),
      pricing: showPricing,
      notes: Boolean(sections.notes) && Boolean(asText(d.notes)),
      terms: Boolean(sections.terms) && Boolean(asText(d.terms)),
      payment: Boolean(sections.payment) && Boolean(asText(d.paymentDetails)),
      signature: Boolean(sections.signature)
    },
    pricing,
    footerLine: companyFooterLine(),
    filenameBase: buildClientDocumentFilename(d, 'pdf').replace(/\.pdf$/i, '')
  }
}

const FIELD_SKIP = new Set([
  '_termsaccepted',
  '_termsacceptedat',
  '_accountanchorref',
  '_portaltripworkspace',
  '_servicestages',
  '_pickupid',
  '_dropoffid',
  'page',
  'publicform',
  'termsaccepted'
])

const FIELD_LABELS = {
  _pax: 'Group size',
  _pickuplabel: 'Collection point',
  _dropofflabel: 'Drop-off',
  _pickuptype: 'Collection type',
  _dropofftype: 'Drop-off type',
  _traveldatefrom: 'Travel start date',
  _traveldateto: 'Travel end date',
  _alreadyatmalagaagp: 'Already at Málaga (AGP)',
  _serviceprimary: 'Requested service',
  _quoteintent: 'Quote intent',
  tripbrief: 'Trip brief',
  'trip brief': 'Trip brief',
  'group size': 'Group size',
  passengers: 'Passengers',
  'preferred location': 'Preferred location',
  destination: 'Destination',
  interest: 'Interest',
  topic: 'Topic'
}

const humanizeKey = (key) => {
  const k = String(key || '').trim()
  const norm = k.toLowerCase()
  if (FIELD_LABELS[norm]) return FIELD_LABELS[norm]
  const stripped = k.replace(/^_/, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
  return stripped.replace(/\b\w/g, (ch) => ch.toUpperCase())
}

export const readEnquiryFormFields = (formPayload) => {
  if (!formPayload || typeof formPayload !== 'object' || Array.isArray(formPayload)) return {}
  const fields = formPayload.fields
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return {}
  const out = {}
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string' && v.trim()) out[k] = v.trim()
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = String(v)
  }
  return out
}

export const buildEnquirySummaryFromRow = (enquiry) => {
  const fields = readEnquiryFormFields(enquiry?.form_payload)
  const lines = []
  const push = (label, value) => {
    const v = asText(value)
    if (v) lines.push(`${label}: ${v}`)
  }
  push('Reference', enquiry?.reference_id)
  push('Submitted', formatClientDocumentLongDate(enquiry?.created_at))
  push('Interest', enquiry?.interest)
  if (enquiry?.best_time_to_call) push('Best time to call', enquiry.best_time_to_call)

  const start = fields._travelDateFrom || fields['Travel start date'] || ''
  const end = fields._travelDateTo || fields['Travel end date'] || ''
  if (start || end) {
    const from = formatClientDocumentLongDate(start) || start
    const to = formatClientDocumentLongDate(end) || end
    push('Travel dates', from && to ? `${from} – ${to}` : from || to)
  }
  push('Group size', fields._pax || fields['Group size'] || fields.Passengers || fields['Party size'])
  push('Collection', fields._pickupLabel || fields['Collection point'] || fields.Pickup)
  push('Drop-off', fields._dropoffLabel || fields.Destination || fields['Drop-off'])
  push('Requested service', fields._servicePrimary || fields.Topic)
  push('Trip brief', fields['Trip brief'] || fields.tripBrief || fields.Notes)

  for (const [key, value] of Object.entries(fields)) {
    const norm = key.toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (FIELD_SKIP.has(key.toLowerCase()) || FIELD_SKIP.has(norm)) continue
    if (key.startsWith('_') && !['_pax', '_pickupLabel', '_dropoffLabel', '_travelDateFrom', '_travelDateTo', '_servicePrimary'].includes(key)) {
      continue
    }
    const label = humanizeKey(key)
    if (lines.some((line) => line.startsWith(`${label}:`))) continue
    if (/json|workspace|payload/i.test(label)) continue
    if (value.length > 400) {
      push(label, `${value.slice(0, 400)}…`)
    } else {
      push(label, value)
    }
  }
  return lines.join('\n')
}

export const draftFromEnquiryRow = (enquiry) => {
  const fields = readEnquiryFormFields(enquiry?.form_payload)
  const name = asText(enquiry?.full_name) || asText(fields.Name) || asText(fields['Full name'])
  const email = asText(enquiry?.email) || asText(fields.Email)
  const phone = asText(enquiry?.phone_whatsapp) || asText(fields.Phone) || asText(fields['Phone / WhatsApp'])
  const address = asText(fields.Address) || asText(fields['Home address']) || asText(fields.Location)
  const interest = asText(enquiry?.interest) || asText(fields.Topic) || asText(fields.Interest)
  const reference = asText(enquiry?.reference_id) || createClientDocumentReferenceId()
  const firstName = name.split(/\s+/).filter(Boolean)[0] || ''
  const greeting = firstName ? `Dear ${firstName},` : 'Hello,'
  return defaultClientDocumentDraft({
    enquiryId: enquiry?.id ?? null,
    enquiryReference: asText(enquiry?.reference_id),
    documentType: 'enquiry_response',
    reference,
    subject: interest ? `Re: ${interest}` : '',
    documentDate: todayIsoDate(),
    customer: {
      name,
      email,
      phone,
      address,
      company: asText(fields.Company) || asText(fields['Company name']),
      contactName: ''
    },
    enquirySummary: buildEnquirySummaryFromRow(enquiry),
    message: `${greeting}\n\nThank you for your enquiry to Golf Sol Ireland.\n\n`,
    sections: { ...DEFAULT_CLIENT_DOCUMENT_SECTIONS, enquiry: true }
  })
}

export const normalizeClientDocumentDraft = (raw) => {
  const base = defaultClientDocumentDraft()
  const o = raw && typeof raw === 'object' ? raw : {}
  const type = CLIENT_DOCUMENT_TYPES.some((t) => t.id === o.documentType) ? o.documentType : 'enquiry_response'
  const status = CLIENT_DOCUMENT_STATUSES.includes(o.status) ? o.status : 'draft'
  const customer = o.customer && typeof o.customer === 'object' ? o.customer : {}
  const sections = o.sections && typeof o.sections === 'object' ? o.sections : {}
  const lines = Array.isArray(o.pricingLines)
    ? o.pricingLines.map((line) => ({
        id: typeof line?.id === 'string' && line.id.trim() ? line.id.trim() : emptyPricingLine().id,
        description: asText(line?.description),
        qty: Number.isFinite(Number(line?.qty)) ? Number(line.qty) : 1,
        unitPrice: Number.isFinite(Number(line?.unitPrice)) ? Number(line.unitPrice) : 0
      }))
    : base.pricingLines
  return {
    id: typeof o.id === 'string' && o.id.trim() ? o.id.trim() : null,
    enquiryId: typeof o.enquiryId === 'string' && o.enquiryId.trim() ? o.enquiryId.trim() : null,
    enquiryReference: asText(o.enquiryReference),
    status,
    documentType: type,
    customTitle: asText(o.customTitle),
    reference: asText(o.reference) || createClientDocumentReferenceId(),
    subject: asText(o.subject).slice(0, 240),
    documentDate: asText(o.documentDate).slice(0, 10) || todayIsoDate(),
    validUntil: asText(o.validUntil).slice(0, 10),
    customer: {
      name: asText(customer.name).slice(0, 160),
      company: asText(customer.company).slice(0, 160),
      contactName: asText(customer.contactName).slice(0, 160),
      email: asText(customer.email).slice(0, 180),
      phone: asText(customer.phone).slice(0, 80),
      address: asText(customer.address).slice(0, 400)
    },
    message: typeof o.message === 'string' ? o.message.slice(0, 20000) : '',
    enquirySummary: typeof o.enquirySummary === 'string' ? o.enquirySummary.slice(0, 8000) : '',
    notes: typeof o.notes === 'string' ? o.notes.slice(0, 8000) : '',
    terms: typeof o.terms === 'string' ? o.terms.slice(0, 20000) : DEFAULT_CLIENT_DOCUMENT_TERMS,
    paymentDetails: typeof o.paymentDetails === 'string' ? o.paymentDetails.slice(0, 8000) : DEFAULT_CLIENT_DOCUMENT_PAYMENT,
    sections: {
      enquiry: sections.enquiry !== false,
      message: sections.message !== false,
      pricing: Boolean(sections.pricing),
      notes: Boolean(sections.notes),
      terms: sections.terms !== false,
      payment: Boolean(sections.payment),
      signature: Boolean(sections.signature)
    },
    pricingMode: o.pricingMode === 'single' ? 'single' : 'detailed',
    vatEnabled: o.vatEnabled !== false,
    vatPercent: Number.isFinite(Number(o.vatPercent)) ? Math.min(100, Math.max(0, Number(o.vatPercent))) : CLIENT_DOCUMENT_VAT_PERCENT,
    pricingLines: lines.length ? lines.slice(0, 40) : [emptyPricingLine()],
    singlePrice: {
      description: asText(o.singlePrice?.description).slice(0, 240),
      total: Number.isFinite(Number(o.singlePrice?.total)) ? Number(o.singlePrice.total) : 0
    }
  }
}

export const draftToDbRow = (draft, createdBy) => {
  const d = normalizeClientDocumentDraft(draft)
  const pricing = calculateClientDocumentPricing(d)
  return {
    enquiry_id: d.enquiryId,
    enquiry_reference: d.enquiryReference || null,
    customer_name: d.customer.name,
    customer_company: d.customer.company,
    customer_contact_name: d.customer.contactName,
    customer_email: d.customer.email,
    customer_phone: d.customer.phone,
    customer_address: d.customer.address,
    document_type: d.documentType,
    document_title: documentTypeLabel(d.documentType, d.customTitle),
    reference: d.reference,
    subject: d.subject,
    document_date: d.documentDate || todayIsoDate(),
    valid_until: d.validUntil || null,
    message: d.message,
    enquiry_summary: d.enquirySummary,
    notes: d.notes,
    terms: d.terms,
    payment_details: d.paymentDetails,
    sections: d.sections,
    pricing: {
      mode: d.pricingMode,
      vatEnabled: d.vatEnabled,
      vatPercent: d.vatPercent,
      lines: d.pricingLines,
      singlePrice: d.singlePrice
    },
    subtotal: pricing.subtotal,
    vat_amount: pricing.vatAmount,
    total: pricing.total,
    status: d.status,
    created_by: createdBy || null,
    updated_at: new Date().toISOString()
  }
}

export const dbRowToDraft = (row) => {
  if (!row || typeof row !== 'object') return defaultClientDocumentDraft()
  const pricing = row.pricing && typeof row.pricing === 'object' ? row.pricing : {}
  const type = row.document_type
  const customTitle = type === 'custom' ? asText(row.document_title) : ''
  return normalizeClientDocumentDraft({
    id: row.id,
    enquiryId: row.enquiry_id,
    enquiryReference: row.enquiry_reference,
    status: row.status,
    documentType: type,
    customTitle,
    reference: row.reference,
    subject: row.subject,
    documentDate: row.document_date,
    validUntil: row.valid_until,
    customer: {
      name: row.customer_name,
      company: row.customer_company,
      contactName: row.customer_contact_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.customer_address
    },
    message: row.message,
    enquirySummary: row.enquiry_summary,
    notes: row.notes,
    terms: row.terms,
    paymentDetails: row.payment_details,
    sections: row.sections,
    pricingMode: pricing.mode,
    vatEnabled: pricing.vatEnabled,
    vatPercent: pricing.vatPercent,
    pricingLines: pricing.lines,
    singlePrice: pricing.singlePrice
  })
}

export const listRowFromDb = (row) => ({
  id: row.id,
  reference: row.reference,
  customerName: row.customer_name || '—',
  customerEmail: row.customer_email || '',
  documentType: row.document_type,
  documentTitle: row.document_title,
  documentDate: row.document_date,
  total: row.total,
  status: row.status,
  enquiryReference: row.enquiry_reference,
  enquiryId: row.enquiry_id,
  updatedAt: row.updated_at,
  createdAt: row.created_at
})
