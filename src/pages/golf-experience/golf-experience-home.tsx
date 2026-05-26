import { lazy, Suspense, useEffect, useMemo } from 'react'
import { PremiumGolfHero } from '../../components/home/premium-golf-hero'
import { HomeCreativeCanvas } from '../../components/ui/HomeCreativeCanvas'
import { GeNavbar } from './sections/ge-navbar'
import { HOMEPAGE_CREATIVE_CANVAS_ENABLED } from '../../lib/homepage-luxury-background'
import { cx } from '../../lib/utils'
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

  useEffect(() => {
    const prefetch = () => {
      void import('./home-below-the-fold')
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const t = window.setTimeout(prefetch, 800)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    let done = false
    const prefetch = () => {
      if (done) {
        return
      }
      done = true
      void import('./home-below-the-fold')
    }
    window.addEventListener('scroll', prefetch, { passive: true, once: true })
    window.addEventListener('wheel', prefetch, { passive: true, once: true })
    window.addEventListener('touchstart', prefetch, { passive: true, once: true })
    return () => {
      window.removeEventListener('scroll', prefetch)
      window.removeEventListener('wheel', prefetch)
      window.removeEventListener('touchstart', prefetch)
    }
  }, [])

  return (
    <div
      className={cx(
        'ge-page min-h-screen overflow-x-hidden',
        HOMEPAGE_CREATIVE_CANVAS_ENABLED ? 'homepage-creative-shell' : 'bg-offwhite'
      )}
    >
      {HOMEPAGE_CREATIVE_CANVAS_ENABLED ? <HomeCreativeCanvas /> : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <PremiumGolfHero />
        <Suspense
          fallback={
            <div
              className={cx(
                'min-h-[50vh] w-full',
                HOMEPAGE_CREATIVE_CANVAS_ENABLED
                  ? 'bg-transparent'
                  : 'bg-gradient-to-b from-cream to-offwhite/80'
              )}
              aria-hidden="true"
            />
          }
        >
          <HomeBelowTheFold />
        </Suspense>
      </main>
    </div>
  )
}
