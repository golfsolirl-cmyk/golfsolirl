/**
 * Gmail quotation template — package letter fields (Maura-style boxes).
 * Shared by admin compose UI, branded email body, and the quotation PDF.
 */
import { CLIENT_DOCUMENT_COMPANY } from './client-enquiry-document.mjs'

export const MAIL_QUOTATION_FIELD_GROUPS = [
  {
    id: 'package',
    title: 'Your package',
    fields: [
      { key: 'destination', label: 'Destination', placeholder: 'Marbella' },
      { key: 'travelDates', label: 'Travel dates', placeholder: '12–19 April' },
      { key: 'duration', label: 'Duration', placeholder: '7 nights' },
      { key: 'golfers', label: 'Number of golfers', placeholder: '8' },
      { key: 'priceFiveStar', label: '5-star hotel price', placeholder: '€1,550 per person × 8 = €12,400' },
      { key: 'priceFourStar', label: '4-star hotel price', placeholder: '€1,450 per person × 8 = €11,600' }
    ]
  },
  {
    id: 'includes',
    title: 'Your package includes',
    fields: [
      { key: 'hotels', label: 'Hotels', placeholder: 'Choice of 3: Old Town 4-star, Puerto Banús 4-star, or Puerto Banús 5-star.', multiline: true },
      { key: 'golf', label: 'Golf', placeholder: '3 rounds, course names, dates and tee times.', multiline: true },
      { key: 'airportTransfers', label: 'Airport transfers', placeholder: 'Málaga Airport to resort and return.' },
      { key: 'golfTransfers', label: 'Golf course transfers', placeholder: 'Included.' },
      { key: 'breakfast', label: 'Breakfast', placeholder: 'Included in all hotel options.' },
      { key: 'assistance', label: 'Golf Sol Ireland assistance', placeholder: 'Support throughout the trip, same Irish driver each day.' }
    ]
  },
  {
    id: 'notes',
    title: 'Notes and next steps',
    fields: [
      { key: 'extraNotes', label: 'Extra notes', placeholder: 'Buggies, room type, trolley, or anything else to confirm.', multiline: true },
      { key: 'transferTotal', label: 'Transfer total', placeholder: '€1,200 total · €150 per person' },
      { key: 'nextSteps', label: 'Next steps / deposit', placeholder: '20% deposit to secure. Balance 21 days before travel.', multiline: true },
      { key: 'signOffName', label: 'Sign-off name', placeholder: 'Golf Sol Ireland' },
      { key: 'signOffPhone', label: 'Sign-off phone', placeholder: CLIENT_DOCUMENT_COMPANY.irishPhone }
    ]
  }
]

const KEYS = MAIL_QUOTATION_FIELD_GROUPS.flatMap((group) => group.fields.map((field) => field.key))

export const emptyMailQuotationPackage = () => ({
  destination: '',
  travelDates: '',
  duration: '',
  golfers: '',
  priceFiveStar: '',
  priceFourStar: '',
  hotels: '',
  golf: '',
  airportTransfers: '',
  golfTransfers: '',
  breakfast: '',
  assistance: 'Support throughout the trip, with the same Irish driver each day.',
  extraNotes: '',
  transferTotal: '',
  nextSteps:
    'If you are happy with the above, or if you would like to change anything, reply to this email or call. A 20% deposit is required to secure the booking, with the final balance due 21 days before your trip.',
  signOffName: 'Golf Sol Ireland',
  signOffPhone: CLIENT_DOCUMENT_COMPANY.irishPhone
})

export const normalizeMailQuotationPackage = (raw) => {
  const base = emptyMailQuotationPackage()
  const src = raw && typeof raw === 'object' ? raw : {}
  for (const key of KEYS) {
    if (typeof src[key] === 'string') base[key] = src[key]
  }
  return base
}

const labelled = (label, value) => {
  const text = String(value ?? '').trim()
  return text ? `${label}: ${text}` : ''
}

export const prefillMailQuotationPackage = (raw, extras = {}) => {
  const base = normalizeMailQuotationPackage(raw)
  const travelDates = String(extras.travelDates ?? '').trim()
  const golfers = String(extras.golfers ?? extras.numberOfGuests ?? '').trim()
  if (!base.travelDates.trim() && travelDates) base.travelDates = travelDates
  if (!base.golfers.trim() && golfers) base.golfers = golfers
  return base
}

export const quotationMailClosing = (pkg) => {
  const q = normalizeMailQuotationPackage(pkg)
  return ['Kind regards,', q.signOffName.trim() || 'Golf Sol Ireland', q.signOffPhone.trim()].filter(Boolean).join('\n')
}

export const quotationPackageRows = (pkg, extras = {}) => {
  const q = normalizeMailQuotationPackage(pkg)
  const reference = String(extras.reference ?? '').trim()
  return [
    ['Destination', q.destination],
    ['Travel dates', q.travelDates],
    ['Duration', q.duration],
    ['Number of golfers', q.golfers],
    ['5-star hotel', q.priceFiveStar],
    ['4-star hotel', q.priceFourStar],
    ['Hotels', q.hotels],
    ['Golf', q.golf],
    ['Airport transfers', q.airportTransfers],
    ['Golf course transfers', q.golfTransfers],
    ['Breakfast', q.breakfast],
    ['Assistance', q.assistance],
    ['Transfer total', q.transferTotal],
    ['Reference', reference]
  ]
    .filter(([, value]) => String(value ?? '').trim())
    .map(([label, value]) => ({ label, value: String(value).trim() }))
}

export const buildQuotationMailBody = (pkg, extras = {}) => {
  const q = normalizeMailQuotationPackage(pkg)
  const reference = String(extras.reference ?? '').trim()
  const packageLines = [
    labelled('Destination', q.destination),
    labelled('Travel dates', q.travelDates),
    labelled('Duration', q.duration),
    labelled('Number of golfers', q.golfers),
    labelled('5-star hotel', q.priceFiveStar),
    labelled('4-star hotel', q.priceFourStar),
    labelled('Reference', reference)
  ].filter(Boolean)
  const includeLines = [
    labelled('Hotels', q.hotels),
    labelled('Golf', q.golf),
    labelled('Airport transfers', q.airportTransfers),
    labelled('Golf course transfers', q.golfTransfers),
    labelled('Breakfast', q.breakfast),
    labelled('Assistance', q.assistance),
    labelled('Transfer total', q.transferTotal)
  ].filter(Boolean)

  const parts = [
    'Please find your Golf Sol Ireland golf holiday package quotation.',
    packageLines.length ? `Your package\n${packageLines.join('\n')}` : '',
    includeLines.length ? `Your package includes\n${includeLines.join('\n')}` : '',
    String(q.extraNotes ?? '').trim(),
    String(q.nextSteps ?? '').trim()
  ].filter(Boolean)
  return parts.join('\n\n')
}

export const quotationMailVarsFromPackage = (pkg, extras = {}) => {
  const q = normalizeMailQuotationPackage(pkg)
  const price = [q.priceFiveStar, q.priceFourStar].filter((value) => String(value).trim()).join(' · ')
  return {
    travelDates: q.travelDates,
    numberOfGuests: q.golfers,
    price,
    deposit: '20% to secure',
    balance: 'Due 21 days before travel'
  }
}
