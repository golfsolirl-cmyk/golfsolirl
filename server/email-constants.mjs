import { GSOL_BUSINESS } from '../shared/business-details.mjs'

/** Legacy `cid:` keys — only referenced by `adaptTransactionalEmailHtmlForBrowserPreview` if old HTML still contains them. */
export const logoLockupEmailContentId = 'gsol-brand-lockup-email'
export const shamrockInlineContentId = 'gsol-shamrock-inline'
export const socialContentIds = {
  linkedin: 'gsol-social-linkedin',
  facebook: 'gsol-social-facebook',
  whatsapp: 'gsol-social-whatsapp',
  bsky: 'gsol-social-bsky'
}

/** Legal — company no. from shared/business-details.mjs */
export const gsolCompanyLegal = {
  companyRegistrationNumber: GSOL_BUSINESS.companyRegistrationNumber
}

/** Brand lines — align with shared/business-details.mjs */
export const gsolEmailBrand = {
  phoneDisplay: GSOL_BUSINESS.irishPhoneDisplay,
  phoneTel: GSOL_BUSINESS.irishPhoneTel,
  spanishPhoneDisplay: GSOL_BUSINESS.spanishPhoneDisplay,
  spanishPhoneTel: GSOL_BUSINESS.spanishPhoneTel,
  phoneIrishLineLabel: GSOL_BUSINESS.irishPhoneLabel,
  phoneSpanishLineLabel: GSOL_BUSINESS.spanishPhoneLabel,
  whatsappHref: GSOL_BUSINESS.whatsappHref,
  whatsappDisplay: GSOL_BUSINESS.whatsappDisplay,
  email: GSOL_BUSINESS.email,
  addressLines: [
    GSOL_BUSINESS.address.streetAddress,
    `${GSOL_BUSINESS.address.addressLocality}, ${GSOL_BUSINESS.address.addressRegion}`
  ],
  eircode: GSOL_BUSINESS.address.postalCode,
  websiteDisplay: GSOL_BUSINESS.websiteDisplay,
  websiteUrl: GSOL_BUSINESS.websiteUrl,
  registeredInLabel: GSOL_BUSINESS.registeredInLabel,
  addressOneLine: GSOL_BUSINESS.addressOneLine
}
