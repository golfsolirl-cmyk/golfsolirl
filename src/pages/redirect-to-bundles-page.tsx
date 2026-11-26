import { useEffect } from 'react'
import { bundleRedirectForPath } from '../lib/bundle-route-redirects'

/** Client-side fold of legacy package URLs into /bundles (or /contact for bespoke). */
export function RedirectToBundlesPage() {
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const target = bundleRedirectForPath(path) ?? '/bundles'
    window.location.replace(target)
  }, [])

  return (
    <main className="flex min-h-[40vh] items-center justify-center bg-cream px-5 font-ge text-sm text-ge-gray600">
      Taking you to our golf holiday bundles…
    </main>
  )
}
