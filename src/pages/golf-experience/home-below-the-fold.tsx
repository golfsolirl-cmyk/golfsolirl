import { GeFooter } from './sections/ge-footer'
import { GeHomeBundlesTeaser } from './sections/home-bundles-teaser'
import { GeHomeEnquiry } from './sections/home-enquiry'
import { GeHomeWhatWeDo } from './sections/home-what-we-do'
import { WhatsappFab } from './components/whatsapp-fab'

/**
 * Homepage fold — bundles first (centrepiece), thin services strip, then enquiry.
 * Competing package calculators and dense galleries stay off the home path.
 */
export default function HomeBelowTheFold() {
  return (
    <>
      <GeHomeBundlesTeaser />
      <GeHomeWhatWeDo />
      <GeHomeEnquiry />
      <GeFooter />
      <WhatsappFab />
    </>
  )
}
