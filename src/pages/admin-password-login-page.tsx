import { useEffect, useState, type FormEvent } from 'react'
import { MinimalLoginShell } from '../components/minimal-login-shell'
import { isSafeInternalPath } from '../lib/internal-redirect'

export function AdminPasswordLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const params = new URLSearchParams(window.location.search)
  const nextRaw = params.get('next') ?? '/admin'
  const safeNext = nextRaw && isSafeInternalPath(nextRaw) ? nextRaw : '/admin'
  const queryError = params.get('error')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/admin-session-check', { method: 'GET', credentials: 'include' })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
        if (!cancelled && data.ok) {
          window.location.replace(safeNext)
          return
        }
      } catch {
        /* offline */
      } finally {
        if (!cancelled) {
          setCheckingSession(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [safeNext])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string }
      if (!res.ok) {
        const msg =
          data.code === 'ADMIN_LOCKED'
            ? 'Too many attempts. Wait about 15 minutes and try again.'
            : data.code === 'ADMIN_NOT_CONFIGURED'
              ? 'Password sign-in is not set up yet.'
              : data.message || 'Check your email and password.'
        setError(msg)
        return
      }
      window.location.replace(safeNext)
    } catch {
      setError('Network error. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (checkingSession) {
    return (
      <MinimalLoginShell title="Admin sign-in">
        <p className="font-ge text-sm text-forest-600">Checking session…</p>
      </MinimalLoginShell>
    )
  }

  return (
    <MinimalLoginShell helper="Email and password." title="Admin sign-in">
      <form className="space-y-4" noValidate onSubmit={(e) => void onSubmit(e)}>
        {queryError ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 font-ge text-sm text-forest-900" role="status">
            Sign-in could not be completed. Try again.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 font-ge text-sm text-rose-900" role="alert">
            {error}
          </p>
        ) : null}
        <div>
          <label className="mb-1.5 block font-ge text-sm font-semibold text-forest-950" htmlFor="admin-login-email">
            Email
          </label>
          <input
            autoComplete="username"
            className="w-full rounded-xl border border-forest-300 bg-white px-3 py-3 font-ge text-base text-forest-950 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            id="admin-login-email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-ge text-sm font-semibold text-forest-950" htmlFor="admin-login-password">
            Password
          </label>
          <div className="relative">
            <input
              autoComplete="current-password"
              className="w-full rounded-xl border border-forest-300 bg-white px-3 py-3 pr-20 font-ge text-base text-forest-950 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              id="admin-login-password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              className="absolute inset-y-0 right-2 my-auto inline-flex h-9 items-center rounded-lg px-2.5 font-ge text-sm font-semibold text-forest-800 hover:bg-[#f4f7f5]"
              onClick={() => setShowPassword((open) => !open)}
              type="button"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button
          className="inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-forest-900 px-4 py-3.5 font-ge text-base font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </MinimalLoginShell>
  )
}
