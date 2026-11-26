import { useCallback, useEffect, useMemo, useState } from 'react'
import { Save, Tag } from 'lucide-react'
import {
  BUNDLE_DURATIONS,
  BUNDLE_TIERS,
  bundlePriceKey,
  loadBundlePrices,
  saveBundlePrices,
  type BundlePriceMap
} from '../data/golf-holiday-bundles'
import { SITE_REVIEW_URL } from '../data/site-review'
import { GeButton } from '../pages/golf-experience/components/ge-button'

const REVIEW_URL_STORAGE_KEY = 'gsol-review-url'

export function AdminBundlePricesPanel() {
  const [prices, setPrices] = useState<BundlePriceMap>(() => loadBundlePrices())
  const [reviewUrl, setReviewUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPrices(loadBundlePrices())
    try {
      const stored = window.localStorage.getItem(REVIEW_URL_STORAGE_KEY)
      setReviewUrl(stored?.trim() || SITE_REVIEW_URL)
    } catch {
      setReviewUrl(SITE_REVIEW_URL)
    }
  }, [])

  const rows = useMemo(
    () =>
      BUNDLE_DURATIONS.flatMap((duration) =>
        duration.packages.flatMap((pkg) =>
          BUNDLE_TIERS.map((tier) => ({
            key: bundlePriceKey(duration.id, pkg.id, tier.id),
            duration,
            pkg,
            tier
          }))
        )
      ),
    []
  )

  const onPriceChange = useCallback((key: string, raw: string) => {
    const trimmed = raw.trim()
    const next =
      trimmed === '' ? null : Number.isFinite(Number(trimmed)) && Number(trimmed) > 0 ? Math.round(Number(trimmed)) : null
    setPrices((prev) => ({ ...prev, [key]: next }))
    setSaved(false)
  }, [])

  const onSave = () => {
    saveBundlePrices(prices)
    try {
      window.localStorage.setItem(REVIEW_URL_STORAGE_KEY, reviewUrl.trim())
    } catch {
      /* private mode */
    }
    setSaved(true)
  }

  return (
    <section className="rounded-2xl border border-forest-100 bg-cream/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-gs-green" aria-hidden />
        <h3 className="font-display text-lg font-semibold text-forest-950">Bundle prices (local preview)</h3>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-forest-600">
        Stored in this browser only. Leave blank to show “Get a quote” on the public bundles page. Prices are not pushed to
        the server.
      </p>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-forest-700" htmlFor="gsol-review-url">
          Public review URL
        </label>
        <input
          className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/15"
          id="gsol-review-url"
          onChange={(e) => {
            setReviewUrl(e.target.value)
            setSaved(false)
          }}
          placeholder="https://…"
          type="url"
          value={reviewUrl}
        />
      </div>

      <div className="max-h-[min(28rem,50vh)] overflow-auto rounded-xl border border-forest-100 bg-white">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="sticky top-0 bg-forest-900 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">Package</th>
              <th className="px-3 py-2 font-semibold">Tier</th>
              <th className="px-3 py-2 font-semibold">€ from</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, duration, pkg, tier }) => (
              <tr className="border-t border-forest-50" key={key}>
                <td className="px-3 py-2 text-forest-800">
                  {duration.title} · {pkg.name}
                </td>
                <td className="px-3 py-2 text-forest-600">{tier.label}</td>
                <td className="px-3 py-2">
                  <input
                    aria-label={`Price for ${pkg.name} ${tier.label}`}
                    className="w-28 rounded-lg border border-forest-200 px-2 py-1.5 font-mono text-sm outline-none focus:border-forest-600"
                    inputMode="numeric"
                    onChange={(e) => onPriceChange(key, e.target.value)}
                    placeholder="—"
                    value={prices[key] ?? ''}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <GeButton className="gap-2" onClick={onSave} size="sm" type="button" variant="gs-green">
          <Save className="h-4 w-4" aria-hidden />
          Save in this browser
        </GeButton>
        {saved ? <span className="text-sm font-medium text-forest-700">Saved.</span> : null}
      </div>
    </section>
  )
}