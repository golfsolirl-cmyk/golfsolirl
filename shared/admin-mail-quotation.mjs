/**
 * Gmail quotation template — Word letter fields (Maura branded + blank template).
 * Shared by admin compose UI, branded email body, and the quotation PDF.
 */
import { CLIENT_DOCUMENT_COMPANY } from './client-enquiry-document.mjs'

export const createMailQuotationReferenceId = () => {
  const year = new Date().getFullYear()
  const token = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GS-Q-${year}-${token}`
}

export const emptyHotelOption = (partial = {}) => ({
  id: String(partial.id ?? `opt-${Math.random().toString(36).slice(2, 8)}`),
  name: String(partial.name ?? ''),
  pricePerPerson: String(partial.pricePerPerson ?? ''),
  golferCount: String(partial.golferCount ?? '')
})

export const emptyGolfCourseOption = (partial = {}) => ({
  id: String(partial.id ?? `course-${Math.random().toString(36).slice(2, 8)}`),
  name: String(partial.name ?? ''),
  pricePerGolfer: String(partial.pricePerGolfer ?? ''),
  golferCount: String(partial.golferCount ?? '')
})

const STRING_KEYS = [
  'destination',
  'travelDates',
  'duration',
  'golfers',
  'hotels',
  'golf',
  'airportTransfers',
  'golfTransfers',
  'breakfast',
  'assistance',
  'extraNotes',
  'transferTotal',
  'transferPerPerson',
  'depositPercent',
  'depositAmount',
  'balanceDue',
  'balanceDueDate',
  'quoteExpiry',
  'nextSteps',
  'signOffName',
  'signOffPhone',
  'signOffEmail'
]

export const MAIL_QUOTATION_INCLUDE_FIELDS = [
  { key: 'hotels', label: 'Hotels', placeholder: 'Choice of 3: Old Town 4-star, Puerto Banús 4-star, or Puerto Banús 5-star.', multiline: true },
  { key: 'golf', label: 'Golf', placeholder: '3 rounds, course names, dates and tee times.', multiline: true },
  { key: 'airportTransfers', label: 'Airport transfers', placeholder: 'Málaga Airport collection and return.', multiline: true },
  { key: 'golfTransfers', label: 'Golf course transfers', placeholder: 'Included.' },
  { key: 'breakfast', label: 'Breakfast / board', placeholder: 'Included in all hotel options.' },
  { key: 'assistance', label: 'Golf Sol Ireland assistance', placeholder: 'Support throughout the trip, same Irish driver each day.' }
]

export const MAIL_QUOTATION_NOTE_FIELDS = [
  { key: 'extraNotes', label: 'Additional notes', placeholder: 'Buggies, trolley, room type, exclusions, or conditions.', multiline: true },
  { key: 'nextSteps', label: 'Personal message / next steps', placeholder: 'If you are happy to proceed, we can reserve the rooms.', multiline: true }
]

/** @deprecated Use MAIL_QUOTATION_INCLUDE_FIELDS + hotel options. Kept for older compose payloads. */
export const MAIL_QUOTATION_FIELD_GROUPS = [
  {
    id: 'includes',
    title: 'Your package includes',
    fields: MAIL_QUOTATION_INCLUDE_FIELDS
  },
  {
    id: 'notes',
    title: 'Notes and next steps',
    fields: MAIL_QUOTATION_NOTE_FIELDS
  }
]

export const parseQuotationMoney = (raw) => {
  const cleaned = String(raw ?? '').replace(/[^0-9.]/g, '')
  if (!cleaned) return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export const formatQuotationEuro = (value) => {
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(safe)
}

export const hotelOptionTotal = (opt) => {
  const pp = parseQuotationMoney(opt?.pricePerPerson)
  const golfers = Math.max(0, Math.round(parseQuotationMoney(opt?.golferCount)))
  return Math.round(pp * golfers)
}

export const hotelOptionSummary = (opt) => {
  const name = String(opt?.name ?? '').trim() || 'Hotel option'
  const pp = parseQuotationMoney(opt?.pricePerPerson)
  const golfers = Math.max(0, Math.round(parseQuotationMoney(opt?.golferCount)))
  if (!pp && !String(opt?.pricePerPerson ?? '').trim()) return name
  if (!pp) return name
  if (!golfers) return `${name}: ${formatQuotationEuro(pp)} per person`
  return `${name}: ${formatQuotationEuro(pp)} per person \u00d7 ${golfers} = ${formatQuotationEuro(pp * golfers)}`
}

export const emptyMailQuotationPackage = () => ({
  destination: '',
  travelDates: '',
  duration: '',
  golfers: '',
  hotelOptions: [
    emptyHotelOption({ id: 'opt-1', name: '5-star hotel' }),
    emptyHotelOption({ id: 'opt-2', name: '4-star hotel' })
  ],
  golfCourses: [emptyGolfCourseOption({ id: 'course-1' })],
  hotels: '',
  golf: '',
  airportTransfers: '',
  golfTransfers: '',
  breakfast: '',
  assistance: 'Support throughout the trip, with the same Irish driver each day.',
  extraNotes: '',
  transferTotal: '',
  transferPerPerson: '',
  depositPercent: '20',
  depositAmount: '',
  balanceDue: '',
  balanceDueDate: '21 days before travel',
  quoteExpiry: '',
  nextSteps:
    'If you are happy with the above, or if you would like to change anything, reply to this email or call. A 20% deposit is required to secure the booking, with the final balance due 21 days before your trip.',
  signOffName: 'Golf Sol Ireland',
  signOffPhone: CLIENT_DOCUMENT_COMPANY.irishPhone,
  signOffEmail: CLIENT_DOCUMENT_COMPANY.email
})

const normalizeHotelOptions = (raw, golfers) => {
  const src = raw && typeof raw === 'object' ? raw : {}
  if (Array.isArray(src.hotelOptions) && src.hotelOptions.length) {
    return src.hotelOptions.slice(0, 6).map((row, index) =>
      emptyHotelOption({
        id: row?.id || `opt-${index + 1}`,
        name: row?.name,
        pricePerPerson: row?.pricePerPerson,
        golferCount: row?.golferCount || golfers
      })
    )
  }
  const legacy = []
  if (typeof src.priceFiveStar === 'string' && src.priceFiveStar.trim()) {
    legacy.push(emptyHotelOption({ id: 'opt-1', name: src.priceFiveStar.trim(), golferCount: golfers }))
  }
  if (typeof src.priceFourStar === 'string' && src.priceFourStar.trim()) {
    legacy.push(emptyHotelOption({ id: 'opt-2', name: src.priceFourStar.trim(), golferCount: golfers }))
  }
  if (legacy.length) return legacy
  return [
    emptyHotelOption({ id: 'opt-1', name: '5-star hotel', golferCount: golfers }),
    emptyHotelOption({ id: 'opt-2', name: '4-star hotel', golferCount: golfers })
  ]
}

const normalizeGolfCourses = (raw, golfers) => {
  const src = raw && typeof raw === 'object' ? raw : {}
  if (Array.isArray(src.golfCourses) && src.golfCourses.length) {
    return src.golfCourses.slice(0, 8).map((row, index) =>
      emptyGolfCourseOption({
        id: row?.id || `course-${index + 1}`,
        name: row?.name,
        pricePerGolfer: row?.pricePerGolfer,
        golferCount: row?.golferCount || golfers
      })
    )
  }
  return [emptyGolfCourseOption({ id: 'course-1', golferCount: golfers })]
}

export const normalizeMailQuotationPackage = (raw) => {
  const base = emptyMailQuotationPackage()
  const src = raw && typeof raw === 'object' ? raw : {}
  for (const key of STRING_KEYS) {
    if (typeof src[key] === 'string') base[key] = src[key]
  }
  base.hotelOptions = normalizeHotelOptions(src, base.golfers)
  base.golfCourses = normalizeGolfCourses(src, base.golfers)
  return base
}

export const golfCourseLineTotal = (row) => {
  const each = parseQuotationMoney(row?.pricePerGolfer)
  const golfers = Math.max(0, Math.round(parseQuotationMoney(row?.golferCount)))
  return Math.round(each * golfers)
}

export const quotationComputed = (pkg) => {
  const q = normalizeMailQuotationPackage(pkg)
  const golfers = Math.max(0, Math.round(parseQuotationMoney(q.golfers)))
  const options = q.hotelOptions.map((opt) => {
    const count = Math.max(0, Math.round(parseQuotationMoney(opt.golferCount))) || golfers
    const pricePerPerson = parseQuotationMoney(opt.pricePerPerson)
    const total = Math.round(pricePerPerson * count)
    return {
      ...opt,
      golferCount: count ? String(count) : opt.golferCount,
      pricePerPersonValue: pricePerPerson,
      golferCountValue: count,
      total,
      summary: hotelOptionSummary({ ...opt, golferCount: count ? String(count) : opt.golferCount })
    }
  })
  const priced = options.filter((opt) => opt.total > 0 || opt.pricePerPersonValue > 0)
  const leadTotal = priced.find((opt) => opt.total > 0)?.total || 0
  const fromPerPerson = priced
    .map((opt) => opt.pricePerPersonValue)
    .filter((n) => n > 0)
    .sort((a, b) => a - b)[0] || 0
  const percent = parseQuotationMoney(q.depositPercent) || 20
  const depositAmount = Math.round(leadTotal * (percent / 100))
  const balanceDue = Math.max(0, leadTotal - depositAmount)
  const transferTotal = parseQuotationMoney(q.transferTotal)
  const transferPerPerson = golfers > 0 && transferTotal > 0 ? Math.round(transferTotal / golfers) : parseQuotationMoney(q.transferPerPerson)
  const courses = q.golfCourses.map((row) => {
    const count = Math.max(0, Math.round(parseQuotationMoney(row.golferCount))) || golfers
    const pricePerGolfer = parseQuotationMoney(row.pricePerGolfer)
    const total = Math.round(pricePerGolfer * count)
    return {
      ...row,
      golferCount: count ? String(count) : row.golferCount,
      pricePerGolferValue: pricePerGolfer,
      golferCountValue: count,
      total
    }
  })
  const golfTotal = courses.reduce((sum, row) => sum + (row.total > 0 ? row.total : 0), 0)
  return {
    golfers,
    options,
    courses,
    golfTotal,
    leadTotal,
    fromPerPerson,
    depositPercent: percent,
    depositAmount,
    balanceDue,
    transferTotal,
    transferPerPerson,
    payableEuros: Math.round(golfTotal + leadTotal)
  }
}

/** Amount that should open a portal payment: golf rounds plus the first priced hotel package. */
export const quotePayableEuros = (pkg) => quotationComputed(pkg).payableEuros

export const buildGolfCourseMailBlock = (pkg) => {
  const computed = quotationComputed(pkg)
  const lines = computed.courses
    .filter((row) => row.total > 0 || row.pricePerGolferValue > 0)
    .map((row) => {
      const name = row.name.trim() || 'Golf course'
      if (!row.golferCountValue) return `${name}: ${formatQuotationEuro(row.pricePerGolferValue)} per golfer`
      return `${name}: ${formatQuotationEuro(row.pricePerGolferValue)} per golfer × ${row.golferCountValue} = ${formatQuotationEuro(row.total)}`
    })
  if (!lines.length) return ''
  return `Golf courses\n${lines.join('\n')}\nGolf courses total: ${formatQuotationEuro(computed.golfTotal)}`
}

const labelled = (label, value) => {
  const text = String(value ?? '').trim()
  return text ? `${label}: ${text}` : ''
}

export const prefillMailQuotationPackage = (raw, extras = {}) => {
  const base = normalizeMailQuotationPackage(raw)
  const travelDates = String(extras.travelDates ?? '').trim()
  const golfers = String(extras.golfers ?? extras.numberOfGuests ?? '').trim()
  const destination = String(extras.destination ?? extras.interest ?? '').trim()
  if (!base.travelDates.trim() && travelDates) base.travelDates = travelDates
  if (!base.golfers.trim() && golfers) base.golfers = golfers
  if (!base.destination.trim() && destination) base.destination = destination
  if (base.golfers.trim()) {
    base.hotelOptions = base.hotelOptions.map((opt) =>
      opt.golferCount.trim() ? opt : { ...opt, golferCount: base.golfers }
    )
    base.golfCourses = base.golfCourses.map((row) =>
      row.golferCount.trim() ? row : { ...row, golferCount: base.golfers }
    )
  }
  return base
}

export const quotationMailClosing = (pkg) => {
  const q = normalizeMailQuotationPackage(pkg)
  return ['Kind regards,', q.signOffName.trim() || 'Golf Sol Ireland', q.signOffPhone.trim(), q.signOffEmail.trim()]
    .filter(Boolean)
    .join('\n')
}

export const buildQuotationMailBody = (pkg, extras = {}) => {
  const q = normalizeMailQuotationPackage(pkg)
  const computed = quotationComputed(q)
  const reference = String(extras.reference ?? '').trim()
  const packageLines = [
    labelled('Destination', q.destination),
    labelled('Travel dates', q.travelDates),
    labelled('Duration', q.duration),
    labelled('Number of golfers', q.golfers),
    labelled('Reference', reference)
  ].filter(Boolean)
  const priceLines = computed.options
    .map((opt) => labelled(opt.name.trim() || 'Hotel option', opt.summary.includes(': ') ? opt.summary.split(': ').slice(1).join(': ') : opt.summary))
    .filter((line) => {
      const value = line.split(': ').slice(1).join(': ').trim()
      return value && value !== 'Hotel option' && value !== '5-star hotel' && value !== '4-star hotel'
    })
  const includeLines = [
    labelled('Hotels', q.hotels),
    labelled('Golf', q.golf),
    labelled('Airport transfers', q.airportTransfers),
    labelled('Golf course transfers', q.golfTransfers),
    labelled('Breakfast', q.breakfast),
    labelled('Assistance', q.assistance)
  ].filter(Boolean)
  const paymentLines = [
    labelled('Transfer total', q.transferTotal || (computed.transferTotal ? formatQuotationEuro(computed.transferTotal) : '')),
    labelled(
      'Transfer per person',
      q.transferPerPerson || (computed.transferPerPerson ? formatQuotationEuro(computed.transferPerPerson) : '')
    ),
    labelled('Deposit', `${computed.depositPercent}%${computed.depositAmount ? ` / ${formatQuotationEuro(computed.depositAmount)}` : ''}`),
    labelled('Final balance', computed.balanceDue ? formatQuotationEuro(computed.balanceDue) : q.balanceDue),
    labelled('Balance due', q.balanceDueDate),
    labelled('Quote expiry', q.quoteExpiry)
  ].filter((line) => {
    const value = line.split(': ').slice(1).join(': ').trim()
    return value && value !== '20%' && value !== '20% /'
  })

  const parts = [
    'Please find your Golf Sol Ireland golf holiday quotation.',
    packageLines.length ? `Your package\n${packageLines.join('\n')}` : '',
    priceLines.length ? `Package price\n${priceLines.join('\n')}` : '',
    includeLines.length ? `Your package includes\n${includeLines.join('\n')}` : '',
    buildGolfCourseMailBlock(q),
    String(q.extraNotes ?? '').trim(),
    paymentLines.length ? `Transfer and payment\n${paymentLines.join('\n')}` : '',
    String(q.nextSteps ?? '').trim()
  ].filter(Boolean)
  return parts.join('\n\n')
}

export const quotationMailVarsFromPackage = (pkg) => {
  const q = normalizeMailQuotationPackage(pkg)
  const computed = quotationComputed(q)
  const price = computed.options.map((opt) => opt.summary).filter((line) => parseQuotationMoney(line) > 0 || line.includes('EUR') || line.includes('€')).join(' · ')
  return {
    travelDates: q.travelDates,
    numberOfGuests: q.golfers,
    price: price || (computed.fromPerPerson ? `From ${formatQuotationEuro(computed.fromPerPerson)} per person` : ''),
    deposit: computed.depositAmount ? `${computed.depositPercent}% / ${formatQuotationEuro(computed.depositAmount)}` : `${computed.depositPercent}% to secure`,
    balance: computed.balanceDue ? formatQuotationEuro(computed.balanceDue) : q.balanceDueDate
  }
}
