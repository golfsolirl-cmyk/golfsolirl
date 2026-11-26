import { useEffect, useState, type FormEvent } from 'react'
import { MinimalLoginShell } from '../components/minimal-login-shell'
import { integrationRegistry } from '../config/integrations'
import { AUTH_NEXT_STORAGE_KEY, isSafeInternalPath } from '../lib/internal-redirect'
import { isAllowedAdminLoginEmail } from '../lib/admin-login-email'
import { useAuth } from '../providers/auth-provider'

const normalizeLoginPath = () => (window.location.pathname.replace(/\/+$/, '') || '/') as string

/**
 * Legacy login routes:
 * - /dashboard/login and /login → redirect to /portal (email + reference)
 * - /dashboard/admin/login → minimal operator magic-link card
 * - /driver/login → minimal driver magic-link card
 */
export function LoginPage() {
  const { signInWithMagicLink, session, profile, isLoading, isSupabaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [operatorCode, setOperatorCode] = useState('')
  const [showOperatorCode, setShowOperatorCode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const queryError = params.get('error')
  const queryHint = params.get('hint')
  const nextRaw = params.get('next') ?? ''
  const safeReturnPath = nextRaw && isSafeInternalPath(nextRaw) ? nextRaw : null

  const path = normalizeLoginPath()
  const isAdminLoginPath = path === '/dashboard/admin/login'
  const isDriverLoginPage = path === '/driver/login'
  const isClientLoginPath = path === '/dashboard/login' || path === '/login'

  useEffect(() => {
    if (!isClientLoginPath) {
      return
    }
    const q = window.location.search
    window.location.replace(`/portal${q || ''}`)
  }, [isClientLoginPath])

  useEffect(() => {
    if (isLoading || !session || isClientLoginPath) {
      return
    }
    if (profile === null) {
      return
    }

    const sp = new URLSearchParams(window.location.search)
    const explicitAs = sp.get('as')?.trim().toLowerCase()
    const operatorEmail = profile.email ?? session.user.email ?? ''
    const canAccessAdmin = profile.role === 'admin' && isAllowedAdminLoginEmail(operatorEmail)

    if (explicitAs === 'client') {
      window.location.replace('/dashboard')
      return
    }
    if (explicitAs === 'admin') {
      window.location.replace(canAccessAdmin ? '/dashboard/admin' : '/dashboard')
      return
    }
    if (explicitAs === 'driver') {
      window.location.replace('/driver')
      return
    }
    if (path === '/driver/login') {
      window.location.replace(profile.role === 'driver' || canAccessAdmin ? '/driver' : '/dashboard')
      return
    }
    if (safeReturnPath) {
      window.location.replace(safeReturnPath)
      return
    }
    if (path === '/dashboard/admin/login') {
      window.location.replace(canAccessAdmin ? '/dashboard/admin' : '/dashboard')
      return
    }
    if (canAccessAdmin) {
      window.location.replace('/dashboard/admin')
      return
    }
    window.location.replace('/dashboard')
  }, [isLoading, session, profile, safeReturnPath, path, isClientLoginPath])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!email.trim()) {
      setFormError('Enter your email address.')
      return
    }

    const emailNorm = email.trim().toLowerCase()
    const adminInbox = isAllowedAdminLoginEmail(emailNorm)
    const callbackBase = `${window.location.origin}/auth/callback`
    let redirectTo = `${callbackBase}`
    if (safeReturnPath && !isAdminLoginPath) {
      redirectTo = `${callbackBase}?next=${encodeURIComponent(safeReturnPath)}`
    } else if (isAdminLoginPath || (adminInbox && path !== '/driver/login')) {
      redirectTo = `${callbackBase}?next=${encodeURIComponent('/dashboard/admin')}`
    } else if (path === '/driver/login') {
      redirectTo = `${callbackBase}?next=${encodeURIComponent('/driver')}`
    }

    try {
      if (safeReturnPath) {
        sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, safeReturnPath)
      } else if (path === '/dashboard/admin/login' || (adminInbox && path !== '/driver/login')) {
        sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, '/dashboard/admin')
      } else if (path === '/driver/login') {
        sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, '/driver')
      }
    } catch {
      /* private mode */
    }

    const portal: 'client' | 'admin' | 'driver' =
      path === '/dashboard/admin/login' ? 'admin' : path === '/driver/login' ? 'driver' : 'client'

    setIsSending(true)
    const { error } = await signInWithMagicLink(email, {
      redirectTo,
      portal,
      ...(portal === 'admin' ? { operatorCode } : {})
    })
    setIsSending(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setSent(true)
  }

  if (isClientLoginPath) {
    return (
      <MinimalLoginShell title="Open your portal">
        <p className="font-ge text-sm text-forest-600">Taking you to sign-in…</p>
      </MinimalLoginShell>
    )
  }

  if (!integrationRegistry.supabase.enabled || !isSupabaseConfigured) {
    return (
      <MinimalLoginShell title={isAdminLoginPath ? 'Admin sign-in' : isDriverLoginPage ? 'Driver sign-in' : 'Sign in'}>
        <p className="font-ge text-sm text-forest-700">Sign-in is not configured on this environment.</p>
        {isAdminLoginPath ? (
          <p className="mt-4 text-center font-ge text-sm text-forest-600">
            Prefer password?{' '}
            <a className="font-semibold text-forest-900 underline underline-offset-2" href="/admin/login">
              Admin password sign-in
            </a>
          </p>
        ) : null}
      </MinimalLoginShell>
    )
  }

  if (isLoading) {
    return (
      <MinimalLoginShell title={isAdminLoginPath ? 'Admin sign-in' : 'Driver sign-in'}>
        <p className="font-ge text-sm text-forest-600">Loading…</p>
      </MinimalLoginShell>
    )
  }

  const title = isAdminLoginPath ? 'Admin sign-in' : 'Driver sign-in'
  const helper = isAdminLoginPath ? 'We’ll email a sign-in link.' : 'We’ll email a driver desk link.'

  return (
    <MinimalLoginShell
      helper={helper}
      title={title}
      whatsappMessage={
        isAdminLoginPath
          ? 'Hi Golf Sol Ireland — I need help with admin sign-in.'
          : 'Hi Golf Sol Ireland — I need help with driver sign-in.'
      }
    >
      {sent ? (
        <p className="rounded-xl bg-[#eef6f1] px-3 py-3 font-ge text-sm leading-6 text-forest-900" role="status">
          Check your inbox for the sign-in link.
        </p>
      ) : (
        <form className="space-y-4" noValidate onSubmit={(e) => void handleSubmit(e)}>
          {queryError ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 font-ge text-sm text-forest-900" role="status">
              {queryError === 'no_session'
                ? 'That link did not complete sign-in. Request a new one below.'
                : 'Something went wrong. Try again.'}
              {queryHint ? ` ${decodeURIComponent(queryHint)}` : ''}
            </p>
          ) : null}

          {isAdminLoginPath ? (
            <div>
              <label
                className="mb-1.5 block font-ge text-sm font-semibold text-forest-950"
                htmlFor="login-operator-code"
              >
                Operator code
              </label>
              <div className="relative">
                <input
                  autoComplete="off"
                  className="w-full rounded-xl border border-forest-300 bg-white px-3 py-3 pr-20 font-ge text-base text-forest-950 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
                  id="login-operator-code"
                  name="operatorCode"
                  onChange={(event) => setOperatorCode(event.target.value)}
                  type={showOperatorCode ? 'text' : 'password'}
                  value={operatorCode}
                />
                <button
                  className="absolute inset-y-0 right-2 my-auto inline-flex h-9 items-center rounded-lg px-2.5 font-ge text-sm font-semibold text-forest-800 hover:bg-[#f4f7f5]"
                  onClick={() => setShowOperatorCode((open) => !open)}
                  type="button"
                >
                  {showOperatorCode ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block font-ge text-sm font-semibold text-forest-950" htmlFor="login-email">
              Email
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-forest-300 bg-white px-3 py-3 font-ge text-base text-forest-950 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              id="login-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              required
              type="email"
              value={email}
            />
          </div>

          {formError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 font-ge text-sm text-rose-900" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            className="inline-flex w-full min-h-12 items-center justify-center rounded-xl bg-forest-900 px-4 py-3.5 font-ge text-base font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
            disabled={isSending}
            type="submit"
          >
            {isSending ? 'Sending…' : 'Email me a sign-in link'}
          </button>

          {isAdminLoginPath ? (
            <p className="text-center font-ge text-sm text-forest-600">
              Prefer password?{' '}
              <a className="font-semibold text-forest-900 underline underline-offset-2" href="/admin/login">
                Admin password sign-in
              </a>
            </p>
          ) : null}
        </form>
      )}
    </MinimalLoginShell>
  )
}
