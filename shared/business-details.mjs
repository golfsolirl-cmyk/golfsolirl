/**
 * Official Golf Sol Ireland business details — single source of truth.
 * Client copy, SEO JSON-LD, email footers, and PDFs must import from here
 * (or from the thin TypeScript re-export at src/lib/business-details.ts).
 *
 * Voice lines (Ireland / Spain) are for calls.
 * WhatsApp is a separate number and must not replace the Irish voice line.
 */

export const GSOL_BUSINESS = {
  brandName: 'Golf Sol Ireland',
  alternateName: 'GolfSol',
  legalName: 'Golf Sol Ireland',
  tagline: 'Irish-owned Costa del Sol golf travel',

  email: 'info@golfsolirl.com',
  websiteDisplay: 'www.golfsolirl.com',
  websiteUrl: 'https://www.golfsolirl.com',
  siteUrlBare: 'https://golfsolirl.com',

  /** Registered company number (Ireland). */
  companyRegistrationNumber: '814210',
  registeredInLabel: 'Registered in Ireland · Co. 814210',

  address: {
    streetAddress: '6 Richmond Road',
    addressLocality: 'Drumcondra',
    addressRegion: 'Dublin 3',
    postalCode: 'D03 C434',
    addressCountry: 'IE',
    addressCountryName: 'Ireland'
  },

  /** Display lines for footers / PDFs (no country on first three; country last). */
  addressLines: ['6 Richmond Road', 'Drumcondra, Dublin 3', 'D03 C434', 'Ireland'],

  /** Single-line postal address. */
  addressOneLine: '6 Richmond Road, Drumcondra, Dublin 3, D03 C434, Ireland',

  mapsQuery: '6 Richmond Road, Drumcondra, Dublin 3, D03 C434, Ireland',

  /** Irish voice / support line (not WhatsApp). */
  irishPhoneDisplay: '+353 86 851 5000',
  irishPhoneTel: '+353868515000',
  irishPhoneLabel: 'Ireland',

  /** Spanish voice line. */
  spanishPhoneDisplay: '+34 641 81 53 66',
  spanishPhoneTel: '+34641815366',
  spanishPhoneLabel: 'Spain',

  /** WhatsApp only — do not use as the primary voice line. */
  whatsappDisplay: '+353 86 600 6202',
  whatsappTel: '+353866006202',
  whatsappHref: 'https://wa.me/353866006202',
  whatsappNumberDigits: '353866006202'
}

/** Short footer block: address · phones · email · registration. */
export const gsolBusinessFooterPlain = () =>
  [
    GSOL_BUSINESS.addressOneLine,
    `Ireland ${GSOL_BUSINESS.irishPhoneDisplay} · Spain ${GSOL_BUSINESS.spanishPhoneDisplay}`,
    `${GSOL_BUSINESS.email} · ${GSOL_BUSINESS.websiteDisplay}`,
    GSOL_BUSINESS.registeredInLabel
  ].join('\n')

/** PostalAddress-shaped object for JSON-LD. */
export const gsolPostalAddressJsonLd = () => ({
  '@type': 'PostalAddress',
  streetAddress: GSOL_BUSINESS.address.streetAddress,
  addressLocality: GSOL_BUSINESS.address.addressLocality,
  addressRegion: GSOL_BUSINESS.address.addressRegion,
  postalCode: GSOL_BUSINESS.address.postalCode,
  addressCountry: GSOL_BUSINESS.address.addressCountry
})
