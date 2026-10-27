/** Legacy `cid:` keys — only referenced by `adaptTransactionalEmailHtmlForBrowserPreview` if old HTML still contains them. */
export const logoLockupEmailContentId = 'gsol-brand-lockup-email'
export const shamrockInlineContentId = 'gsol-shamrock-inline'
export const socialContentIds = {
  linkedin: 'gsol-social-linkedin',
  facebook: 'gsol-social-facebook',
  whatsapp: 'gsol-social-whatsapp',
  bsky: 'gsol-social-bsky'
}

/** Legal — company no. mirrors `src/lib/business-cards-config.ts` businessCardContact.companyRegIreland */
export const gsolCompanyLegal = {
  companyRegistrationNumber: '814210'
}

/** Brand lines — align with `src/data/site-content.ts` companyContact + footer. */
export const gsolEmailBrand = {
  phoneDisplay: '086 851 5000',
  phoneTel: '+353868515000',
  spanishPhoneDisplay: '+34 641 81 53 66',
  spanishPhoneTel: '+34641815366',
  phoneIrishLineLabel: 'Ireland',
  phoneSpanishLineLabel: 'Spain',
  whatsappHref: 'https://wa.me/353868515000',
  email: 'info@golfsolirl.com',
  addressLines: ['6 Richmond Road', 'Drumcondra, Dublin 3'],
  eircode: 'D03 C434'
}
