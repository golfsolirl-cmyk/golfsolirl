import { SectionShadowBridge } from '../../components/ui/SectionShadowBridge'
import { GeAboutBlock } from './sections/about-block'
import { GeAccommodationIntro } from './sections/accommodation-intro'
import { GeAccommodationSpain } from './sections/accommodation-spain'
import { GeCoursesSpain } from './sections/courses-spain'
import { GeDesignYourPackage } from './sections/design-your-package'
import { GeHomeTripadvisorReviews } from './sections/home-tripadvisor-reviews'
import { GeExtrasStrip } from './sections/extras-strip'
import { GeFacts } from './sections/facts'
import { GeFinalCta } from './sections/final-cta'
import { GeFooter } from './sections/ge-footer'
import { HomeAirportTransfersCta } from './sections/home-airport-transfers-cta'
import { GeHomeEnquiry } from './sections/home-enquiry'
import { GeHomeEuNordicWelcome } from './sections/home-eu-nordic-welcome'
import { GeHomeFleetHighlight } from './sections/home-fleet-highlight'
import { GeHomeWhatWeDo } from './sections/home-what-we-do'
import { WhatsappFab } from './components/whatsapp-fab'

/**
 * Split from the main entry so the first paint can ship navbar + hero + smaller core JS;
 * this chunk includes Framer sections and (via courses) Leaflet when the user scrolls.
 */
export default function HomeBelowTheFold() {
  return (
    <>
      <GeHomeWhatWeDo />
      <GeHomeEuNordicWelcome />
      <GeDesignYourPackage />
      <HomeAirportTransfersCta />
      <GeHomeTripadvisorReviews />
      <GeCoursesSpain />
      <GeAccommodationIntro />
      <GeAccommodationSpain />
      <GeHomeFleetHighlight />

      <SectionShadowBridge variant="plateau-to-dark" />
      <GeExtrasStrip />

      <GeFacts />
      <GeAboutBlock />

      <SectionShadowBridge variant="soft-lift" />
      <GeHomeEnquiry />

      <GeFinalCta />
      <GeFooter />
      <WhatsappFab />
    </>
  )
}
