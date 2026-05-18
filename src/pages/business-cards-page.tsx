import { BusinessCardsCatalog } from '../components/business-cards-catalog'
import { BusinessCardsHero } from './golf-experience/sections/business-cards-hero'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

/** Internal showcase: Martin Kelly business card concepts. Route: `/business-cards` */
export function BusinessCardsPage() {
  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-[#F4F7F5]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <BusinessCardsHero />
        <BusinessCardsCatalog />
      </main>

      <GeFooter />
    </div>
  )
}
