import { businessCardContact, businessCardPerson, businessCardPersonGreg } from '../lib/business-cards-config'

/** ISO business card — landscape 85×55 mm at ~850px wide for PDF capture. */
export const CARD_LANDSCAPE_W = 850
export const CARD_LANDSCAPE_H = Math.round((CARD_LANDSCAPE_W * 55) / 85)

/** Portrait 55×85 mm. */
export const CARD_PORTRAIT_W = 550
export const CARD_PORTRAIT_H = Math.round((CARD_PORTRAIT_W * 85) / 55)

export const CARD_EXPORT_IDS = {
  portraitFront: 'gsol-card-portrait-front',
  portraitBack: 'gsol-card-portrait-back',
  landscapeFront: 'gsol-card-landscape-front',
  landscapeBack: 'gsol-card-landscape-back'
} as const

/** Greg McDonald — same faces as Martin; backs use greg-* ids (see BUSINESS_CARD_PRESS_SPECS). */
export const GREG_CARD_EXPORT_IDS = {
  portraitFront: 'greg-portrait-front',
  portraitBack: 'greg-portrait-back',
  landscapeFront: 'greg-landscape-front',
  landscapeBack: 'greg-landscape-back'
} as const

export type CardExportIds = {
  readonly portraitFront: string
  readonly portraitBack: string
  readonly landscapeFront: string
  readonly landscapeBack: string
}

export const CARD_STAFF = [
  {
    person: businessCardPerson,
    exportIds: CARD_EXPORT_IDS,
    fileSlug: 'martin-kelly'
  },
  {
    person: businessCardPersonGreg,
    exportIds: GREG_CARD_EXPORT_IDS,
    fileSlug: 'greg-mcdonald'
  }
] as const

export const CARD_BRAND = {
  forest950: '#04140c',
  forest900: '#062016',
  forest800: '#0b4d3b',
  forest700: '#136047',
  cream: '#f7f4ec',
  goldLight: '#fff5cf',
  goldMid: '#f4dfa6',
  goldDeep: '#d9be7a',
  textDark: '#08120d'
} as const

export const CARD_PERSON = {
  name: businessCardPerson.name,
  role: businessCardPerson.roleTitle,
  corridor: businessCardPerson.corridorLine,
  descriptor: businessCardPerson.premiumDescriptor
} as const

export const CARD_COPY = {
  kicker: 'Golf Sol Ireland',
  headlineTop: 'GOLF SOL',
  headlineBottom: 'IRELAND',
  tagline: 'Luxury Golf Transfers & Experiences',
  backHeadline: 'Your golf journey starts here',
  qrLabel: 'Scan to book your transfer',
  services: [
    'Airport Transfers',
    'Golf Course Transfers',
    'Golf Holidays & Packages',
    'Corporate & Society Travel',
    'Premium Concierge Service'
  ],
  badges: ['Irish Drivers', 'Costa del Sol Specialists', 'Mercedes Fleet'],
  ribbon: 'Málaga → Costa del Sol',
  fairwayLine: 'From plane to fairway',
  corridor: CARD_PERSON.corridor,
  ...businessCardContact
} as const

export type CardRenderMode = 'preview' | 'pdf'

export function cardPublicUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const clean = path.startsWith('/') ? path.slice(1) : path
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${clean}`
}

export function cardInset(mode: CardRenderMode): string {
  return mode === 'pdf' ? '12px' : 'clamp(8px,2.2vmin,16px)'
}

/** PDF sizes are tuned for 850×550 / 550×850 capture — intentionally large for print. */
export function cardFont(mode: CardRenderMode, pdf: string, preview: string): string {
  return mode === 'pdf' ? pdf : preview
}

export function cardNameFont(mode: CardRenderMode, orientation: 'landscape' | 'portrait'): string {
  if (mode === 'pdf') return orientation === 'portrait' ? '1.42rem' : '1.05rem'
  return orientation === 'portrait' ? 'clamp(22px,11.5cqw,3rem)' : 'clamp(16px,5.8cqw,1.75rem)'
}

export function cardRoleFont(mode: CardRenderMode, orientation: 'landscape' | 'portrait'): string {
  if (mode === 'pdf') return orientation === 'portrait' ? '0.78rem' : '0.58rem'
  return orientation === 'portrait' ? 'clamp(12px,5.2cqw,1.35rem)' : 'clamp(10px,3.2cqw,0.95rem)'
}
