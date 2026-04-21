import { contactInfo } from './copy'

export type SmartEnquiryIntent =
  | 'trip-planning'
  | 'transport'
  | 'courses'
  | 'accommodation'
  | 'club-rental'
  | 'family-holiday'
  | 'booking-support'
  | 'legal'
  | 'newsletter'
  | 'testimonial'
  | 'support'

export interface SmartEnquiryDetails {
  readonly sourceLabel?: string
  readonly dates?: string
  readonly groupSize?: string
  readonly notes?: string
  readonly from?: string
  readonly to?: string
  readonly passengers?: number | string
  readonly timing?: string
}

export interface SmartEnquiryPayload extends SmartEnquiryDetails {
  readonly intent: SmartEnquiryIntent
}

interface SmartEnquiryMeta {
  readonly title: string
  readonly whatsappLabel: string
  readonly fabLabel: string
  readonly helperText: string
}

const WHATSAPP_NUMBER = contactInfo.phoneTel.replace(/\D/g, '')
const DEFAULT_PLACEHOLDER = 'Please advise'

const smartEnquiryMeta: Record<SmartEnquiryIntent, SmartEnquiryMeta> = {
  'trip-planning': {
    title: 'Trip planning',
    whatsappLabel: 'WhatsApp your trip brief',
    fabLabel: 'Chat about your trip',
    helperText: 'We prefill trip-planning prompts so visitors can tweak dates, group size, and priorities in seconds.'
  },
  transport: {
    title: 'Transport',
    whatsappLabel: 'WhatsApp this transfer',
    fabLabel: 'Chat about transport',
    helperText: 'We prefill route, passenger count, and timing so the chat starts with a proper transport brief.'
  },
  courses: {
    title: 'Courses',
    whatsappLabel: 'WhatsApp for tee times',
    fabLabel: 'Chat about tee times',
    helperText: 'We open WhatsApp with the right tee-time prompts already in place for dates, group size, and preferred area.'
  },
  accommodation: {
    title: 'Accommodation',
    whatsappLabel: 'WhatsApp hotel brief',
    fabLabel: 'Chat about accommodation',
    helperText: 'The draft message asks for dates, group size, and hotel style so you get a more useful first reply.'
  },
  'club-rental': {
    title: 'Club rental',
    whatsappLabel: 'WhatsApp about rentals',
    fabLabel: 'Chat about club rental',
    helperText: 'A rental-ready brief asks for dates, number of sets, and any handedness or player-profile details.'
  },
  'family-holiday': {
    title: 'Family holidays',
    whatsappLabel: 'WhatsApp family trip',
    fabLabel: 'Chat about family holidays',
    helperText: 'The message prompts for dates, traveller mix, and whether golf, hotel, or transfers matter most.'
  },
  'booking-support': {
    title: 'Booking support',
    whatsappLabel: 'WhatsApp booking help',
    fabLabel: 'Chat about booking',
    helperText: 'We prefill the booking context so visitors can quickly explain what is already booked and what still needs help.'
  },
  legal: {
    title: 'Legal questions',
    whatsappLabel: 'WhatsApp your question',
    fabLabel: 'Chat about terms',
    helperText: 'The draft opens with the legal topic so the team can answer without the visitor typing everything from scratch.'
  },
  newsletter: {
    title: 'Updates',
    whatsappLabel: 'WhatsApp for updates',
    fabLabel: 'Chat about updates',
    helperText: 'Visitors can request the type of updates they actually want instead of sending a blank message.'
  },
  testimonial: {
    title: 'Testimonials',
    whatsappLabel: 'WhatsApp feedback',
    fabLabel: 'Chat about feedback',
    helperText: 'The prompt nudges guests to share the trip type and a short summary so feedback is easier to send.'
  },
  support: {
    title: 'Support',
    whatsappLabel: 'WhatsApp your question',
    fabLabel: 'Chat for support',
    helperText: 'The chat opens with a page-aware support prompt so the visitor can get straight to the question.'
  }
}

function normalisePath(pathname: string): string {
  const path = pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

function cleanValue(value: string | number | undefined): string | null {
  if (typeof value === 'number') {
    return `${value}`
  }

  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function line(label: string, value: string | number | undefined, fallback = DEFAULT_PLACEHOLDER): string {
  return `${label}: ${cleanValue(value) ?? fallback}`
}

function formatPassengers(passengers: string | number | undefined): string {
  if (typeof passengers === 'number') {
    return `${passengers} ${passengers === 1 ? 'person' : 'people'}`
  }

  const value = cleanValue(passengers)
  if (!value) return DEFAULT_PLACEHOLDER

  const digits = Number.parseInt(value, 10)
  if (Number.isFinite(digits) && `${digits}` === value) {
    return `${digits} ${digits === 1 ? 'person' : 'people'}`
  }

  return value
}

function maybeSourceLine(sourceLabel: string | undefined): string | null {
  const source = cleanValue(sourceLabel)
  return source ? `Page: ${source}` : null
}

export function getSmartEnquiryMeta(intent: SmartEnquiryIntent): SmartEnquiryMeta {
  return smartEnquiryMeta[intent]
}

export function resolveSmartEnquiryIntent(pathname: string): SmartEnquiryIntent {
  const path = normalisePath(pathname).toLowerCase()

  if (path === '/' || path === '/golf-sol') {
    return 'trip-planning'
  }

  if (
    path === '/services/transport' ||
    path === '/transport' ||
    path.includes('transport') ||
    path.includes('malaga') ||
    path.includes('travelling-to-spain')
  ) {
    return 'transport'
  }

  if (path.includes('golf-club-rental')) {
    return 'club-rental'
  }

  if (path.includes('family-holidays')) {
    return 'family-holiday'
  }

  if (
    path === '/golf-courses' ||
    path === '/golf-map' ||
    path === '/promo-maps' ||
    path.includes('tee-time') ||
    path.includes('dress-code')
  ) {
    return 'courses'
  }

  if (path === '/accommodation' || path.includes('hotel')) {
    return 'accommodation'
  }

  if (path.includes('privacy') || path.includes('terms')) {
    return 'legal'
  }

  if (path.includes('newsletter') || path === '/news') {
    return 'newsletter'
  }

  if (path.includes('testimonial')) {
    return 'testimonial'
  }

  if (path === '/faq') {
    return 'support'
  }

  if (
    path === '/contact' ||
    path === '/contact/golf-holiday-enquiry-form' ||
    path.includes('booking') ||
    path.includes('incentive-packages') ||
    path.includes('society-group-trips')
  ) {
    return 'booking-support'
  }

  return 'trip-planning'
}

export function buildSmartWhatsAppMessage({
  intent,
  sourceLabel,
  dates,
  groupSize,
  notes,
  from,
  to,
  passengers,
  timing
}: SmartEnquiryPayload): string {
  const source = maybeSourceLine(sourceLabel)

  const lines = (() => {
    switch (intent) {
      case 'transport':
        return [
          "Hi GolfSol Ireland - I'm enquiring about transport.",
          line('From', from),
          line('To', to),
          `Passengers: ${formatPassengers(passengers)}`,
          line('Collection time', timing),
          `Notes: ${cleanValue(notes) ?? 'Golf bags travelling with us'}`,
          source
        ]
      case 'courses':
        return [
          "Hi GolfSol Ireland - I'm looking for Costa del Sol tee-time options.",
          line('Travel dates', dates),
          line('Group size', groupSize),
          `Preferred courses / area: ${cleanValue(notes) ?? DEFAULT_PLACEHOLDER}`,
          source
        ]
      case 'accommodation':
        return [
          "Hi GolfSol Ireland - I'm looking for accommodation options for our golf trip.",
          line('Travel dates', dates),
          line('Group size', groupSize),
          `Preferred base / budget: ${cleanValue(notes) ?? DEFAULT_PLACEHOLDER}`,
          source
        ]
      case 'club-rental':
        return [
          "Hi GolfSol Ireland - I'm enquiring about golf club rental.",
          line('Travel dates', dates),
          line('Sets needed', groupSize),
          `Player notes: ${cleanValue(notes) ?? 'Any handedness or player-profile details to follow'}`,
          source
        ]
      case 'family-holiday':
        return [
          "Hi GolfSol Ireland - I'm looking at a family golf holiday.",
          line('Travel dates', dates),
          line('Traveller count', groupSize),
          `What matters most: ${cleanValue(notes) ?? 'Hotel, golf, and transfers'}`,
          source
        ]
      case 'booking-support':
        return [
          "Hi GolfSol Ireland - I'd like help finalising a Costa del Sol golf trip.",
          line('Travel dates', dates),
          line('Group size', groupSize),
          `Already booked: ${cleanValue(notes) ?? DEFAULT_PLACEHOLDER}`,
          source
        ]
      case 'legal':
        return [
          'Hi GolfSol Ireland - I have a question about your legal information.',
          `Question: ${cleanValue(notes) ?? DEFAULT_PLACEHOLDER}`,
          source
        ]
      case 'newsletter':
        return [
          'Hi GolfSol Ireland - I would like Costa del Sol golf travel updates.',
          `Topics: ${cleanValue(notes) ?? 'Course updates and planning tips'}`,
          source
        ]
      case 'testimonial':
        return [
          'Hi GolfSol Ireland - I would like to share feedback from our trip.',
          `Trip summary: ${cleanValue(notes) ?? DEFAULT_PLACEHOLDER}`,
          source
        ]
      case 'support':
        return [
          'Hi GolfSol Ireland - I have a question after browsing your site.',
          `Question: ${cleanValue(notes) ?? DEFAULT_PLACEHOLDER}`,
          source
        ]
      case 'trip-planning':
      default:
        return [
          "Hi GolfSol Ireland - I'd love help planning a Costa del Sol golf trip.",
          line('Travel dates', dates),
          line('Group size', groupSize),
          `Need help with: ${cleanValue(notes) ?? 'Golf, accommodation, and transfers'}`,
          source
        ]
    }
  })()

  return lines.filter(Boolean).join('\n')
}

export function buildSmartWhatsAppUrl(payload: SmartEnquiryPayload): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildSmartWhatsAppMessage(payload))}`
}
