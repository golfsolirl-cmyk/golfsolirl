const WHATSAPP_TEXT_LIMIT = 1800

export type SmartWhatsAppIntent =
  | 'transport'
  | 'package'
  | 'booking'
  | 'support'
  | 'newsletter'
  | 'testimonial'
  | 'general'

export interface SmartWhatsAppContext {
  readonly intent: SmartWhatsAppIntent
  readonly sourcePage?: string
  readonly routeFrom?: string
  readonly routeTo?: string
  readonly passengers?: number | string
  readonly groupSize?: number | string
  readonly travelDates?: string
  readonly collectionTime?: string
  readonly nights?: number | string
  readonly rounds?: number | string
  readonly stayName?: string
  readonly transferName?: string
  readonly packageStyle?: string
  readonly topic?: string
  readonly notes?: string
}

export function formatSourcePage(pathname: string) {
  if (!pathname || pathname === '/') return 'Homepage'
  const cleaned = pathname.replace(/\/+$/, '').replace(/^\/+/, '')
  if (!cleaned) return 'Homepage'
  return cleaned
    .split('/')
    .map((segment) => segment.replace(/-/g, ' '))
    .join(' / ')
}

function normaliseValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function orQuestionMark(value: string | number | null | undefined) {
  const clean = normaliseValue(value)
  return clean || '?'
}

function clampWhatsAppText(message: string) {
  if (message.length <= WHATSAPP_TEXT_LIMIT) {
    return message
  }
  return `${message.slice(0, WHATSAPP_TEXT_LIMIT - 3)}...`
}

export function inferWhatsAppIntentFromPath(pathname: string): SmartWhatsAppIntent {
  const path = pathname.toLowerCase()
  if (path.includes('/transport')) return 'transport'
  if (path.includes('/package') || path.includes('/packages')) return 'package'
  if (path.includes('/newsletter')) return 'newsletter'
  if (path.includes('/testimonial')) return 'testimonial'
  if (path.includes('/faq') || path.includes('/terms') || path.includes('/privacy') || path.includes('/contact')) return 'support'
  if (path.includes('/booking') || path.includes('/courses') || path.includes('/accommodation')) return 'booking'
  return 'general'
}

export function buildSmartWhatsAppMessage(context: SmartWhatsAppContext) {
  const sourcePage = normaliseValue(context.sourcePage) || 'website'
  const notes = normaliseValue(context.notes)
  const topic = normaliseValue(context.topic)

  switch (context.intent) {
    case 'transport': {
      const lines = [
        'Hi Golf Sol Ireland,',
        '',
        'I am enquiring about transport.',
        `From: ${orQuestionMark(context.routeFrom)}`,
        `To: ${orQuestionMark(context.routeTo)}`,
        `Passengers: ${orQuestionMark(context.passengers)}`,
        `Collection time: ${orQuestionMark(context.collectionTime)}`,
        `Source page: ${sourcePage}`
      ]
      if (notes) lines.push(`Notes: ${notes}`)
      lines.push('', 'Can you send availability and price?')
      return lines.join('\n')
    }
    case 'package': {
      const lines = [
        'Hi Golf Sol Ireland,',
        '',
        'I would like a Costa del Sol package quote.',
        `Group size: ${orQuestionMark(context.groupSize)} golfer(s)`,
        `Trip shape: ${orQuestionMark(context.nights)} night(s) / ${orQuestionMark(context.rounds)} round(s)`,
        `Package style: ${orQuestionMark(context.packageStyle)}`,
        `Stay: ${orQuestionMark(context.stayName)}`,
        `Transfer: ${orQuestionMark(context.transferName)}`,
        `Travel dates: ${orQuestionMark(context.travelDates)}`,
        `Source page: ${sourcePage}`
      ]
      if (notes) lines.push(`Notes: ${notes}`)
      lines.push('', 'Please tailor the best options for us.')
      return lines.join('\n')
    }
    case 'newsletter':
      return `Hi Golf Sol Ireland,\n\nPlease keep me updated with Costa del Sol golf travel updates.\nSource page: ${sourcePage}`
    case 'testimonial':
      return `Hi Golf Sol Ireland,\n\nI would like to share a testimonial / feedback from our trip.\nSource page: ${sourcePage}`
    case 'support':
      return `Hi Golf Sol Ireland,\n\nI have a question about ${orQuestionMark(topic)}.\nSource page: ${sourcePage}\n\nCan you help me with this?`
    case 'booking':
      return `Hi Golf Sol Ireland,\n\nI would like help with a golf trip booking.\nTopic: ${orQuestionMark(topic)}\nTravel dates: ${orQuestionMark(context.travelDates)}\nGroup size: ${orQuestionMark(context.groupSize)}\nSource page: ${sourcePage}`
    case 'general':
    default:
      return `Hi Golf Sol Ireland,\n\nI would like more information about planning a Costa del Sol golf trip.\nSource page: ${sourcePage}`
  }
}

export function buildWhatsAppHref({
  message,
  baseHref,
  phoneNumber
}: {
  readonly message: string
  readonly baseHref?: string
  readonly phoneNumber?: string
}) {
  const text = clampWhatsAppText(message)

  if (baseHref) {
    try {
      const url = new URL(baseHref)
      url.searchParams.set('text', text)
      return url.toString()
    } catch {
      const separator = baseHref.includes('?') ? '&' : '?'
      return `${baseHref}${separator}text=${encodeURIComponent(text)}`
    }
  }

  const normalizedNumber = (phoneNumber ?? '').replace(/[^0-9]/g, '')
  if (normalizedNumber) {
    return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(text)}`
  }

  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function buildSmartWhatsAppHref({
  context,
  baseHref,
  phoneNumber
}: {
  readonly context: SmartWhatsAppContext
  readonly baseHref?: string
  readonly phoneNumber?: string
}) {
  return buildWhatsAppHref({
    baseHref,
    phoneNumber,
    message: buildSmartWhatsAppMessage(context)
  })
}
