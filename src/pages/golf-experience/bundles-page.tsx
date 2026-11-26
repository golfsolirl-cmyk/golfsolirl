import { useEffect, useState } from 'react'
import {
  BUNDLE_DURATIONS,
  BUNDLE_PRICES_UPDATED_EVENT,
  BUNDLE_TIERS,
  loadBundlePrices,
  type BundlePriceMap,
  type BundleTierId
} from '../../data/golf-holiday-bundles'
import { LeanPublicHero } from '../../components/home/premium-golf-hero'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { usePageMeta } from '../../lib/use-page-meta'
import { BundleDurationTable } from './components/bundle-duration-table'
import { GeButton } from './components/ge-button'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'

export function BundlesPage() {
  usePageMeta({
    title: 'Our Golf Holiday Bundles | GolfSol Ireland',
    description:
      'Short breaks, most popular 5-night trips, and full golf weeks — Value, Classic and Premium Costa del Sol packages for Irish golfers.',
    canonicalPath: '/bundles',
    ogImage: NAMED_HERO_IMAGE_SETS.packages.desktop
  })

  const [prices, setPrices] = useState<BundlePriceMap>({})
  const [tier, setTier] = useState<BundleTierId>('classic')

  useEffect(() => {
    const refresh = () => setPrices(loadBundlePrices())
    refresh()
    window.addEventListener(BUNDLE_PRICES_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(BUNDLE_PRICES_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const activeTier = BUNDLE_TIERS.find((t) => t.id === tier) ?? BUNDLE_TIERS[1]

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-cream">
      <GeNavbar />
      <main id="main">
        <LeanPublicHero
          ariaLabel="Our golf holiday bundles"
          images={NAMED_HERO_IMAGE_SETS.packages}
          kicker="GolfSol Ireland"
          lead="Three stay lengths. Three golf options. Pick Value, Classic or Premium — then get a personal quote."
          primaryCta={{ label: 'See packages', href: '#bundle-list' }}
          secondaryCta={{ label: 'Get a quote', href: '/quote' }}
          title="Our golf holiday bundles"
        />

        <section id="bundle-list" className="mx-auto max-w-[920px] scroll-mt-28 px-5 pb-8 pt-12 sm:px-8">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Hotel level">
            {BUNDLE_TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                className={
                  t.id === tier
                    ? 'rounded-full bg-gs-dark px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-white'
                    : 'rounded-full border border-chrome-300 bg-white px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-gs-dark hover:border-brand-700/40'
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-3 font-ge text-sm text-ge-gray500">{activeTier.blurb}</p>
        </section>

        <div className="mx-auto max-w-[920px] space-y-12 px-5 sm:px-8">
          {BUNDLE_DURATIONS.map((duration) => (
            <BundleDurationTable key={duration.id} duration={duration} tier={activeTier} prices={prices} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[920px] px-5 pb-20 text-center sm:px-8">
          <p className="font-ge text-[1.05rem] text-ge-gray600">Need something outside these bundles? Tell us the dates.</p>
          <div className="mt-5">
            <GeButton href="/quote" variant="outline-gs-green" size="lg">
              Get a custom quote
            </GeButton>
          </div>
        </div>
      </main>
      <GeFooter />
    </div>
  )
}
