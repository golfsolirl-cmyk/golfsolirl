import { WhatsAppBanner } from '../../components/whatsapp/WhatsAppBanner'
import { GeFooter } from './sections/ge-footer'
import { GeHomeBundlesTeaser } from './sections/home-bundles-teaser'
import { GeHomeCustomerTripsGallery } from './sections/home-customer-trips-gallery'
import { GeHomeEnquiry } from './sections/home-enquiry'
import { GeHomeEuNordicWelcome } from './sections/home-eu-nordic-welcome'
import { GeHomeMalagaTransfers } from './sections/home-malaga-transfers'
import { GeHomeWhatWeDo } from './sections/home-what-we-do'

/**
 * Homepage fold — European welcome, bundles, past-customer trip gallery,
 * thin services strip, then enquiry + Malaga transfers.
 * WhatsApp lives in the TOW-style banner above the footer (no floating popup).
 */
export default function HomeBelowTheFold() {
  return (
    <>
      <GeHomeEuNordicWelcome />
      <GeHomeBundlesTeaser />
      <GeHomeWhatWeDo />
      <GeHomeCustomerTripsGallery />
      <GeHomeEnquiry />
      <GeHomeMalagaTransfers />
      <WhatsAppBanner sourcePage="/" />
      <GeFooter />
    </>
  )
}
