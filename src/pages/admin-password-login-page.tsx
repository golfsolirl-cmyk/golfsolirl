import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { PremiumHero, PremiumCard, PremiumPageShell } from '../components/premium'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { DEFAULT_ADMIN_LOGIN_EMAIL } from '../lib/admin-login-email'
import { isSafeInternalPath } from '../lib/internal-redirect'

export function AdminPasswordLoginPage() {
  const [email, setEmail] = useState(DEFAULT_ADMIN_LOGIN_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const params = new URLSearchParams(window.location.search)
  const nextRaw = params.get('next') ?? '/dashboard/admin'
  const safeNext = nextRaw && isSafeInternalPath(nextRaw) ? nextRaw : '/dashboard/admin'
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
              ? 'Password sign-in is not set up yet. Use the legacy admin sign-in or configure ADMIN_* env vars.'
              : data.message || 'Sign-in failed. Check your email and password.'
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
      <PremiumPageShell identityLabel="Admin sign-in" identityDescription="Golf Sol Ireland operator dashboard.">
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-24">
          <GeBrandLockup mode="footer" tone="on-light" />
          <p className="mt-8 font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-gray500">Checking session…</p>
        </div>
      </PremiumPageShell>
    )
  }

  return (
    <PremiumPageShell identityLabel="Admin sign-in" identityDescription="Secure operator access for Golf Sol Ireland.">
      <PremiumHero
        body="Use the operator email and password configured for this site. Your session lasts seven days on this device."
        headlineAccent="desk."
        headlinePrimary="Operator"
        kicker="Admin"
        kickerIcon={ShieldCheck}
        lead="Forest green · Gold accent · Secure session"
        variant="login"
      />

      <main className="relative z-[1] mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-12 sm:px-8 md:pb-28">
        <PremiumCard tone="light">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-800 via-gs-green to-gs-gold"
          />

          {queryError ? (
            <div className="mb-6 rounded-2xl border border-brand-700/40 bg-[#fff9e8] px-4 py-3 font-ge text-sm text-gs-dark">
              Sign-in could not be completed. Try again below.
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 font-ge text-sm text-red-900">
              {error}
            </div>
          ) : null}

          <form className="space-y-6" noValidate onSubmit={onSubmit}>
            <div>
              <label
                className="mb-2 block font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-dark"
                htmlFor="admin-login-email"
              >
                Operator email
              </label>
              <input
                autoComplete="username"
                className="w-full rounded-xl border-2 border-ge-gray200 bg-white px-4 py-3.5 font-ge text-base text-gs-dark outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20"
                id="admin-login-email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                className="mb-2 block font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-dark"
                htmlFor="admin-login-password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-ge-gray200 bg-white px-4 py-3.5 pr-24 font-ge text-base text-gs-dark outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20"
                  id="admin-login-password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  className="absolute inset-y-0 right-2 my-auto inline-flex h-10 items-center rounded-lg px-3 font-ge text-sm font-bold text-forest-800 hover:bg-cream"
                  onClick={() => setShowPassword((open) => !open)}
                  type="button"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <GeButton
              className="w-full justify-center gap-2"
              disabled={busy}
              size="lg"
              type="submit"
              variant="gs-green"
            >
              <Lock className="h-4 w-4" aria-hidden />
              {busy ? 'Signing in…' : 'Sign in to admin desk'}
            </GeButton>
          </form>

          <div className="mt-8 space-y-3 border-t border-gs-green/15 pt-6">
            <p className="font-ge text-sm text-ge-gray600">
              <KeyRound className="-mt-0.5 mr-1.5 inline h-4 w-4 text-gs-green" aria-hidden />
              Legacy Supabase operator sign-in is still available if password login is not configured.
            </p>
            <GeButton className="w-full sm:w-auto" href="/dashboard/admin/login" size="sm" variant="outline-gs-green">
              Use legacy admin sign-in
            </GeButton>
            <GeButton className="w-full sm:w-auto" href="/" size="sm" variant="outline-gs-green">
              Back to the homepage
            </GeButton>
          </div>
        </PremiumCard>
      </main>
    </PremiumPageShell>
  )
}