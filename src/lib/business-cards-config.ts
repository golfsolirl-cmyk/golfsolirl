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

const businessCardSharedContact = {
  email: 'info@golfsolirl.com',
  websiteUrl: 'https://www.golfsolirl.com',
  websiteDisplay: 'www.golfsolirl.com',
  phoneEs: '+34 641 81 53 66',
  companyRegIreland: '814210'
} as const

/** Martin Kelly — Irish 086 line; WhatsApp on card backs uses Spanish line. */
export const businessCardContact = {
  ...businessCardSharedContact,
  phoneIe: '+353 86 600 6202',
  whatsappHref: 'https://wa.me/34641815366'
} as const

/** Greg McDonald — Irish 087 line; WhatsApp on card backs uses same Irish mobile. */
export const businessCardContactGreg = {
  ...businessCardSharedContact,
  phoneIe: '+353 87 446 4766',
  whatsappHref: 'https://wa.me/353874464766'
} as const

export type BusinessCardContactPack = typeof businessCardContact

export function businessCardContactForPerson(person: { readonly name: string }): BusinessCardContactPack {
  return person.name === businessCardPersonGreg.name ? businessCardContactGreg : businessCardContact
}

function socialLinksWithWhatsapp(whatsappHref: string): readonly FooterSocialLink[] {
  return footerSocialLinks.map((link) =>
    link.label === 'WhatsApp' ? { ...link, href: whatsappHref } : link
  )
}

/** Martin Kelly card backs (default). */
export const businessCardSocialLinks: readonly FooterSocialLink[] = socialLinksWithWhatsapp(
  businessCardContact.whatsappHref
)

/** Greg McDonald card backs — Irish WhatsApp. */
export const businessCardSocialLinksGreg: readonly FooterSocialLink[] = socialLinksWithWhatsapp(
  businessCardContactGreg.whatsappHref
)

export function businessCardSocialLinksForPerson(person: {
  readonly name: string
}): readonly FooterSocialLink[] {
  return person.name === businessCardPersonGreg.name
    ? businessCardSocialLinksGreg
    : businessCardSocialLinks
}

/** CODE128 payload on card backs */
export const businessCardBarcodeValue = businessCardContact.websiteUrl

/** @deprecated Use businessCardSocialLinks — kept for any legacy imports */
export const businessCardSocial = {
  whatsapp: businessCardContact.whatsappHref,
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
