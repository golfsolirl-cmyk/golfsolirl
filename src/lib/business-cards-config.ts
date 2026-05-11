/**
 * Golf Sol Ireland — business card catalogue (Martin Kelly).
 * Edit URLs here; contact lines mirror `contactInfo` in golf-experience/data/copy.ts.
 */
export const businessCardPerson = {
  name: 'Martin Kelly',
  /** Company line used across legacy card layouts */
  tagline: 'Golf Sol Ireland',
  /** Executive title — premium / duplex backs */
  roleTitle: 'Director · Golf Travel & Concierge',
  /** Short positioning line for luxury fronts */
  premiumDescriptor: 'Premium golf travel · Costa del Sol',
  /** Corridor / markets line */
  corridorLine: 'Dublin · Málaga'
} as const

export const businessCardContact = {
  email: 'info@golfsolirl.com',
  /** Public web — shown as www… on cards; links use HTTPS. */
  websiteUrl: 'https://www.golfsolirl.com',
  websiteDisplay: 'www.golfsolirl.com',
  phoneIe: '+353 87 446 4766',
  phoneEs: '+34 641 81 53 66',
  companyRegIreland: '814210'
} as const

/** Same placeholders as site footer — replace with live profiles when ready */
export const businessCardSocial = {
  whatsapp: 'https://wa.me/353874464766',
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  linkedin: 'https://www.linkedin.com/'
} as const

export const businessCardAssets = {
  /** Crest SVG with Ireland / Spain flags, used across site chrome and cards. */
  crestWidePng: '/golfsol-crest.svg',
  crestSvg: '/golfsol-crest.svg',
  siteLogoSvg: '/golfsol-crest.svg'
} as const
