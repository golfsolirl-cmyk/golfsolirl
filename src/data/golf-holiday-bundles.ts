/**
 * Golf holiday bundles — main product offer (client spec from Martin Kelly).
 * Prices are placeholders admin can fill; never invent live prices.
 */

export type BundleTierId = 'value' | 'classic' | 'premium'
export type BundleDurationId = '3-night' | '5-night' | '7-night'

export type BundleTier = {
  readonly id: BundleTierId
  readonly label: string
  readonly blurb: string
}

export type BundlePackage = {
  readonly id: string
  readonly name: string
  readonly rounds: 2 | 3 | 5
  /** Admin-editable placeholder; null/empty means show Get a quote. */
  readonly priceFromEuro: number | null
}

export type BundleDuration = {
  readonly id: BundleDurationId
  readonly nights: 3 | 5 | 7
  readonly title: string
  readonly badge: string
  readonly packages: readonly BundlePackage[]
}

export const BUNDLE_TIERS: readonly BundleTier[] = [
  {
    id: 'value',
    label: 'Value',
    blurb: '3-star / quality budget accommodation'
  },
  {
    id: 'classic',
    label: 'Classic',
    blurb: '4-star hotels and better golf courses'
  },
  {
    id: 'premium',
    label: 'Premium',
    blurb: '4/5-star accommodation and top golf courses'
  }
] as const

export const BUNDLE_DURATIONS: readonly BundleDuration[] = [
  {
    id: '3-night',
    nights: 3,
    title: '3-night golf breaks',
    badge: 'Short breaks',
    packages: [
      { id: 'weekend-golf', name: 'Weekend Golf', rounds: 2, priceFromEuro: null },
      { id: 'golf-escape', name: 'Golf Escape', rounds: 3, priceFromEuro: null },
      { id: 'golf-extra', name: 'Golf Extra', rounds: 5, priceFromEuro: null }
    ]
  },
  {
    id: '5-night',
    nights: 5,
    title: '5-night golf holidays',
    badge: 'Most popular',
    packages: [
      { id: 'costa-golf', name: 'Costa Golf', rounds: 2, priceFromEuro: null },
      { id: 'costa-golf-plus', name: 'Costa Golf Plus', rounds: 3, priceFromEuro: null },
      { id: 'ultimate-costa-golf', name: 'Ultimate Costa Golf', rounds: 5, priceFromEuro: null }
    ]
  },
  {
    id: '7-night',
    nights: 7,
    title: '7-night golf holidays',
    badge: 'Full golf week',
    packages: [
      { id: 'golf-week', name: 'Golf Week', rounds: 2, priceFromEuro: null },
      { id: 'golf-week-plus', name: 'Golf Week Plus', rounds: 3, priceFromEuro: null },
      { id: 'ultimate-golf-week', name: 'Ultimate Golf Week', rounds: 5, priceFromEuro: null }
    ]
  }
] as const

export const BUNDLE_PRICES_STORAGE_KEY = 'gsol-bundle-prices-v1'
export const BUNDLE_PRICES_UPDATED_EVENT = 'gsol-bundle-prices-updated'

export type BundlePriceMap = Record<string, number | null>

export function bundlePriceKey(durationId: BundleDurationId, packageId: string, tierId: BundleTierId) {
  return `${durationId}:${packageId}:${tierId}`
}

export function loadBundlePrices(): BundlePriceMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(BUNDLE_PRICES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as BundlePriceMap
  } catch {
    return {}
  }
}

export function saveBundlePrices(prices: BundlePriceMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BUNDLE_PRICES_STORAGE_KEY, JSON.stringify(prices))
  window.dispatchEvent(new CustomEvent(BUNDLE_PRICES_UPDATED_EVENT))
}

export function formatBundlePrice(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price) || price <= 0) return 'From €—'
  return `From €${Math.round(price).toLocaleString('en-IE')}`
}

export function quoteHrefForBundle(opts: {
  readonly durationId: BundleDurationId
  readonly packageName: string
  readonly rounds: number
  readonly nights: number
  readonly tierId?: BundleTierId
}): string {
  const params = new URLSearchParams({
    interest: 'golf-holiday-bundle',
    package: opts.packageName,
    nights: String(opts.nights),
    rounds: String(opts.rounds),
    duration: opts.durationId
  })
  if (opts.tierId) params.set('tier', opts.tierId)
  return `/contact?${params.toString()}`
}
