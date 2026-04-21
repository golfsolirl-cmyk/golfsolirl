import { companyContact } from '../data/site-content'

const WHATSAPP_DIGITS = companyContact.phoneTel.replace(/[^0-9]/g, '')

export type SmartWhatsappTemplate =
  | 'general'
  | 'transport-quick'
  | 'transport-custom'
  | 'packages-build'
  | 'support'

interface SmartWhatsappContext {
  readonly from?: string
  readonly to?: string
  readonly passengers?: number
  readonly groupSize?: number
  readonly nights?: number
  readonly rounds?: number
  readonly transferStyle?: string
  readonly travelDates?: string
  readonly note?: string
  readonly pageLabel?: string
}

const emptyFallback = 'to be confirmed'

function parsePositiveInt(input: string | null, fallback: number) {
  const parsed = Number.parseInt(input ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function humanizeTransferStyle(value?: string) {
  if (!value) return emptyFallback
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function buildMessage(template: SmartWhatsappTemplate, context: SmartWhatsappContext = {}) {
  const from = context.from?.trim() || emptyFallback
  const to = context.to?.trim() || emptyFallback
  const passengers = context.passengers ?? 4
  const groupSize = context.groupSize ?? passengers
  const nights = context.nights ?? 4
  const rounds = context.rounds ?? 3
  const transfer = humanizeTransferStyle(context.transferStyle)
  const travelDates = context.travelDates?.trim() || emptyFallback
  const note = context.note?.trim()
  const pageLabel = context.pageLabel?.trim()

  switch (template) {
    case 'transport-quick':
      return [
        'Hi there Golf Sol Ireland team,',
        `I am enquiring about transport from ${from} to ${to} for ${passengers} ${
          passengers === 1 ? 'person' : 'people'
        }.`,
        'Could you share availability and the best option for us?'
      ].join('\n')
    case 'transport-custom':
      return [
        'Hi there Golf Sol Ireland team,',
        'I would like a custom transfer quote:',
        `• From: ${from}`,
        `• To: ${to}`,
        `• Group: ${passengers} ${passengers === 1 ? 'person' : 'people'}`,
        note ? `• Notes: ${note}` : '• Notes: golf bags included',
        'Please send the best options.'
      ].join('\n')
    case 'packages-build':
      return [
        'Hi Golf Sol Ireland,',
        'Please help me shape this trip package:',
        `• Group size: ${groupSize} ${groupSize === 1 ? 'golfer' : 'golfers'}`,
        `• Nights: ${nights}`,
        `• Rounds: ${rounds}`,
        `• Transfer style: ${transfer}`,
        `• Travel dates: ${travelDates}`,
        note ? `• Notes: ${note}` : '• Notes: open to your best recommendations'
      ].join('\n')
    case 'support':
      return pageLabel
        ? `Hi Golf Sol Ireland, I need help with "${pageLabel}" and would like support via WhatsApp.`
        : 'Hi Golf Sol Ireland, I need help with my enquiry and would like support via WhatsApp.'
    case 'general':
    default:
      return "Hi Golf Sol Ireland — I'd like a quote for a Costa del Sol golf trip."
  }
}

export function getSmartWhatsappUrl(template: SmartWhatsappTemplate, context?: SmartWhatsappContext) {
  const text = encodeURIComponent(buildMessage(template, context))
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${text}`
}

export function getSmartWhatsappUrlForPath(pathname: string, search = '') {
  const normalisedPath = pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(search)

  if (normalisedPath === '/services/transport') {
    return getSmartWhatsappUrl('transport-quick', {
      from: searchParams.get('from') ?? 'Málaga Airport',
      to: searchParams.get('to') ?? 'your resort or golf course',
      passengers: parsePositiveInt(searchParams.get('passengers'), 4)
    })
  }

  if (normalisedPath === '/golf-sol') {
    return getSmartWhatsappUrl('packages-build', {
      groupSize: parsePositiveInt(searchParams.get('groupSize'), 4),
      nights: parsePositiveInt(searchParams.get('nights'), 4),
      rounds: parsePositiveInt(searchParams.get('rounds'), 3),
      transferStyle: searchParams.get('transfer') ?? 'private',
      travelDates: searchParams.get('travelDates') ?? 'flexible',
      note: 'Sent from the Golf Sol package planner page'
    })
  }

  if (normalisedPath.includes('faq') || normalisedPath.includes('terms') || normalisedPath.includes('privacy')) {
    return getSmartWhatsappUrl('support')
  }

  return getSmartWhatsappUrl('general')
}
