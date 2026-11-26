import { GeFooter } from './sections/ge-footer'
import { GeHomeBundlesTeaser } from './sections/home-bundles-teaser'
import { GeHomeEnquiry } from './sections/home-enquiry'
import { GeHomeWhatWeDo } from './sections/home-what-we-do'
import { WhatsappFab } from './components/whatsapp-fab'

/**
 * Lean homepage fold — one purpose per band, one primary path to quote/bundles.
 * Heavy repeats (design-your-package steps, dual course+hotel galleries, extras,
 * facts, about, floating concierge panel) were cut after client feedback that
 * the site felt too busy.
 */
export default function HomeBelowTheFold() {
  return (
    <>
      <GeHomeWhatWeDo />
      <GeHomeBundlesTeaser />
      <GeHomeEnquiry />
      <GeFooter />
      <WhatsappFab />
    </>
  )
}
