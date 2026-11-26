import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  BUNDLE_DURATIONS,
  BUNDLE_PRICES_UPDATED_EVENT,
  BUNDLE_TIERS,
  loadBundlePrices,
  type BundlePriceMap
} from '../../../data/golf-holiday-bundles'
import { BundleDurationTable } from '../components/bundle-duration-table'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'

/** Homepage centrepiece — Our golf holiday bundles as Package | Golf rounds tables. */
export function GeHomeBundlesTeaser() {
  const [prices, setPrices] = useState<BundlePriceMap>({})
  const classic = BUNDLE_TIERS.find((t) => t.id === 'classic') ?? BUNDLE_TIERS[1]

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

  return (
    <GeSection background="cream" className="py-14 sm:py-16">
      <div className="mx-auto max-w-[920px]">
        <div className="max-w-2xl">
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">
            Our golf holiday bundles
          </p>
          <h2 className="mt-3 font-ge text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] text-gs-dark sm:text-[2.35rem]">
            Short breaks, popular weeks, and full golf weeks.
          </h2>
          <p className="mt-4 font-ge text-[1.02rem] leading-7 text-ge-gray500">
            Package and rounds at a glance. Value, Classic and Premium hotels on the full bundles page.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {BUNDLE_DURATIONS.map((duration) => (
            <BundleDurationTable
              key={duration.id}
              compact
              duration={duration}
              prices={prices}
              tier={classic}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <GeButton href="/bundles" variant="gs-green" size="lg">
            View all bundles
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GeButton>
          <GeButton href="/contact" variant="outline-gs-green" size="lg">
            Get a quote
          </GeButton>
        </div>
      </div>
    </GeSection>
  )
}
