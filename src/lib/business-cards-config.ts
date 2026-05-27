import { GOLFSOL_BRAND_LOGO } from './brand-logo-assets'

/**
 * Golf Sol Ireland — business card catalogue (Martin Kelly).
 * Edit URLs here; contact lines mirror `contactInfo` in golf-experience/data/copy.ts.
 */
/** Shared fields for React-built press cards */
export type BusinessCardPersonBlurb = {
  readonly name: string
  readonly roleTitle: string
  readonly premiumDescriptor: string
  readonly corridorLine: string
}

export const businessCardPerson: BusinessCardPersonBlurb = {
  name: 'Martin Kelly',
  roleTitle: 'Operations Manager',
  /** Short positioning line for luxury fronts */
  premiumDescriptor: 'Premium golf travel · Costa del Sol',
  /** Corridor / markets line */
  corridorLine: 'Dublin · Málaga'
}

/** Second staff set — same company contact lines on card backs */
export const businessCardPersonGreg: BusinessCardPersonBlurb = {
  name: 'Greg McDonald',
  roleTitle: 'Operations Manager',
  premiumDescriptor: 'Premium golf travel · Costa del Sol',
  corridorLine: 'Dublin · Málaga'
}

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
  /** Crest PNG for print / masks; raster matches brand crest art. */
  crestWidePng: GOLFSOL_BRAND_LOGO.png,
  crestSvg: GOLFSOL_BRAND_LOGO.svg,
  siteLogoSvg: GOLFSOL_BRAND_LOGO.svg
} as const
