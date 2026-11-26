import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { TransportEnquireBlock } from './sections/transport-enquire-block'
import { TransportFleet } from './sections/transport-fleet'
import { TransportHero } from './sections/transport-hero'
import { usePageMeta } from '../../lib/use-page-meta'

/**
 * Lean transport page — hero, fleet snapshot, enquiry. Extra trust bands and
 * repeated WhatsApp / booking strips removed after “too busy” feedback.
 */
export function TransportServicePage() {
  usePageMeta({
    title: 'Málaga Airport Golf Transfers | GolfSol Ireland',
    description:
      'Golf-bag-friendly private transfers from Málaga Airport to Costa del Sol hotels for Irish golf groups. Meet-and-greet and group transport.',
    canonicalPath: '/services/transport',
    ogImage: '/images/hero-costa-del-sol-transfer-banner.webp',
    ogImageAlt: 'Málaga Airport golf transfers for Irish golf groups on the Costa del Sol.'
  })

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <TransportHero />
        <TransportFleet />
        <TransportEnquireBlock />
      </main>

      <GeFooter />
    </div>
  )
}
