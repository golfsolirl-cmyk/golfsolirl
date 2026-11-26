import { useState, type FormEvent } from 'react'
import { MinimalLoginShell } from '../components/minimal-login-shell'
import { isSafeInternalPath } from '../lib/internal-redirect'

/**
 * TOW-style client portal login: email + booking reference (or open a private /portal/:token link).
 * No password and no email code by default.
 */
export function PortalLoginPage() {
  const params = new URLSearchParams(window.location.search)
  const nextRaw = params.get('next') ?? ''
  const safeNext = nextRaw && isSafeInternalPath(nextRaw) ? nextRaw : null

  const [email, setEmail] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/portal-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          reference: reference.trim(),
          ...(safeNext ? { next: safeNext } : {})
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        error?: string
        redirectTo?: string
        path?: string
      }
      if (!res.ok) {
        setError(
          data.message ||
            data.error ||
            "We couldn't open your portal. Check the email and reference from your confirmation."
        )
        return
      }
      if (data.redirectTo) {
        window.location.replace(data.redirectTo)
        return
      }
      if (data.path) {
        window.location.replace(data.path)
        return
      }
      window.location.replace(safeNext ?? '/dashboard')
    } catch {
      setError('Network error. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <MinimalLoginShell
      helper="Use the email and reference from your confirmation — no password needed."
      title="Open your portal"
      whatsappMessage="Hi Golf Sol Ireland — I need help opening my client portal."
    >
      <form aria-label="Open your portal" className="space-y-4" noValidate onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="mb-1.5 block font-ge text-sm font-semibold text-forest-950" htmlFor="portal-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-forest-300 bg-white px-3 py-3 font-ge text-base text-forest-950 outline-none focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
            id="portal-email"
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-ge text-sm font-semibold text-forest-950" htmlFor="portal-ref">
            Your reference
          </label>
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-forest-300 bg-white px-3 py-3 font-mono text-base uppercase text-forest-950 outline-none focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
            id="portal-ref"
            onChange={(e) => setReference(e.target.value)}
            placeholder="GSI-XXXX-XXXX"
            required
            value={reference}
          />
        </div>
        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 font-ge text-sm text-rose-900" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-forest-900 px-4 py-3.5 font-ge text-base font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? 'Opening…' : 'Open my portal'}
        </button>
      </form>
    </MinimalLoginShell>
  )
}
