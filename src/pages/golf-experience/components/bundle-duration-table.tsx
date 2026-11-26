import {
  bundlePriceKey,
  formatBundlePrice,
  quoteHrefForBundle,
  type BundleDuration,
  type BundlePriceMap,
  type BundleTier
} from '../../../data/golf-holiday-bundles'
import { GeButton } from './ge-button'

type BundleDurationTableProps = {
  readonly duration: BundleDuration
  readonly tier: BundleTier
  readonly prices: BundlePriceMap
  /** Compact homepage preview — link to full bundles page. */
  readonly compact?: boolean
}

function priceLabel(price: number | null | undefined) {
  return formatBundlePrice(price)
}

/** Clean Package | Golf rounds rows for one stay length. */
export function BundleDurationTable({ duration, tier, prices, compact = false }: BundleDurationTableProps) {
  return (
    <section id={duration.id} className="scroll-mt-28">
      <div className="mb-4">
        <span className="inline-flex rounded-md bg-gs-green/10 px-2.5 py-1 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-gs-green">
          {duration.badge}
        </span>
        <h2 className="mt-2 font-ge text-[1.45rem] font-extrabold text-gs-dark sm:text-[1.75rem]">{duration.title}</h2>
        <p className="mt-1 font-ge text-sm text-ge-gray500">
          {duration.nights} nights · {tier.label} hotels
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-chrome-300/80 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_7rem_minmax(5.5rem,1fr)_auto] gap-3 border-b border-chrome-200 bg-cream/80 px-5 py-3 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ge-gray500 sm:grid">
          <span>Package</span>
          <span>Golf rounds</span>
          {!compact ? <span>From</span> : <span />}
          <span className="sr-only">Quote</span>
        </div>

        <ul className="divide-y divide-chrome-100">
          {duration.packages.map((pkg) => {
            const key = bundlePriceKey(duration.id, pkg.id, tier.id)
            const price = prices[key] ?? pkg.priceFromEuro
            const href = quoteHrefForBundle({
              durationId: duration.id,
              packageName: pkg.name,
              rounds: pkg.rounds,
              nights: duration.nights,
              tierId: tier.id
            })
            return (
              <li key={pkg.id} className="px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1.4fr)_7rem_minmax(5.5rem,1fr)_auto] sm:items-center sm:gap-3 sm:px-5 sm:py-3.5">
                <div className="min-w-0">
                  <p className="font-ge text-[1.02rem] font-extrabold text-gs-dark">{pkg.name}</p>
                  <p className="mt-0.5 font-ge text-sm text-ge-gray600 sm:hidden">{pkg.rounds} rounds</p>
                </div>
                <p className="hidden font-ge text-sm text-ge-gray600 sm:block">{pkg.rounds} rounds</p>
                {!compact ? (
                  <p className="mt-1 font-ge text-sm font-semibold text-gs-green sm:mt-0">{priceLabel(price)}</p>
                ) : (
                  <span className="hidden sm:block" />
                )}
                <div className="mt-3 sm:mt-0 sm:justify-self-end">
                  {compact ? (
                    <a
                      href={`/bundles#${duration.id}`}
                      className="inline-flex font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-brand-700 hover:text-gs-dark"
                    >
                      View
                    </a>
                  ) : (
                    <GeButton href={href} variant="gs-green" size="sm" className="w-full sm:w-auto">
                      Get a quote
                    </GeButton>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
