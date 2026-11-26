import * as copy from '../../shared/enquiry-transfer-upsell-copy.mjs'
import type { TripServiceId } from './trip-quote-services'

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

export const defaultServiceOfferSubject = (service: TripServiceId, referenceId: string) =>
  copy.defaultServiceOfferSubject(service, referenceId)

export const defaultServiceOfferBodyPlainForEnquiry = (
  service: TripServiceId,
  fullName: string,
  referenceId: string
) =>
  copy.defaultServiceOfferBodyPlain({
    service,
    first: copy.enquiryTransferUpsellFirstName(fullName),
    referenceId,
    portalUrl: `${siteOrigin()}/portal`
  })
