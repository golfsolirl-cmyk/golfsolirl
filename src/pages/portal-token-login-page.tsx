import { useEffect, useMemo, useState } from 'react'
import { MinimalLoginShell } from '../components/minimal-login-shell'

/**
 * Private /portal/:token link — opens the trip desk with no password and no email code.
 */
export function PortalTokenLoginPage() {
  const token = useMemo(() => {
    const parts = window.location.pathname.replace(/\/+$/, '').split('/')
    const idx = parts.indexOf('portal')
    return idx >= 0 && parts[idx + 1] ? decodeURIComponent(parts[idx + 1]) : ''
  }, [])

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    if (!token) {
      setBusy(false)
      setError('This link is not valid.')
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const res = await fetch('/api/portal-token-open', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = (await res.json().catch(() => ({}))) as {
          message?: string
          redirectTo?: string
          path?: string
        }
        if (cancelled) {
          return
        }
        if (!res.ok) {
          setError(data.message || 'This link is not valid or has expired.')
          setBusy(false)
          return
        }
        if (data.redirectTo) {
          window.location.replace(data.redirectTo)
          return
        }
        window.location.replace(data.path || '/dashboard')
      } catch {
        if (!cancelled) {
          setError('Network error. Try again.')
          setBusy(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <MinimalLoginShell
      title={error ? 'Link unavailable' : 'Opening your portal'}
      whatsappMessage="Hi Golf Sol Ireland — my private portal link is not opening."
    >
      {busy && !error ? (
        <p className="font-ge text-base text-forest-700">Opening…</p>
      ) : null}
      {error ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-rose-50 px-3 py-2 font-ge text-sm text-rose-900" role="alert">
            {error}
          </p>
          <a
            className="inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-forest-900 px-4 py-3.5 font-ge text-base font-bold text-white transition hover:bg-forest-800"
            href="/portal"
          >
            Open with email and reference
          </a>
        </div>
      ) : null}
    </MinimalLoginShell>
  )
}
