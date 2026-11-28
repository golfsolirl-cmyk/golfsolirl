import { useEffect, useState } from 'react'
import { ExternalLink, Save } from 'lucide-react'
import {
  SITE_REVIEW_URL,
  TRIPADVISOR_DEFAULT_LISTING_URL,
  TRIPADVISOR_SEARCH_FALLBACK_URL,
  clearReviewUrlLocalOverride,
  resolveTripadvisorUrls,
  writeReviewUrlLocalOverride
} from '../data/site-review'
import { GeButton } from '../pages/golf-experience/components/ge-button'

/**
 * Admin field for Tripadvisor listing URL (this-browser override).
 * Production: set VITE_PUBLIC_REVIEW_URL on Vercel; default listing is already live in code.
 */
export function AdminTripadvisorUrlPanel() {
  const [reviewUrl, setReviewUrl] = useState(SITE_REVIEW_URL)
  const [saved, setSaved] = useState(false)
  const resolved = resolveTripadvisorUrls(reviewUrl.trim() === '' ? '' : reviewUrl.trim() || null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('gsol-review-url')
      if (raw === null) {
        setReviewUrl(SITE_REVIEW_URL)
      } else {
        setReviewUrl(raw)
      }
    } catch {
      setReviewUrl(SITE_REVIEW_URL)
    }
  }, [])

  const onSave = () => {
    writeReviewUrlLocalOverride(reviewUrl.trim())
    setSaved(true)
  }

  const onResetDefault = () => {
    clearReviewUrlLocalOverride()
    setReviewUrl(TRIPADVISOR_DEFAULT_LISTING_URL)
    setSaved(true)
  }

  return (
    <section className="rounded-2xl border border-forest-100 bg-cream/40 p-4 sm:p-5">
      <h3 className="font-display text-lg font-semibold text-forest-950">Tripadvisor listing URL</h3>
      <p className="mt-2 text-sm leading-relaxed text-forest-600">
        Live listing is the site default. Paste a new URL here to preview in this browser only. For production, set{' '}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-forest-900">VITE_PUBLIC_REVIEW_URL</code> on
        Vercel (or leave unset to keep the built-in default). Clear the field and save to use the Tripadvisor search
        fallback.
      </p>
      <label className="mb-1 mt-4 block text-xs font-bold uppercase tracking-wider text-forest-700" htmlFor="gsol-ta-url">
        Listing URL
      </label>
      <input
        className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/15"
        id="gsol-ta-url"
        onChange={(e) => {
          setReviewUrl(e.target.value)
          setSaved(false)
        }}
        placeholder={TRIPADVISOR_DEFAULT_LISTING_URL}
        type="url"
        value={reviewUrl}
      />
      <p className="mt-2 text-xs leading-5 text-forest-500">
        Effective now:{' '}
        <a
          className="font-medium text-forest-800 underline underline-offset-2"
          href={resolved.listingUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {resolved.isSearchFallback ? 'Search fallback' : 'Listing'}
          <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden />
        </a>
        {resolved.isSearchFallback ? (
          <span className="block truncate text-forest-400">{TRIPADVISOR_SEARCH_FALLBACK_URL}</span>
        ) : null}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <GeButton className="gap-2" onClick={onSave} size="sm" type="button" variant="gs-green">
          <Save className="h-4 w-4" aria-hidden />
          Save in this browser
        </GeButton>
        <GeButton onClick={onResetDefault} size="sm" type="button" variant="outline-gs-green">
          Reset to live default
        </GeButton>
        {saved ? <span className="text-sm font-medium text-forest-700">Saved.</span> : null}
      </div>
    </section>
  )
}
