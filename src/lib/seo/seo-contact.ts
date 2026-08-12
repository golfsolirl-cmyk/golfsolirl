/**
 * Verified public contact details for SEO / structured data.
 * Source of truth: golf-experience copy + site-content companyContact.
 */
export const SEO_CONTACT = {
  brandName: 'Golf Sol Ireland',
  alternateName: 'GolfSol',
  email: 'info@golfsolirl.com',
  siteUrl: 'https://www.golfsolirl.com',
  siteUrlBare: 'https://golfsolirl.com',
  irishPhoneDisplay: '+353 87 446 4766',
  irishPhoneTel: '+353874464766',
  spanishPhoneDisplay: '+34 641 81 53 66',
  spanishPhoneTel: '+34641815366',
  whatsappHref: 'https://wa.me/353874464766',
  address: {
    streetAddress: '6 Richmond Road',
    addressLocality: 'Drumcondra',
    addressRegion: 'Dublin 3',
    postalCode: 'D03 C434',
    addressCountry: 'IE'
  }
} as const

/**
 * TODO — human verification before advertising more widely:
 * - Confirm whether www or non-www is the permanent canonical host in Search Console
 * - Confirm social profile URLs (Facebook, Instagram, LinkedIn, TripAdvisor) for sameAs
 * - Confirm whether Spanish WhatsApp should use the Spanish number (currently Irish WhatsApp)
 */
export const SEO_CONTACT_TODO = [
  'Confirm preferred canonical host: https://www.golfsolirl.com vs https://golfsolirl.com',
  'Supply verified social profile URLs for Organization sameAs',
  'Confirm WhatsApp business number if different from Irish support line'
] as const
