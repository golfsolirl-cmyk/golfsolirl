import { SEO_LANDING_PAGE_PATHS } from '../../data/seo-landing-page-paths'
import { WHATSAPP_NUMBER } from '../../lib/whatsapp'
import { contactInfo } from './data/copy'
import type { GeContentPageData } from './data/content-pages'
import { leanEnquiryFormConfig } from './data/lean-enquiry-fields'

const SEO_LANDING_PATH_SET = new Set<string>(SEO_LANDING_PAGE_PATHS)

const PAGE_OWNED_HERO_PATHS = new Set<string>([
  ...SEO_LANDING_PAGE_PATHS,
  '/golf-courses/sotogrande',
  '/golf-courses/marbella-golf-valley',
  '/golf-courses/mijas-fuengirola'
])

export interface ContentFormFieldOption {
  readonly label: string
  readonly value: string
}

export interface ContentFormField {
  readonly id: string
  readonly label: string
  readonly type?: 'text' | 'select' | 'textarea' | 'date'
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
  /** When set, form posts to website testimonial API (live homepage) instead of enquiry. */
  readonly submissionKind?: 'enquiry' | 'testimonial'
}

export interface ContentSmartAction {
  readonly kind: 'form' | 'whatsapp' | 'call' | 'email'
  readonly label: string
  readonly description: string
  readonly href: string
  readonly tone: 'gold' | 'dark' | 'light'
  readonly external?: boolean
  /** Second voice line (Spain); primary {@link href} stays Irish. */
  readonly secondaryTelHref?: string
  readonly secondaryTelLabel?: string
}

export interface ContentHeroMedia {
  readonly image: string
  readonly alt: string
  readonly stripeLabel: string
}

type ContentPageKind =
  | 'twilight'
  | 'courses'
  | 'accommodation'
  | 'transport'
  | 'booking'
  | 'legal'
  | 'newsletter'
  | 'testimonial'
  | 'about'
  | 'news'
  | 'support'

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
  const pathLower = path.toLowerCase()

  if (pathLower.includes('twilight')) return 'twilight'

  if (page.enquiryType === 'legal') return 'legal'
  if (page.enquiryType === 'newsletter') return 'newsletter'
  if (page.enquiryType === 'testimonial') return 'testimonial'
  // Destination golf-holiday pages must not be classified as transport because of "malaga" in the path.
  if (pathLower.startsWith('/golf-holidays')) return 'support'
  if (haystack.includes('tee-time') || haystack.includes('golf-courses') || haystack.includes('course')) return 'courses'
  if (
    haystack.includes('transport') ||
    pathLower.includes('airport') ||
    pathLower.includes('/transfers/') ||
    (pathLower.includes('malaga') && !pathLower.includes('/golf-holidays/'))
  ) {
    return 'transport'
  }
  if (haystack.includes('accommodation') || haystack.includes('hotel')) return 'accommodation'
  if (haystack.includes('booking') || haystack.includes('quote')) return 'booking'
  if (haystack.includes('about')) return 'about'
  if (haystack.includes('news')) return 'news'
  return 'support'
}

export function formatContentPageRouteLabel(path: string) {
  const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  const leaf =
    parts.length > 1 &&
    ['golf-courses', 'golf-holidays', 'golf-packages', 'transfers', 'accommodation', 'services', 'guides', 'links-and-information', 'contact'].includes(
      parts[0]
    )
      ? parts[parts.length - 1]
      : parts[0] ?? 'golfsol-ireland'

  return toTitleCase(leaf)
}

export function getContentPageHeroMedia(path: string, page: GeContentPageData): ContentHeroMedia {
  const kind = inferPageKind(path, page)
  const stripeLabel = formatContentPageRouteLabel(path)

  // SEO landings + corridor pages declare topic-specific heroes — keep them (including OG alignment).
  if (PAGE_OWNED_HERO_PATHS.has(path)) {
    return {
      image: page.heroImage,
      alt: page.heroAlt,
      stripeLabel
    }
  }

  switch (kind) {
    case 'twilight':
      return {
        image: '/images/twilight-golf-hero.webp',
        alt: 'Costa del Sol golf fairway at twilight — golden-hour light over manicured fairways toward the Mediterranean.',
        stripeLabel
      }
    case 'courses':
      return {
        image: '/images/ge-premium-golf-fairway-coastal.webp',
        alt: 'Championship Costa del Sol fairway toward the Mediterranean — emerald grass, bunkers, and coastal haze at sunrise.',
        stripeLabel
      }
    case 'accommodation':
      return {
        image: '/images/ge-premium-resort-hotel-hero.webp',
        alt: 'Boutique resort pool terrace at dusk on the Costa del Sol — luxury stay for Irish golf groups.',
        stripeLabel
      }
    case 'transport':
      return {
        image: '/images/transport-hero-coastal-drive.webp',
        alt: 'Golf Sol Ireland transfer vehicle on a Costa del Sol route.',
        stripeLabel
      }
    case 'booking':
      return {
        image: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
        alt: 'GolfSol Ireland private transfers on the Costa del Sol — booking service.',
        stripeLabel
      }
    case 'testimonial':
      return {
        image: '/images/ge-premium-golf-group-testimonial.webp',
        alt: 'Irish golf society toasting a successful round on a sunny Costa del Sol terrace overlooking fairways.',
        stripeLabel
      }
    case 'news':
    case 'newsletter':
      return {
        image: '/images/ge-premium-editorial-travel-news.webp',
        alt: 'Editorial flat lay — passport, tee sheet, and luxury travel notes for Costa del Sol golf trip planning.',
        stripeLabel
      }
    case 'about':
      return {
        image: '/images/about-golfsol-hero.webp',
        alt: 'Golf Sol Ireland brand and Costa del Sol destination imagery.',
        stripeLabel
      }
    case 'legal':
      return {
        image: '/images/ge-premium-trust-legal-hero.webp',
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
      image: '/images/transport-moment-arrivals.webp',
      alt: 'Málaga airport arrivals hall with golf travel bags coordinated by a chauffeur.'
    },
    {
      image: '/images/transport-moment-resort.webp',
      alt: 'Luxury Costa del Sol resort entrance with golf luggage and transfer vehicle.'
    },
    {
      image: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
      alt: 'GolfSol Ireland private transfers on the Costa del Sol.'
    },
    {
      image: '/images/transport-hero-coastal-drive.webp',
      alt: 'Coastal motorway drive at golden hour — route between golf courses and your base.'
    }
  ] as const
  const slot = (index + path.replace(/\//g, '').length) % pool.length
  return pool[slot]!
}

export function getContentPageFormConfig(path: string, page: GeContentPageData): ContentFormConfig {
  const kind = inferPageKind(path, page)
  const isBundlePath = path === '/bundles' || path.includes('golf-holiday') || path.includes('golf-packages')

  switch (kind) {
    case 'twilight':
      return leanEnquiryFormConfig({
        badge: 'Twilight quote',
        submitLabel: 'Send enquiry',
        successTitle: 'Enquiry received',
        successBody: 'We will come back with twilight-friendly options for your dates.',
        notesPlaceholder: 'Twilight preferences, courses, or anything already booked…'
      })
    case 'courses':
      return leanEnquiryFormConfig({
        badge: 'Course quote',
        submitLabel: 'Send enquiry',
        successTitle: 'Enquiry received',
        successBody: 'We will come back with a shortlist that fits your group and dates.',
        notesPlaceholder: 'Courses you want, area, or open to suggestions…'
      })
    case 'accommodation':
      return leanEnquiryFormConfig({
        badge: 'Stay quote',
        submitLabel: 'Send enquiry',
        successTitle: 'Enquiry received',
        successBody: 'We will return stay options that fit the trip and the group.',
        notesPlaceholder: 'Hotel style, base area, twin rooms, or anything already booked…'
      })
    case 'transport':
      return leanEnquiryFormConfig({
        badge: 'Transfer quote',
        submitLabel: 'Send enquiry',
        successTitle: 'Enquiry received',
        successBody: 'We will come back with a practical route and vehicle plan.',
        includeBundle: false,
        peopleMode: 'passengers',
        notesPlaceholder: 'Pickup → drop-off, flight time, golf bags, stops…',
        notesRequired: true
      })
    case 'legal':
      return {
        badge: 'Legal question',
        submitLabel: 'Send question',
        successTitle: 'Question received',
        successBody: 'We will clarify the policy point in plain language.',
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
            label: 'Message',
            type: 'textarea',
            placeholder: 'What do you need clarified?',
            required: true,
            rows: 4
          }
        ]
      }
    case 'newsletter':
    case 'news':
      return {
        badge: 'Updates',
        submitLabel: 'Request updates',
        successTitle: 'Request received',
        successBody: 'We will send the right Golf Sol Ireland updates for you.',
        fields: [
          {
            id: 'notes',
            label: 'Message',
            type: 'textarea',
            placeholder: 'What updates would help — courses, hotels, transfers?',
            rows: 4
          }
        ]
      }
    case 'testimonial':
      return {
        badge: 'Trip feedback',
        submitLabel: 'Submit review',
        submissionKind: 'testimonial',
        successTitle: 'Thank you — review received',
        successBody:
          'We will read your story shortly. Once approved, it can appear on our homepage.',
        fields: [
          {
            id: 'notes',
            label: 'Your review',
            type: 'textarea',
            placeholder: 'What stood out — tee times, hotel, transfers, Irish support?',
            required: true,
            rows: 5
          }
        ]
      }
    case 'about':
    case 'support':
      return leanEnquiryFormConfig({
        badge: path.includes('contact') || isBundlePath ? 'Get a quote' : 'Get in touch',
        submitLabel: 'Send enquiry',
        successTitle: 'Enquiry received',
        successBody: 'Thanks — we will come back with a clear next step.',
        includeBundle: true,
        notesPlaceholder: path.includes('contact')
          ? 'Anything else — courses, hotel style, flights…'
          : 'How can we help?'
      })
    case 'booking':
    default:
      return leanEnquiryFormConfig({
        badge: isBundlePath || path.includes('contact') || path.includes('enquiry') ? 'Get a quote' : 'Trip quote',
        submitLabel: 'Send enquiry',
        successTitle: 'Enquiry received',
        successBody: 'Thanks — we will reply from Ireland with the next clear step for your trip.',
        includeBundle: true,
        notesPlaceholder: 'Anything else — courses, hotel style, flights…'
      })
  }
}

export function getContentPageSmartActions(path: string, page: GeContentPageData): readonly ContentSmartAction[] {
  const kind = inferPageKind(path, page)
  const routeLabel = formatContentPageRouteLabel(path)
  const genericWhatsApp = `Hi GolfSol Ireland — I'm on the ${routeLabel} page and I want help with this trip.`

  switch (kind) {
    case 'twilight':
      return [
        {
          kind: 'form',
          label: 'Request twilight slots',
          description: 'Tell us dates and base — we return sunset-safe options with clear tee windows.',
          href: '#ge-enquiry-form',
          tone: 'gold'
        },
        {
          kind: 'whatsapp',
          label: 'WhatsApp twilight question',
          description: 'Quick steer on which courses run the best late sheets for your month.',
          href: buildWhatsAppHref(
            `Hi GolfSol Ireland — I'm looking at twilight golf on the Costa del Sol and want to check slot options for our group.`
          ),
          tone: 'dark',
          external: true
        },
        {
          kind: 'call',
          label: 'Call about evening rounds',
          description: 'Useful if you want to balance twilight with prime morning rounds in one call.',
          href: `tel:${contactInfo.phoneTel}`,
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
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
          secondaryTelHref: `tel:${contactInfo.spanishPhoneTel}`,
          secondaryTelLabel: contactInfo.spanishPhoneDisplay,
          tone: 'light'
        }
      ]
  }
}
