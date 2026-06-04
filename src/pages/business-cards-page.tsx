import { BusinessCardsShowcase } from '../business-cards/showcase'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

/** Premium business cards — portrait + landscape — `/business-cards` */
export function BusinessCardsPage() {
  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-[#04140c]">
      <a
        href="#business-cards-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="business-cards-main" className="ge-on-dark">
        <BusinessCardsShowcase />
      </main>

      <GeFooter />
    </div>
  )
}
