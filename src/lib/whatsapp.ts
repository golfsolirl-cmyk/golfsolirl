/**
 * GolfSol Ireland WhatsApp concierge.
 * One place to change the business number and the messages we prefill.
 * Links never include payment details, passwords, or sign-in tokens.
 */

/** Irish mobile 086 600 6202. wa.me needs the country code and no leading zero. */
export const WHATSAPP_NUMBER = '353866006202'
export const WHATSAPP_DISPLAY = '086 600 6202'

export const WHATSAPP_EVENT = 'whatsapp_contact_click'

export type WhatsAppEnquiryType = 'quote' | 'question' | 'booking_help' | 'contact' | 'package' | 'general'

export type WhatsAppComponentVariant = 'concierge' | 'contact' | 'booking' | 'floating'

export type WhatsAppClickContext = {
  readonly sourcePage: string
  readonly componentVariant: WhatsAppComponentVariant
  readonly enquiryType: WhatsAppEnquiryType
  readonly packageName?: string
}

export const WHATSAPP_MESSAGES = {
  quote:
    "Hi GolfSol Ireland, I'd like some information about organising a golf holiday in Spain. Could someone help me?",
  question: 'Hi GolfSol Ireland, I have a question about your golf holidays on the Costa del Sol.',
  booking_help: 'Hi GolfSol Ireland, I need some help with a golf holiday booking.',
  contact: "Hi GolfSol Ireland, I'd like to ask a question. Could someone help me?",
  general:
    "Hi GolfSol Ireland, I'd like some information about organising a golf holiday in Spain. Could someone help me?"
} as const

export type WhatsAppTripDetails = {
  readonly packageName?: string
  readonly travelDates?: string
  readonly golfers?: string
  readonly nights?: number
  readonly rounds?: number
  readonly bookingReference?: string
  readonly stay?: string
  readonly course?: string
}

const FIELD_LIMIT = 80

function cleanField(value: string | undefined): string | undefined {
  if (!value) return undefined
  const compact = value.replace(/\s+/g, ' ').replace(/[<>]/g, '').trim()
  if (!compact) return undefined
  return compact.slice(0, FIELD_LIMIT)
}

/** Public trip references only. Rejects anything that looks like a token. */
export function safeBookingReference(value: string | undefined): string | undefined {
  const trimmed = cleanField(value)
  if (!trimmed) return undefined
  if (!/^GSOL-[A-Z0-9-]{3,24}$/i.test(trimmed)) return undefined
  return trimmed.toUpperCase()
}

function boundedCount(value: number | undefined, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  if (value < 1 || value > max) return undefined
  return value
}

export function createWhatsAppLink(message: string): string {
  const text = message.replace(/\s+$/g, '').slice(0, 1200)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export function buildBookingHelpMessage(details: WhatsAppTripDetails = {}): string {
  const packageName = cleanField(details.packageName)
  const lines = [
    packageName
      ? `Hi GolfSol Ireland, I'm interested in your ${packageName}. Could you help me with availability and pricing?`
      : WHATSAPP_MESSAGES.booking_help
  ]

  const travelDates = cleanField(details.travelDates)
  const golfers = cleanField(details.golfers)
  const stay = cleanField(details.stay)
  const course = cleanField(details.course)
  const reference = safeBookingReference(details.bookingReference)
  const nights = boundedCount(details.nights, 21)
  const rounds = boundedCount(details.rounds, 14)

  if (travelDates) lines.push(`Travel dates: ${travelDates}`)
  if (golfers) lines.push(`Golfers: ${golfers}`)
  if (nights && rounds) lines.push(`Trip length: ${nights} nights and ${rounds} rounds`)
  else if (nights) lines.push(`Nights: ${nights}`)
  else if (rounds) lines.push(`Rounds: ${rounds}`)
  if (stay) lines.push(`Accommodation: ${stay}`)
  if (course) lines.push(`Course: ${course}`)
  if (reference) lines.push(`Booking reference: ${reference}`)

  return lines.join('\n')
}

export function nightsFromRoute(path: string): number | undefined {
  const match = path.match(/(\d+)-nights?\b/i)
  if (!match) return undefined
  return boundedCount(Number(match[1]), 21)
}

export function resolveWhatsAppPanel(path: string, enquiryType?: string): 'contact' | 'booking' | null {
  const normalised = path.replace(/\/+$/, '') || '/'
  if (normalised === '/contact' || normalised === '/contact/golf-holiday-enquiry-form') return 'contact'
  if (enquiryType === 'booking') return 'booking'
  if (normalised === '/packages' || normalised === '/package' || normalised === '/services/transport') return 'booking'
  return null
}

/** Safe click signal. The prefilled message is never included. */
export function trackWhatsAppClick(context: WhatsAppClickContext): void {
  if (typeof window === 'undefined') return
  const detail: WhatsAppClickContext = {
    sourcePage: context.sourcePage.slice(0, 160),
    componentVariant: context.componentVariant,
    enquiryType: context.enquiryType
  }
  const packageName = cleanField(context.packageName)
  window.dispatchEvent(
    new CustomEvent(WHATSAPP_EVENT, {
      detail: packageName ? { ...detail, packageName } : detail
    })
  )
}
