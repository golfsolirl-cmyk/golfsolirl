import { lazy, Suspense } from 'react'
import { GeHero } from './sections/hero'
import { GeNavbar } from './sections/ge-navbar'

const HomeBelowTheFold = lazy(() => import('./home-below-the-fold'))

export function GolfExperienceHome() {
  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <GeHero />
        <Suspense
          fallback={
            <div className="min-h-[50vh] w-full bg-gradient-to-b from-white to-offwhite/80" aria-hidden="true" />
          }
        >
          <HomeBelowTheFold />
        </Suspense>
      </main>
    </div>
  )
}
