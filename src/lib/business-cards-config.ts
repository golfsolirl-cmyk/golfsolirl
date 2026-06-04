import { footerSocialLinks, type FooterSocialLink } from '../data/site-content'
import { GOLFSOL_BRAND_LOGO } from './brand-logo-assets'

/**
 * Golf Sol Ireland — business card catalogue (Martin Kelly + Greg McDonald).
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
  roleTitle: 'Operations',
  /** Short positioning line for luxury fronts */
  premiumDescriptor: 'Premium golf travel · Costa del Sol',
  /** Corridor / markets line */
  corridorLine: 'Dublin · Málaga'
}

/** Second staff set — same company contact lines on card backs */
export const businessCardPersonGreg: BusinessCardPersonBlurb = {
  name: 'Greg McDonald',
  roleTitle: 'Operations',
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

/** CODE128 payload on card backs */
export const businessCardBarcodeValue = businessCardContact.websiteUrl

/** Same links as site footer — single source of truth */
export const businessCardSocialLinks: readonly FooterSocialLink[] = footerSocialLinks

/** @deprecated Use businessCardSocialLinks — kept for any legacy imports */
export const businessCardSocial = {
  whatsapp: footerSocialLinks.find((l) => l.label === 'WhatsApp')?.href ?? 'https://wa.me/353874464766',
  facebook: footerSocialLinks.find((l) => l.label === 'Facebook')?.href ?? 'https://www.facebook.com/',
  linkedin: footerSocialLinks.find((l) => l.label === 'LinkedIn')?.href ?? 'https://www.linkedin.com/',
  bluesky: footerSocialLinks.find((l) => l.label === 'Bluesky')?.href ?? 'https://bsky.app/'
} as const

export const businessCardAssets = {
  /** Crest PNG for print / masks; raster matches brand crest art. */
  crestWidePng: GOLFSOL_BRAND_LOGO.png,
  crestSvg: GOLFSOL_BRAND_LOGO.svg,
  siteLogoSvg: GOLFSOL_BRAND_LOGO.svg
} as const

/** Executive landscape card — Tommy O'Shea */
export const businessCardTommy = {
  name: "Tommy O'Shea",
  roleTitle: 'Founder & Golf Travel Specialist',
  email: 'info@golfsolirl.com',
  phone: '+353 87 446 4766',
  phoneTel: '+353874464766',
  websiteDisplay: 'www.golfsolirl.com',
  websiteUrl: 'https://golfsolirl.com',
  qrUrl: 'https://golfsolirl.com',
  location: 'Costa del Sol, Spain',
  headline: 'GOLF SOL IRELAND',
  subheading: 'Luxury Golf Transfers & Experiences',
  tagline: 'Irish Drivers • Mercedes Fleet • Costa del Sol'
} as const

/** Luxury palette — executive Tommy O'Shea card */
export const businessCardLuxuryPalette = {
  forest: '#0E3B2E',
  emerald: '#145A42',
  gold: '#D4AF37',
  champagne: '#E5C76B',
  onyx: '#0A0A0A',
  ivory: '#F7F3E9'
} as const
