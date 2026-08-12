import { lazy, Suspense, useEffect, useMemo } from 'react'
import { PremiumGolfHero } from '../../components/home/premium-golf-hero'
import { HomeCreativeCanvas } from '../../components/ui/HomeCreativeCanvas'
import { GeNavbar } from './sections/ge-navbar'
import { HOMEPAGE_CREATIVE_CANVAS_ENABLED } from '../../lib/homepage-luxury-background'
import { prefetchLikelyMarketingRoutes } from '../../lib/prefetch-route-chunk'
import { cx } from '../../lib/utils'
import { useJsonLd, usePageMeta } from '../../lib/use-page-meta'
import {
  buildOrganizationSchema,
  buildWebPageSchema,
  buildWebSiteSchema
} from '../../lib/seo/organization-schema'
import { absoluteOgImageUrl, DEFAULT_OG_IMAGE_PATH } from '../../lib/site-seo'

const HomeBelowTheFold = lazy(() => import('./home-below-the-fold'))

export function GolfExperienceHome() {
  usePageMeta({
    title: 'Costa del Sol Golf Holidays from Ireland | GolfSol Ireland',
    description:
      'Costa del Sol golf holidays for Irish golfers. Handpicked courses, hotels, tee times & Málaga airport transfers. Dublin, Cork, Shannon & Belfast departures.',
    canonicalPath: '/'
  })

  useJsonLd(
    'gsol-home-org',
    useMemo(() => buildOrganizationSchema(), [])
  )
  useJsonLd(
    'gsol-home-website',
    useMemo(() => buildWebSiteSchema(), [])
  )
  useJsonLd(
    'gsol-home-webpage',
    useMemo(
      () =>
        buildWebPageSchema({
          path: '/',
          name: 'Costa del Sol Golf Holidays from Ireland | GolfSol Ireland',
          description:
            'Costa del Sol golf holidays for Irish golfers. Handpicked courses, hotels, tee times & Málaga airport transfers.',
          imageUrl: absoluteOgImageUrl(DEFAULT_OG_IMAGE_PATH)
        }),
      []
    )
  )

  useEffect(() => {
    prefetchLikelyMarketingRoutes()
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
              className="min-h-[40vh] w-full bg-gradient-to-b from-cream to-offwhite/80"
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
