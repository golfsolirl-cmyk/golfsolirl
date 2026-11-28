/**
 * Verified public contact details for SEO / structured data.
 * Source of truth: shared/business-details.mjs (via src/lib/business-details.ts).
 */
import { GSOL_BUSINESS } from '../business-details'

export const SEO_CONTACT = {
  brandName: GSOL_BUSINESS.brandName,
  alternateName: GSOL_BUSINESS.alternateName,
  email: GSOL_BUSINESS.email,
  siteUrl: GSOL_BUSINESS.websiteUrl,
  siteUrlBare: GSOL_BUSINESS.siteUrlBare,
  irishPhoneDisplay: GSOL_BUSINESS.irishPhoneDisplay,
  irishPhoneTel: GSOL_BUSINESS.irishPhoneTel,
  spanishPhoneDisplay: GSOL_BUSINESS.spanishPhoneDisplay,
  spanishPhoneTel: GSOL_BUSINESS.spanishPhoneTel,
  whatsappHref: GSOL_BUSINESS.whatsappHref,
  whatsappDisplay: GSOL_BUSINESS.whatsappDisplay,
  companyRegistrationNumber: GSOL_BUSINESS.companyRegistrationNumber,
  registeredInLabel: GSOL_BUSINESS.registeredInLabel,
  websiteDisplay: GSOL_BUSINESS.websiteDisplay,
  addressOneLine: GSOL_BUSINESS.addressOneLine,
  address: {
    streetAddress: GSOL_BUSINESS.address.streetAddress,
    addressLocality: GSOL_BUSINESS.address.addressLocality,
    addressRegion: GSOL_BUSINESS.address.addressRegion,
    postalCode: GSOL_BUSINESS.address.postalCode,
    addressCountry: GSOL_BUSINESS.address.addressCountry
  }
} as const

/**
 * Remaining human verification before advertising more widely.
 * Official address, voice lines, email, web, and company registration are confirmed.
 */
export const SEO_CONTACT_TODO = [
  'Confirm preferred canonical host: https://www.golfsolirl.com vs https://golfsolirl.com',
  'Supply verified Facebook business page URL for Organization sameAs (Tripadvisor listing is live)',
  'Confirm whether Spanish WhatsApp should ever use the Spanish voice line (currently Irish WhatsApp only: +353 86 600 6202)'
] as const
