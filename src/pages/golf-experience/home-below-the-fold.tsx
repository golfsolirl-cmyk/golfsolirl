import { WhatsAppBanner } from '../../components/whatsapp/WhatsAppBanner'
import { GeFooter } from './sections/ge-footer'
import { GeHomeBundlesTeaser } from './sections/home-bundles-teaser'
import { GeHomeEnquiry } from './sections/home-enquiry'
import { GeHomeEuNordicWelcome } from './sections/home-eu-nordic-welcome'
import { GeHomeMalagaTransfers } from './sections/home-malaga-transfers'
import { GeHomeWhatWeDo } from './sections/home-what-we-do'

/**
 * Homepage fold — European welcome, bundles, thin services strip, then enquiry + Malaga transfers.
 * Competing package calculators and dense galleries stay off the home path.
 * WhatsApp lives in the TOW-style banner above the footer (no floating popup).
 */
export default function HomeBelowTheFold() {
  return (
    <>
      <GeHomeEuNordicWelcome />
      <GeHomeBundlesTeaser />
      <GeHomeWhatWeDo />
      <GeHomeEnquiry />
      <GeHomeMalagaTransfers />
      <WhatsAppBanner sourcePage="/" />
      <GeFooter />
    </>
  )
}
