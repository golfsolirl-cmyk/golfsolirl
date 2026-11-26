import * as copy from '../../shared/enquiry-transfer-upsell-copy.mjs'

const siteOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://golfsolirl.com'
}

export const defaultTransferUpsellSubject = copy.defaultTransferUpsellSubject

export const defaultTransferUpsellBodyPlainForEnquiry = (fullName: string, referenceId: string) =>
  copy.defaultTransferUpsellBodyPlain({
    first: copy.enquiryTransferUpsellFirstName(fullName),
    referenceId,
    portalUrl: `${siteOrigin()}/portal`
  })