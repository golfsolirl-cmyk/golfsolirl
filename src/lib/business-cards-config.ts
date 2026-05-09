/**
 * Golf Sol Ireland — business card catalogue (Martin Kelly).
 * Edit URLs here; contact lines mirror `contactInfo` in golf-experience/data/copy.ts.
 */
export const businessCardPerson = {
  name: 'Martin Kelly',
  /** Optional strapline under the name */
  tagline: 'Golf Sol Ireland',
  roleTitle: 'Costa del Sol Golf Travel Specialist',
  premiumDescriptor: 'Bespoke golf trips, transfers and resort planning',
  corridorLine: 'Ireland to Costa del Sol'
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
  /** Wide crest used on homepage navbar / footer (PNG when generated; SVG fallback). */
  crestWidePng: '/golfsol-crest-footer.png',
  crestSvg: '/golfsol-crest.svg',
  /** Inline wordmark + shamrock (site chrome). */
  siteLogoSvg: '/golf-sol-ireland-logo.svg'
} as const
