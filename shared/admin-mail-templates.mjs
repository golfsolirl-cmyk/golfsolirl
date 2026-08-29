/**
 * Branded admin mail templates for Golf Sol Ireland.
 * Layout/branding stay in server HTML builders. These are content + variables only.
 */
import { CLIENT_DOCUMENT_COMPANY } from './client-enquiry-document.mjs'

export const ADMIN_MAIL_VARIABLES = [
  { key: 'customerName', label: 'Customer name' },
  { key: 'firstName', label: 'First name' },
  { key: 'email', label: 'Customer email' },
  { key: 'phone', label: 'Phone' },
  { key: 'reference', label: 'Enquiry reference' },
  { key: 'interest', label: 'Interest / trip' },
  { key: 'travelDates', label: 'Travel dates' },
  { key: 'numberOfGuests', label: 'Group size' },
  { key: 'price', label: 'Quoted price' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'balance', label: 'Balance' },
  { key: 'companyName', label: 'Company name' },
  { key: 'companyPhone', label: 'Ireland phone' },
  { key: 'website', label: 'Website' }
]

const company = CLIENT_DOCUMENT_COMPANY
const defaultCtaUrl = `${company.websiteUrl}/dashboard`

export const ADMIN_MAIL_TEMPLATES = [
  {
    id: 'general_reply',
    label: 'General reply',
    blurb: 'Polite branded follow-up',
    subject: 'Golf Sol Ireland — {{reference}}',
    heading: 'Thanks for getting in touch',
    introduction: 'Hello {{firstName}},',
    body: 'Thank you for your message. We have reviewed the details and will come back with clear next steps for your Costa del Sol golf trip.\n\nIf anything has changed — dates, group size, or courses — reply to this email and we will update the plan.',
    ctaLabel: 'Open your trip desk',
    ctaUrl: defaultCtaUrl,
    closing: 'Kind regards,\nGolf Sol Ireland'
  },
  {
    id: 'enquiry_followup',
    label: 'Enquiry follow-up',
    blurb: 'After a website form',
    subject: 'Your Golf Sol enquiry {{reference}}',
    heading: 'We have your enquiry',
    introduction: 'Hello {{firstName}},',
    body: 'Thanks for sending your Golf Sol Ireland enquiry{{#interest}} about {{interest}}{{/interest}}. We are putting together transfers, golf, and accommodation options around your dates.\n\nYour reference is {{reference}}. Keep it handy if you call or reply.',
    ctaLabel: 'Open your trip desk',
    ctaUrl: defaultCtaUrl,
    closing: 'We will be in touch shortly.\n\nGolf Sol Ireland'
  },
  {
    id: 'quotation',
    label: 'Quotation',
    blurb: 'Priced trip outline',
    subject: 'Your Costa del Sol golf quote {{reference}}',
    heading: 'Your golf trip quotation',
    introduction: 'Hello {{firstName}},',
    body: 'Please find your Golf Sol Ireland quotation for {{customerName}}.\n\nQuoted total: {{price}}\nDeposit: {{deposit}}\nBalance: {{balance}}\nTravel dates: {{travelDates}}\nGuests: {{numberOfGuests}}\n\nA PDF is attached when one has been generated. Reply if you would like anything adjusted before we hold rooms or tee times.',
    ctaLabel: 'Review your quote',
    ctaUrl: defaultCtaUrl,
    closing: 'Kind regards,\nGolf Sol Ireland'
  },
  {
    id: 'booking_confirmation',
    label: 'Booking confirmation',
    blurb: 'Trip confirmed',
    subject: 'Booking confirmed — {{reference}}',
    heading: 'Your trip is confirmed',
    introduction: 'Hello {{firstName}},',
    body: 'Your Golf Sol Ireland booking is confirmed.\n\nReference: {{reference}}\nTravel dates: {{travelDates}}\nGuests: {{numberOfGuests}}\n\nWe will send transfer and tee-time details as they are locked in. Keep this email for your records.',
    ctaLabel: 'Open your trip desk',
    ctaUrl: defaultCtaUrl,
    closing: 'See you on the Sol.\n\nGolf Sol Ireland'
  },
  {
    id: 'payment_request',
    label: 'Payment request',
    blurb: 'Deposit or balance',
    subject: 'Payment request — {{reference}}',
    heading: 'Payment to proceed',
    introduction: 'Hello {{firstName}},',
    body: 'To proceed with your Costa del Sol golf trip, a payment is due.\n\nAmount due: {{deposit}}\nRemaining balance: {{balance}}\nReference: {{reference}}\n\nYou can pay from your trip desk, or reply if you would like a payment link sent separately.',
    ctaLabel: 'Pay from your desk',
    ctaUrl: defaultCtaUrl,
    closing: 'Thank you,\nGolf Sol Ireland'
  },
  {
    id: 'document_attached',
    label: 'Document attached',
    blurb: 'Letter, quote or itinerary PDF',
    subject: 'Document from Golf Sol Ireland — {{reference}}',
    heading: 'Your document is attached',
    introduction: 'Hello {{firstName}},',
    body: 'Please find a Golf Sol Ireland document attached for {{customerName}} ({{reference}}).\n\nOpen the PDF for the full wording, pricing, and terms. Reply to this email if anything needs a correction.',
    ctaLabel: 'Open your trip desk',
    ctaUrl: defaultCtaUrl,
    closing: 'Kind regards,\nGolf Sol Ireland'
  }
]

export const defaultMailTemplateVars = () => ({
  customerName: '',
  firstName: '',
  email: '',
  phone: '',
  reference: '',
  interest: '',
  travelDates: '',
  numberOfGuests: '',
  price: '',
  deposit: '',
  balance: '',
  companyName: company.name,
  companyPhone: company.irishPhone,
  website: company.websiteDisplay
})

const applySimpleConditionals = (input, vars) =>
  String(input ?? '').replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => {
    const value = String(vars[key] ?? '').trim()
    return value ? inner.replaceAll(`{{${key}}}`, value) : ''
  })

export const applyMailTemplateVars = (input, vars) => {
  const merged = { ...defaultMailTemplateVars(), ...(vars || {}) }
  let out = applySimpleConditionals(input, merged)
  for (const [key, value] of Object.entries(merged)) {
    out = out.replaceAll(`{{${key}}}`, String(value ?? ''))
  }
  return out.replace(/\{\{\w+\}\}/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

export const getMailTemplateById = (id) =>
  ADMIN_MAIL_TEMPLATES.find((t) => t.id === id) ?? ADMIN_MAIL_TEMPLATES[0]

export const mergeMailTemplate = (id, override) => {
  const base = getMailTemplateById(id)
  const o = override && typeof override === 'object' ? override : {}
  const pick = (key) => (typeof o[key] === 'string' && o[key].trim() ? o[key] : base[key])
  return {
    ...base,
    heading: pick('heading'),
    introduction: pick('introduction'),
    body: pick('body'),
    ctaLabel: pick('ctaLabel'),
    ctaUrl: pick('ctaUrl'),
    closing: pick('closing'),
    subject: typeof o.subject === 'string' && o.subject.trim() ? o.subject : base.subject
  }
}

export const firstNameFromFullName = (name) => {
  const part = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0]
  return part || ''
}
