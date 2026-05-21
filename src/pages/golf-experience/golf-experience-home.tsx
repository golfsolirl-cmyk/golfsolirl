import { lazy, Suspense, useMemo } from 'react'
import { GeHero } from './sections/hero'
import { GeNavbar } from './sections/ge-navbar'
import { useJsonLd, usePageMeta } from '../../lib/use-page-meta'

const HomeBelowTheFold = lazy(() => import('./home-below-the-fold'))

export function GolfExperienceHome() {
  usePageMeta({
    title: 'Premium Costa del Sol golf holidays for Irish travellers',
    description:
      'Golf Sol Ireland creates premium Costa del Sol golf holidays for Irish travellers with handpicked packages, hotels, tee times, and transfers.',
    canonicalPath: '/'
  })

  useJsonLd(
    'gsol-home-org',
    useMemo(
      () => ({
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        name: 'Golf Sol Ireland',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://golfsolirl.com',
        description:
          'Premium Costa del Sol golf holidays for Irish travellers with transfers, tee times, and accommodation.',
        areaServed: ['IE', 'ES']
      }),
      []
    )
  )

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-offwhite">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <GeHero />
        <Suspense
          fallback={
            <div className="min-h-[50vh] w-full bg-gradient-to-b from-cream to-offwhite/80" aria-hidden="true" />
          }
        >
          <HomeBelowTheFold />
        </Suspense>
      </main>
    </div>
  )
}
