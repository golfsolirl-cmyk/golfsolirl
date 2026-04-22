import { contactInfo } from './data/copy'
import type { GeContentPageData } from './data/content-pages'

export interface ContentFormFieldOption {
  readonly label: string
  readonly value: string
}

export interface ContentFormField {
  readonly id: string
  readonly label: string
  readonly type?: 'text' | 'select' | 'textarea'
  readonly placeholder?: string
  readonly required?: boolean
  readonly autoComplete?: string
  readonly options?: readonly ContentFormFieldOption[]
  readonly rows?: number
}

export interface ContentFormConfig {
  readonly badge: string
  readonly submitLabel: string
  readonly successTitle: string
  readonly successBody: string
  readonly fields: readonly ContentFormField[]
}

export interface ContentSmartAction {
  readonly kind: 'form' | 'whatsapp' | 'call' | 'email'
  readonly label: string
  readonly description: string
  readonly href: string
  readonly tone: 'gold' | 'dark' | 'light'
  readonly external?: boolean
}

export interface ContentHeroMedia {
  readonly image: string
  readonly alt: string
  readonly stripeLabel: string
}

type ContentPageKind =
  | 'rental'
  | 'courses'
  | 'accommodation'
  | 'family'
  | 'transport'
  | 'booking'
  | 'legal'
  | 'newsletter'
  | 'testimonial'
  | 'about'
  | 'news'
  | 'support'

const WHATSAPP_NUMBER = contactInfo.phoneTel.replace(/[^0-9]/g, '')

function toTitleCase(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => {
      if (part.toLowerCase() === 'agp') return 'AGP'
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

function buildWhatsAppHref(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function buildMailToHref(subject: string) {
  return `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}`
}

function inferPageKind(path: string, page: GeContentPageData): ContentPageKind {
  const haystack = `${path} ${page.title} ${page.interestPreset}`.toLowerCase()

  if (page.enquiryType === 'legal') return 'legal'
  if (page.enquiryType === 'newsletter') return 'newsletter'
  if (page.enquiryType === 'testimonial') return 'testimonial'
  if (haystack.includes('golf-club-rental') || /\brental\b/.test(haystack)) return 'rental'
  if (haystack.includes('family')) return 'family'
  if (haystack.includes('tee-time') || haystack.includes('golf-courses') || haystack.includes('course')) return 'courses'
  if (haystack.includes('transport') || haystack.includes('airport') || haystack.includes('malaga')) return 'transport'
  if (haystack.includes('accommodation') || haystack.includes('hotel')) return 'accommodation'
  if (haystack.includes('booking') || haystack.includes('quote')) return 'booking'
  if (haystack.includes('about')) return 'about'
  if (haystack.includes('news')) return 'news'
  return 'support'
}

export function formatContentPageRouteLabel(path: string) {
  const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  const leaf =
    parts.length > 1 && ['golf-courses', 'accommodation', 'services', 'guides', 'links-and-information', 'contact'].includes(parts[0])
      ? parts[parts.length - 1]
      : parts[0] ?? 'golfsol-ireland'

  return toTitleCase(leaf)
}

export function getContentPageHeroMedia(path: string, page: GeContentPageData): ContentHeroMedia {
  const kind = inferPageKind(path, page)
  const stripeLabel = formatContentPageRouteLabel(path)

  switch (kind) {
    case 'rental':
      return {
        image: '/images/ge-premium-golf-club-rental-hero.png',
        alt: 'Premium golf club rental display — polished irons and driver in a luxury Costa del Sol golf travel setting, warm golden light.',
        stripeLabel
      }
    case 'courses':
      return {
        image: '/images/ge-premium-golf-fairway-coastal.png',
        alt: 'Championship Costa del Sol fairway toward the Mediterranean — emerald grass, bunkers, and coastal haze at sunrise.',
        stripeLabel
      }
    case 'accommodation':
      return {
        image: '/images/ge-premium-resort-hotel-hero.png',
        alt: 'Boutique resort pool terrace at dusk on the Costa del Sol — luxury stay for Irish golf groups.',
        stripeLabel
      }
    case 'family':
      return {
        image: '/images/ge-premium-family-golf-vacation.png',
        alt: 'Family-friendly resort with golf bags and pool — relaxed Costa del Sol golf holiday pacing.',
        stripeLabel
      }
    case 'transport':
      return {
        image: '/images/transport-hero-coastal-drive.jpg',
        alt: 'Golf Sol Ireland transfer vehicle on a Costa del Sol route.',
        stripeLabel
      }
    case 'booking':
      return {
        image: '/images/transport-fleet-lineup.jpg',
        alt: 'Golf Sol Ireland transfer fleet and booking support service.',
        stripeLabel
      }
    case 'testimonial':
      return {
        image: '/images/ge-premium-golf-group-testimonial.png',
        alt: 'Irish golf society toasting a successful round on a sunny Costa del Sol terrace overlooking fairways.',
        stripeLabel
      }
    case 'news':
    case 'newsletter':
      return {
        image: '/images/ge-premium-editorial-travel-news.png',
        alt: 'Editorial flat lay — passport, tee sheet, and luxury travel notes for Costa del Sol golf trip planning.',
        stripeLabel
      }
    case 'about':
      return {
        image: '/images/about-golfsol-hero.jpg',
        alt: 'Golf Sol Ireland brand and Costa del Sol destination imagery.',
        stripeLabel
      }
    case 'legal':
      return {
        image: '/images/ge-premium-trust-legal-hero.png',
        alt: 'Elegant desk with signed documents and soft light — trusted legal and privacy context for Golf Sol Ireland.',
        stripeLabel
      }
    case 'support':
    default:
      return {
        image: page.heroImage,
        alt: page.heroAlt,
        stripeLabel
      }
  }
}

/** Imagery for the dark “route story” cards — cycles premium art + fleet photography. */
export function getContentStorySectionMedia(
  path: string,
  page: GeContentPageData,
  index: number
): { readonly image: string; readonly alt: string } {
  const hero = getContentPageHeroMedia(path, page)
  const pool = [
    { image: hero.image, alt: hero.alt },
    {
      image: '/images/transport-moment-arrivals.jpg',
      alt: 'Málaga airport arrivals hall with golf travel bags coordinated by a chauffeur.'
    },
    {
      image: '/images/transport-moment-resort.jpg',
      alt: 'Luxury Costa del Sol resort entrance with golf luggage and transfer vehicle.'
    },
    {
      image: '/images/transport-fleet-lineup.jpg',
      alt: 'Mercedes transfer fleet ready for Irish golf groups on the Costa del Sol.'
    },
    {
      image: '/images/transport-hero-coastal-drive.jpg',
      alt: 'Coastal motorway drive at golden hour — route between golf courses and your base.'
    }
  ] as const
  const slot = (index + path.replace(/\//g, '').length) % pool.length
  return pool[slot]!
}

export function getContentPageFormConfig(path: string, page: GeContentPageData): ContentFormConfig {
  const kind = inferPageKind(path, page)

  switch (kind) {
    case 'rental':
      return {
        badge: 'Rental brief',
        submitLabel: 'Request rental options',
        successTitle: 'Rental brief received',
        successBody: 'We will come back with suitable set options, timing, and next steps.',
        fields: [
          { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. 15–19 Sept 2026', required: true },
          {
            id: 'playerCount',
            label: 'How many sets do you need?',
            type: 'select',
            required: true,
            options: [
              { label: '1 set', value: '1 set' },
              { label: '2–4 sets', value: '2–4 sets' },
              { label: '5–8 sets', value: '5–8 sets' },
              { label: '9+ sets', value: '9+ sets' }
            ]
          },
          {
            id: 'setTier',
            label: 'Preferred set tier',
            type: 'select',
            options: [
              { label: 'Standard sets', value: 'Standard sets' },
              { label: 'Premium sets', value: 'Premium sets' },
              { label: 'Need advice', value: 'Need advice' }
            ]
          },
          {
            id: 'handedness',
            label: 'Any handedness note?',
            type: 'select',
            options: [
              { label: 'Mostly right-handed', value: 'Mostly right-handed' },
              { label: 'Need left-handed sets too', value: 'Need left-handed sets too' },
              { label: 'Ladies sets required', value: 'Ladies sets required' },
              { label: 'Mixed requirements', value: 'Mixed requirements' }
            ]
          },
          {
            id: 'notes',
            label: 'Rental details',
            type: 'textarea',
            placeholder: 'Tell us hotel, handicap range, or anything else that matters.',
            rows: 5
          }
        ]
      }
    case 'courses':
      return {
        badge: 'Course brief',
        submitLabel: 'Get course advice',
        successTitle: 'Course brief received',
        successBody: 'We will come back with a smarter shortlist for your group and dates.',
        fields: [
          { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. 15–19 Sept 2026', required: true },
          {
            id: 'groupSize',
            label: 'Group size',
            type: 'select',
            required: true,
            options: [
              { label: '2 golfers', value: '2 golfers' },
              { label: '4 golfers', value: '4 golfers' },
              { label: '8 golfers', value: '8 golfers' },
              { label: '12+ golfers', value: '12+ golfers' }
            ]
          },
          {
            id: 'preferredArea',
            label: 'Preferred area',
            type: 'select',
            options: [
              { label: 'Sotogrande', value: 'Sotogrande' },
              { label: 'Marbella Golf Valley', value: 'Marbella Golf Valley' },
              { label: 'Mijas / Fuengirola', value: 'Mijas / Fuengirola' },
              { label: 'Need advice', value: 'Need advice' }
            ]
          },
          {
            id: 'handicapMix',
            label: 'Handicap mix',
            type: 'select',
            options: [
              { label: 'Mostly single-digit to 15', value: 'Mostly single-digit to 15' },
              { label: 'Mixed 10 to 24', value: 'Mixed 10 to 24' },
              { label: 'Casual social golfers', value: 'Casual social golfers' },
              { label: 'Need help choosing challenge level', value: 'Need help choosing challenge level' }
            ]
          },
          {
            id: 'notes',
            label: 'Round brief',
            type: 'textarea',
            placeholder: 'Tell us where you are staying, pace preferences, or must-play courses.',
            rows: 5
          }
        ]
      }
    case 'accommodation':
      return {
        badge: 'Stay brief',
        submitLabel: 'Get hotel options',
        successTitle: 'Stay brief received',
        successBody: 'We will return accommodation options that fit the trip and the group.',
        fields: [
          { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. 15–19 Sept 2026', required: true },
          {
            id: 'groupSize',
            label: 'Group size',
            type: 'select',
            required: true,
            options: [
              { label: '2 golfers', value: '2 golfers' },
              { label: '4 golfers', value: '4 golfers' },
              { label: '8 golfers', value: '8 golfers' },
              { label: '12+ golfers', value: '12+ golfers' }
            ]
          },
          {
            id: 'preferredBase',
            label: 'Preferred base',
            type: 'select',
            options: [
              { label: 'Fuengirola', value: 'Fuengirola' },
              { label: 'Torremolinos', value: 'Torremolinos' },
              { label: 'Marbella', value: 'Marbella' },
              { label: 'Need advice', value: 'Need advice' }
            ]
          },
          {
            id: 'stayLevel',
            label: 'Stay level',
            type: 'select',
            options: [
              { label: '3-star value', value: '3-star value' },
              { label: '4-star comfort', value: '4-star comfort' },
              { label: '5-star premium', value: '5-star premium' },
              { label: 'Open to options', value: 'Open to options' }
            ]
          },
          {
            id: 'notes',
            label: 'Stay details',
            type: 'textarea',
            placeholder: 'Tell us if nightlife, quiet rooms, twin rooms, or location matters most.',
            rows: 5
          }
        ]
      }
    case 'family':
      return {
        badge: 'Family brief',
        submitLabel: 'Plan family trip',
        successTitle: 'Family brief received',
        successBody: 'We will shape a calmer, better-paced family golf plan for your dates.',
        fields: [
          { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. Easter 2027', required: true },
          {
            id: 'travellers',
            label: 'Who is travelling?',
            type: 'select',
            required: true,
            options: [
              { label: '2 adults', value: '2 adults' },
              { label: 'Adults and children', value: 'Adults and children' },
              { label: 'Two families together', value: 'Two families together' },
              { label: 'Need advice', value: 'Need advice' }
            ]
          },
          {
            id: 'preferredBase',
            label: 'Preferred base',
            type: 'select',
            options: [
              { label: 'Beach resort feel', value: 'Beach resort feel' },
              { label: 'Town base with restaurants', value: 'Town base with restaurants' },
              { label: 'Quiet premium hotel', value: 'Quiet premium hotel' },
              { label: 'Open to ideas', value: 'Open to ideas' }
            ]
          },
          {
            id: 'notes',
            label: 'Family trip details',
            type: 'textarea',
            placeholder: 'Tell us how much golf, downtime, and child-friendly structure you need.',
            rows: 5
          }
        ]
      }
    case 'transport':
      return {
        badge: 'Transfer brief',
        submitLabel: 'Get transfer plan',
        successTitle: 'Transfer brief received',
        successBody: 'We will come back with a practical route and vehicle plan.',
        fields: [
          { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. 15–19 Sept 2026', required: true },
          {
            id: 'passengerCount',
            label: 'Passenger count',
            type: 'select',
            required: true,
            options: [
              { label: '1–4 travellers', value: '1–4 travellers' },
              { label: '5–8 travellers', value: '5–8 travellers' },
              { label: '9–12 travellers', value: '9–12 travellers' },
              { label: '12+ travellers', value: '12+ travellers' }
            ]
          },
          { id: 'routeBrief', label: 'Route or base', placeholder: 'e.g. Málaga Airport to Fuengirola', required: true },
          {
            id: 'bags',
            label: 'Golf bags and luggage',
            type: 'select',
            options: [
              { label: 'Everyone has golf bags', value: 'Everyone has golf bags' },
              { label: 'Some golfers, some non-golfers', value: 'Some golfers, some non-golfers' },
              { label: 'Mostly hand luggage only', value: 'Mostly hand luggage only' }
            ]
          },
          {
            id: 'notes',
            label: 'Transfer details',
            type: 'textarea',
            placeholder: 'Tell us airport, hotel, tee times, or anything that affects routing.',
            rows: 5
          }
        ]
      }
    case 'legal':
      return {
        badge: 'Legal question',
        submitLabel: 'Send question',
        successTitle: 'Question received',
        successBody: 'We will clarify the policy point directly and in plain language.',
        fields: [
          {
            id: 'topic',
            label: 'Topic',
            type: 'select',
            required: true,
            options: [
              { label: 'Privacy policy', value: 'Privacy policy' },
              { label: 'Terms and conditions', value: 'Terms and conditions' },
              { label: 'Data removal request', value: 'Data removal request' },
              { label: 'Consent and communications', value: 'Consent and communications' }
            ]
          },
          {
            id: 'notes',
            label: 'Question details',
            type: 'textarea',
            placeholder: 'Tell us what you need clarified and we will reply directly.',
            required: true,
            rows: 5
          }
        ]
      }
    case 'newsletter':
    case 'news':
      return {
        badge: 'Update request',
        submitLabel: 'Request updates',
        successTitle: 'Update request received',
        successBody: 'We will tailor the right Golf Sol Ireland updates for you.',
        fields: [
          {
            id: 'updateType',
            label: 'What do you want updates on?',
            type: 'select',
            required: true,
            options: [
              { label: 'Course updates', value: 'Course updates' },
              { label: 'Planning tips', value: 'Planning tips' },
              { label: 'Hotel and transfer updates', value: 'Hotel and transfer updates' },
              { label: 'All relevant updates', value: 'All relevant updates' }
            ]
          },
          { id: 'travelMonth', label: 'Planned travel month (optional)', placeholder: 'e.g. October 2026' },
          {
            id: 'notes',
            label: 'Anything specific you want?',
            type: 'textarea',
            placeholder: 'Tell us what kind of updates would actually help you.',
            rows: 5
          }
        ]
      }
    case 'testimonial':
      return {
        badge: 'Trip feedback',
        submitLabel: 'Send feedback',
        successTitle: 'Feedback received',
        successBody: 'Thanks — we appreciate the insight and will review it shortly.',
        fields: [
          {
            id: 'tripType',
            label: 'Trip type',
            type: 'select',
            required: true,
            options: [
              { label: 'Golf group', value: 'Golf group' },
              { label: 'Society trip', value: 'Society trip' },
              { label: 'Family holiday', value: 'Family holiday' },
              { label: 'Corporate trip', value: 'Corporate trip' }
            ]
          },
          { id: 'travelMonth', label: 'Travel month (optional)', placeholder: 'e.g. March 2026' },
          {
            id: 'notes',
            label: 'Testimonial details',
            type: 'textarea',
            placeholder: 'Share the highlights from your trip and what worked best.',
            required: true,
            rows: 5
          }
        ]
      }
    case 'about':
    case 'support':
      return {
        badge: 'Quick question',
        submitLabel: 'Send request',
        successTitle: 'Request received',
        successBody: 'Thanks — we will come back with a sensible next step shortly.',
        fields: [
          {
            id: 'questionType',
            label: 'Question category',
            type: 'select',
            required: true,
            options: [
              { label: 'General question', value: 'General question' },
              { label: 'Planning support', value: 'Planning support' },
              { label: 'Payments and process', value: 'Payments and process' },
              { label: 'Need a callback', value: 'Need a callback' }
            ]
          },
          { id: 'travelDates', label: 'Travel dates (optional)', placeholder: 'e.g. 15–19 Sept 2026' },
          {
            id: 'notes',
            label: 'Question details',
            type: 'textarea',
            placeholder: 'Tell us what you need and we will point you in the right direction.',
            rows: 5
          }
        ]
      }
    case 'booking':
    default:
      return {
        badge: 'Trip brief',
        submitLabel: 'Start my quote',
        successTitle: 'Trip brief received',
        successBody: 'We will come back with a clear next step for your group.',
        fields: [
          { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. 15–19 Sept 2026', required: true },
          {
            id: 'groupSize',
            label: 'Group size',
            type: 'select',
            required: true,
            options: [
              { label: '2 golfers', value: '2 golfers' },
              { label: '4 golfers', value: '4 golfers' },
              { label: '8 golfers', value: '8 golfers' },
              { label: '12+ golfers', value: '12+ golfers' }
            ]
          },
          {
            id: 'basePreference',
            label: 'Preferred base',
            type: 'select',
            options: [
              { label: 'Fuengirola', value: 'Fuengirola' },
              { label: 'Torremolinos', value: 'Torremolinos' },
              { label: 'Marbella', value: 'Marbella' },
              { label: 'Sotogrande', value: 'Sotogrande' },
              { label: 'Need advice', value: 'Need advice' }
            ]
          },
          {
            id: 'notes',
            label: 'Trip brief',
            type: 'textarea',
            placeholder: 'Tell us what kind of week, hotel level, or golf rhythm you have in mind.',
            rows: 5
          }
        ]
      }
  }
}

export function getContentPageSmartActions(path: string, page: GeContentPageData): readonly ContentSmartAction[] {
  const kind = inferPageKind(path, page)
  const routeLabel = formatContentPageRouteLabel(path)
  const genericWhatsApp = `Hi GolfSol Ireland — I'm on the ${routeLabel} page and I want help with this trip.`

  switch (kind) {
    case 'rental':
      return [
        {
          kind: 'form',
          label: 'Check rental sets',
          description: 'Tell us dates, set count, and handedness in one quick brief.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'WhatsApp about club rental',
          description: 'Ask about premium sets, left-handed options, or delivery timing.',
          href: buildWhatsAppHref(
            "Hi GolfSol Ireland — I'm looking at golf club rental and want to check rental set options for our trip."
          ),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Call the Irish team',
          description: 'Best if you want a fast answer on availability or group fit.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'courses':
      return [
        {
          kind: 'form',
          label: 'Build a course shortlist',
          description: 'Route your week around the right challenge level and travel times.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'Ask about course mix',
          description: 'Get quick advice on clusters, pace, and group-friendly rounds.',
          href: buildWhatsAppHref(
            `Hi GolfSol Ireland — I'm on the ${routeLabel} page and want a quick steer on the right course mix for our group.`
          ),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Talk through the route',
          description: 'Useful if you want to compare Marbella, Mijas, or Sotogrande quickly.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'accommodation':
      return [
        {
          kind: 'form',
          label: 'Match our hotel base',
          description: 'Tell us dates, group size, and preferred area for a smarter stay fit.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'Ask about hotel options',
          description: 'Quick WhatsApp advice on stay level, location, and Irish-group fit.',
          href: buildWhatsAppHref(
            `Hi GolfSol Ireland — I'm on the ${routeLabel} page and want help choosing the right hotel base for our trip.`
          ),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Call about accommodation',
          description: 'Ideal if you want to compare Fuengirola, Torremolinos, or Marbella fast.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'family':
      return [
        {
          kind: 'form',
          label: 'Plan the family week',
          description: 'Build a calmer mix of golf time, downtime, and the right base.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'Ask about family-friendly stays',
          description: 'Quick help on resorts, pacing, and non-golfer-friendly options.',
          href: buildWhatsAppHref(
            'Hi GolfSol Ireland — I want help planning a family golf holiday on the Costa del Sol.'
          ),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Talk through family fit',
          description: 'Best for parents who want a quick steer before filling in a longer brief.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'transport':
      return [
        {
          kind: 'form',
          label: 'Plan our transfers',
          description: 'Share airport, base, and bag load so we can map the week cleanly.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'WhatsApp transfer questions',
          description: 'Best for quick questions on vehicle size, routing, or bag logistics.',
          href: buildWhatsAppHref(
            `Hi GolfSol Ireland — I'm on the ${routeLabel} page and want help with transfer planning for our group.`
          ),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Call about transfer timing',
          description: 'Useful if flights, golf, and hotel timings need a fast answer.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'legal':
      return [
        {
          kind: 'form',
          label: 'Ask the policy question',
          description: 'Send the exact clause or concern you want clarified.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'email',
          label: 'Email the team directly',
          description: 'Useful if you want to keep a written record of the question.',
          href: buildMailToHref(`${routeLabel} question`),
          tone: 'dark'
        },
        {
          kind: 'call',
          label: 'Call for plain-English clarity',
          description: 'If you would rather talk it through than decode a long paragraph.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'newsletter':
    case 'news':
      return [
        {
          kind: 'form',
          label: 'Tell us what updates matter',
          description: 'Keep it relevant: routes, hotels, course timing, or planning tips.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'email',
          label: 'Email the update request',
          description: 'Ask for the specific planning insights you actually want.',
          href: buildMailToHref(`${routeLabel} update request`),
          tone: 'dark'
        },
        {
          kind: 'whatsapp',
          label: 'WhatsApp a quick question',
          description: 'Best when you just need a quick answer on timing or relevance.',
          href: buildWhatsAppHref(genericWhatsApp),
          tone: 'light',
          external: true
        }
      ]
    case 'testimonial':
      return [
        {
          kind: 'form',
          label: 'Share trip feedback',
          description: 'Tell us what worked well so the next organiser benefits too.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'email',
          label: 'Email your testimonial',
          description: 'Useful if you already have a written note or quote ready to send.',
          href: buildMailToHref('GolfSol Ireland testimonial'),
          tone: 'dark'
        },
        {
          kind: 'call',
          label: 'Talk to the team',
          description: 'If you want to give feedback or ask about a future trip in one call.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'about':
    case 'support':
      return [
        {
          kind: 'form',
          label: 'Ask a direct question',
          description: 'Send a focused brief and we will reply with the right next step.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'WhatsApp the team',
          description: 'Best for quick contact before you commit to a full enquiry.',
          href: buildWhatsAppHref(genericWhatsApp),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Call GolfSol Ireland',
          description: 'Speak directly with the Irish team about your trip or question.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
    case 'booking':
    default:
      return [
        {
          kind: 'form',
          label: 'Start my quote',
          description: 'Build a quick trip brief and let us shape the cleanest next step.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'WhatsApp about this page',
          description: 'Fastest way to ask if this route or service fits your group.',
          href: buildWhatsAppHref(genericWhatsApp),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Call for a quick steer',
          description: 'Useful if you want to sanity-check the route before filling in details.',
          href: `tel:${contactInfo.phoneTel}`,
          tone: 'light'
        }
      ]
  }
}
