import { useEffect, useState } from 'react'
import {
  BUNDLE_DURATIONS,
  BUNDLE_PRICES_UPDATED_EVENT,
  BUNDLE_TIERS,
  bundlePriceKey,
  formatBundlePrice,
  loadBundlePrices,
  quoteHrefForBundle,
  type BundlePriceMap,
  type BundleTierId
} from '../../data/golf-holiday-bundles'
import { usePageMeta } from '../../lib/use-page-meta'
import { GeButton } from './components/ge-button'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { WhatsappFab } from './components/whatsapp-fab'

export function BundlesPage() {
  usePageMeta({
    title: 'Costa del Sol Golf Holiday Bundles | GolfSol Ireland',
    description:
      '3, 5 and 7-night Costa del Sol golf holiday bundles for Irish golfers — Weekend Golf to Ultimate Golf Week, Value / Classic / Premium.',
    canonicalPath: '/bundles'
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
      <main id="main" className="pb-20 pt-24 sm:pt-28">
        <section className="mx-auto max-w-[1100px] px-5 sm:px-8">
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">
            Golf holiday bundles
          </p>
          <h1 className="mt-3 max-w-3xl font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-gs-dark sm:text-[2.75rem]">
            Stay, play, transfer — one clear package.
          </h1>
          <p className="mt-4 max-w-2xl font-ge text-[1.05rem] leading-7 text-ge-gray600">
            Choose how many nights, how many rounds, and the hotel level. We send a personal quote — prices below are
            placeholders until your admin fills them in.
          </p>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Hotel level">
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

        <div className="mx-auto mt-12 max-w-[1100px] space-y-14 px-5 sm:px-8">
          {BUNDLE_DURATIONS.map((duration) => (
            <section key={duration.id} id={duration.id} className="scroll-mt-28">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-md bg-gs-green/10 px-2.5 py-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-gs-green">
                    {duration.badge}
                  </span>
                  <h2 className="mt-2 font-ge text-[1.55rem] font-extrabold text-gs-dark sm:text-[1.85rem]">
                    {duration.title}
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {duration.packages.map((pkg) => {
                  const key = bundlePriceKey(duration.id, pkg.id, tier)
                  const price = prices[key] ?? pkg.priceFromEuro
                  return (
                    <article
                      key={pkg.id}
                      className="flex h-full flex-col rounded-2xl border border-chrome-300/80 bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-ge text-lg font-extrabold text-gs-dark">{pkg.name}</h3>
                      <p className="mt-1 font-ge text-sm text-ge-gray600">
                        {duration.nights} nights · {pkg.rounds} rounds · {activeTier.label}
                      </p>
                      <p className="mt-4 font-ge text-xl font-extrabold text-gs-green">{formatBundlePrice(price)}</p>
                      <div className="mt-auto pt-5">
                        <GeButton
                          href={quoteHrefForBundle({
                            durationId: duration.id,
                            packageName: pkg.name,
                            rounds: pkg.rounds,
                            nights: duration.nights,
                            tierId: tier
                          })}
                          variant="gs-green"
                          size="md"
                          className="w-full"
                        >
                          Get a quote
                        </GeButton>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[1100px] px-5 text-center sm:px-8">
          <p className="font-ge text-[1.05rem] text-ge-gray600">
            Prefer a fully custom trip? Tell us the dates and courses — we build it.
          </p>
          <div className="mt-5">
            <GeButton href="/contact" variant="outline-gs-green" size="lg">
              Get a custom quote
            </GeButton>
          </div>
        </div>
      </main>
      <GeFooter />
      <WhatsappFab />
    </div>
  )
}
