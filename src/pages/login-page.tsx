import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Mail, Send, ShieldCheck } from 'lucide-react'
import { PremiumHero, PremiumCard, PremiumPageShell } from '../components/premium'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { integrationRegistry } from '../config/integrations'
import { AUTH_NEXT_STORAGE_KEY, AUTH_PORTAL_CTX_LABEL_KEY, isSafeInternalPath } from '../lib/internal-redirect'
import { DEFAULT_ADMIN_LOGIN_EMAIL, isAllowedAdminLoginEmail } from '../lib/admin-login-email'
import { useAuth } from '../providers/auth-provider'

/**
 * Login page — premium re-skin using the shared Premium Kit. ALL auth /
 * magic-link / redirect / Supabase logic is preserved character-for-character;
 * only the visual shell is replaced with the homepage design language.
 */

const normalizeLoginPath = () => (window.location.pathname.replace(/\/+$/, '') || '/') as string

export function LoginPage() {
  const sentConfirmationRef = useRef<HTMLDivElement>(null)
  const { signInWithMagicLink, session, profile, isLoading, isSupabaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  /** Shown on `/dashboard/admin/login` — sent only with that portal; verified server-side when `ADMIN_OPERATOR_PASSCODE` is set. */
  const [operatorCode, setOperatorCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [portalCtxBanner, setPortalCtxBanner] = useState<string | null>(null)

  const params = new URLSearchParams(window.location.search)
  const queryError = params.get('error')
  const queryHint = params.get('hint')
  const nextRaw = params.get('next') ?? ''
  const safeReturnPath = nextRaw && isSafeInternalPath(nextRaw) ? nextRaw : null

  useEffect(() => {
    const ctx = new URLSearchParams(window.location.search).get('ctx')?.trim()
    if (!ctx) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const res = await fetch('/api/portal-link-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ctx })
        })
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          accountReferenceId?: string
          portal?: string
          message?: string
        }
        if (cancelled || !data.ok) {
          if (!cancelled && data.message) {
            setPortalCtxBanner(data.message)
          }
          return
        }

        const next = data.portal === 'admin' ? '/dashboard/admin' : '/dashboard'
        try {
          sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, next)
          sessionStorage.setItem(
            AUTH_PORTAL_CTX_LABEL_KEY,
            `Account ${data.accountReferenceId ?? ''} · ${data.portal === 'admin' ? 'Operator sign-in' : 'Client portal sign-in'}`
          )
        } catch {
          /* private mode */
        }

        setPortalCtxBanner(
          `Link verified for account ${data.accountReferenceId ?? ''}. After you sign in from the email we send, you will land on the ${data.portal === 'admin' ? 'admin' : 'client'} dashboard.`
        )

        const p = new URLSearchParams(window.location.search)
        p.delete('ctx')
        const q = p.toString()
        window.history.replaceState(null, '', `${window.location.pathname}${q ? `?${q}` : ''}`)
      } catch {
        if (!cancelled) {
          setPortalCtxBanner('Could not verify this link. You can still request a magic link below.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const loginPathForHero = normalizeLoginPath()
  const isAdminLoginPath = loginPathForHero === '/dashboard/admin/login'
  const isDriverLoginPage = loginPathForHero === '/driver/login'

  useEffect(() => {
    if (isLoading || !session) {
      return
    }

    /** Wait for the profile row before role-based redirects — avoids sending admins to the client dashboard while the row is still loading. */
    if (profile === null) {
      return
    }

    const path = normalizeLoginPath()
    const sp = new URLSearchParams(window.location.search)
    const explicitAs = sp.get('as')?.trim().toLowerCase()

    if (explicitAs === 'client') {
      window.location.replace('/dashboard')
      return
    }

    const operatorEmail = profile.email ?? session.user.email ?? ''
    const canAccessAdmin =
      profile.role === 'admin' && isAllowedAdminLoginEmail(operatorEmail)

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

    if (path === '/dashboard/login') {
      window.location.replace(canAccessAdmin ? '/dashboard/admin' : '/dashboard')
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
  }, [isLoading, session, profile, safeReturnPath])

  useEffect(() => {
    if (sent) {
      sentConfirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [sent])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!email.trim()) {
      setFormError('Enter your email address.')
      return
    }

    const path = normalizeLoginPath()
    const emailNorm = email.trim().toLowerCase()
    const adminInbox = isAllowedAdminLoginEmail(emailNorm)
    const isAdminPortal = path === '/dashboard/admin/login'
    // Server rewrites this to SITE_URL (production) so the email link never opens localhost.
    const callbackBase = `${window.location.origin}/auth/callback`
    let redirectTo = `${callbackBase}`
    if (safeReturnPath && !isAdminPortal) {
      redirectTo = `${callbackBase}?next=${encodeURIComponent(safeReturnPath)}`
    } else if (isAdminPortal || (adminInbox && path !== '/driver/login')) {
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

  // Page-specific copy driven by which login route we're on.
  const heroKicker = isAdminLoginPath ? 'Operations' : isDriverLoginPage ? 'Driver desk' : 'Account access'
  const heroHeadlinePrimary = isAdminLoginPath ? 'Admin' : isDriverLoginPage ? 'Driver' : 'Welcome'
  const heroHeadlineAccent = isAdminLoginPath
    ? 'sign-in.'
    : isDriverLoginPage
      ? 'sign-in.'
      : 'back to your trip.'
  const heroLead = isAdminLoginPath
    ? 'Operator dashboard · Magic link'
    : isDriverLoginPage
      ? 'Live jobs · Same magic link · Driver desk'
      : 'Saved trips · Quotes · Account access'
  const adminHeroBodyPublic =
    'Enter your operator code - we will send a secure sign-in link to your operator inbox.'
  const heroBody = isAdminLoginPath
    ? `${adminHeroBodyPublic} The email link opens the production admin desk on golfsolirl.com.`
    : isDriverLoginPage
      ? 'Same secure magic link as the client portal and admin — after sign-in, admins use the Irish Driver preview desk; linked drivers see live jobs.'
      : "We'll email you a secure magic link — it opens on golfsolirl.com. No password to remember."

  // —— Supabase-not-configured fallback ——
  if (!integrationRegistry.supabase.enabled || !isSupabaseConfigured) {
    return (
      <PremiumPageShell
        identityLabel="Sign in"
        identityDescription="Secure magic-link sign-in for saved trips, proposals, and account access."
      >
        <PremiumHero
          variant="login"
          kicker="Account access"
          kickerIcon={ShieldCheck}
          headlinePrimary="Sign"
          headlineAccent="in."
          lead="Magic link · Secure · No password"
          body="Connect Supabase to enable secure magic-link sign-in."
        />
        <main className="relative z-[1] mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-12 sm:px-8 md:pb-28">
          <PremiumCard tone="light">
            <p className="font-ge text-[1.04rem] leading-[1.72] text-ge-gray500">
              Add{' '}
              <code className="rounded-md border border-ge-gray200 bg-ge-gray50 px-1.5 py-0.5 font-mono text-xs text-gs-dark">
                VITE_SUPABASE_URL
              </code>{' '}
              and{' '}
              <code className="rounded-md border border-ge-gray200 bg-ge-gray50 px-1.5 py-0.5 font-mono text-xs text-gs-dark">
                VITE_SUPABASE_ANON_KEY
              </code>{' '}
              to your environment, then restart the dev server.
            </p>
            <div className="mt-8 border-t border-gs-green/15 pt-6">
              <GeButton className="w-full sm:w-auto" href="/" size="md" variant="gs-green">
                Back to home
              </GeButton>
            </div>
          </PremiumCard>
        </main>
      </PremiumPageShell>
    )
  }

  // —— Loading state ——
  if (isLoading) {
    return (
      <PremiumPageShell
        identityLabel="Sign in"
        identityDescription="Secure magic-link sign-in for saved trips, proposals, and account access."
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-24 sm:pt-28">
          <div className="mb-8 scale-[0.92] opacity-95">
            <GeBrandLockup tone="on-light" mode="footer" />
          </div>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-gray500">Loading…</p>
        </div>
      </PremiumPageShell>
    )
  }

  // —— Main signed-out / sign-in screen ——
  return (
    <PremiumPageShell
      identityLabel="Sign in"
      identityDescription="Secure magic-link sign-in for saved trips, proposals, and account access."
    >
      <PremiumHero
        variant="login"
        kicker={heroKicker}
        kickerIcon={ShieldCheck}
        headlinePrimary={heroHeadlinePrimary}
        headlineAccent={heroHeadlineAccent}
        lead={heroLead}
        body={
          <>
            {heroBody}
            {safeReturnPath ? (
              <span className="mt-4 block max-w-xl rounded-2xl border border-white/18 bg-forest-900 px-4 py-3 font-ge text-base leading-7 text-white/92">
                After you sign in, we&apos;ll bring you back to your package so you can save it to your account.
              </span>
            ) : null}
          </>
        }
        aside="Magic link · No password · Inbox-fast"
      />

      <main className="relative z-[1] mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-12 sm:px-8 md:pb-28">
        <PremiumCard tone="light">
          {!isAdminLoginPath ? (
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-800 via-gs-green to-gs-electric"
            />
          ) : null}

          {portalCtxBanner ? (
            <div className="mb-6 rounded-2xl border border-gs-green/40 bg-ge-gray50 px-4 py-3 font-ge text-sm leading-relaxed text-gs-dark">
              {portalCtxBanner}
            </div>
          ) : null}

          {queryError ? (
            <div className="mb-6 space-y-2 rounded-2xl border border-brand-700/50 bg-[#fff9e8] px-4 py-3 font-ge text-base text-gs-dark">
              <p className="font-bold text-gs-dark">
                {queryError === 'no_session'
                  ? 'We could not complete sign-in from that link. Request a new magic link below.'
                  : queryError === 'auth'
                    ? 'Supabase returned an error for this sign-in attempt.'
                    : 'Something went wrong. Try again.'}
              </p>
              {queryHint ? <p className="text-sm text-ge-gray600">{decodeURIComponent(queryHint)}</p> : null}
              {queryError === 'no_session' ? (
                <p className="text-sm text-ge-gray600">
                  Check Supabase → Authentication → URL configuration: add{' '}
                  <code className="rounded bg-white px-1 py-0.5 font-mono text-xs text-gs-dark ring-1 ring-ge-gray200">
                    {`${window.location.origin}/auth/callback`}
                  </code>{' '}
                  under Redirect URLs, then try again.
                </p>
              ) : null}
            </div>
          ) : null}

          {sent ? (
            <div
              ref={sentConfirmationRef}
              className="rounded-2xl border border-gs-green/30 bg-gs-green/[0.04] px-5 py-5 font-ge text-base leading-8 text-gs-dark"
            >
              <p className="inline-flex items-center gap-2 font-extrabold uppercase tracking-[0.12em] text-gs-dark">
                <Mail className="h-4 w-4 text-gs-green" aria-hidden /> Check your inbox
              </p>
              <p className="mt-2 text-ge-gray600">
                {isAdminLoginPath
                  ? 'Open the link from Golf Sol Ireland — it signs you into the admin desk on golfsolirl.com.'
                  : 'Open the link from Golf Sol Ireland to finish signing in on golfsolirl.com. You can close this tab — the link opens in your browser.'}
              </p>
            </div>
          ) : (
            <form className="space-y-6" noValidate onSubmit={handleSubmit}>
              {isAdminLoginPath ? (
                <div>
                  <label
                    className="mb-2 block font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-dark"
                    htmlFor="login-operator-code"
                  >
                    Operator code
                  </label>
                  <input
                    autoComplete="off"
                    className="w-full rounded-xl border-2 border-ge-gray200 bg-white px-4 py-3.5 font-ge text-base text-gs-dark outline-none transition-[border-color,box-shadow] focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20"
                    id="login-operator-code"
                    name="operatorCode"
                    onChange={(event) => setOperatorCode(event.target.value)}
                    type="password"
                    value={operatorCode}
                  />
                </div>
              ) : null}
              <div>
                <label
                  className="mb-2 block font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-dark"
                  htmlFor="login-email"
                >
                  Email
                </label>
                <input
                  autoComplete="email"
                  className={`w-full rounded-xl border-2 border-ge-gray200 bg-white px-4 py-3.5 font-ge text-base text-gs-dark placeholder:text-ge-gray400 outline-none transition-[border-color,box-shadow] ${
                    isAdminLoginPath
                      ? 'focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20'
                      : 'focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'
                  }`}
                  id="login-email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={isAdminLoginPath ? 'Enter a valid email address' : 'you@example.com'}
                  required
                  type="email"
                  value={email}
                />
              </div>
              {formError ? (
                <p className="font-ge text-base font-semibold text-red-800" role="alert">
                  {formError}
                </p>
              ) : null}
              <GeButton className="w-full" disabled={isSending} size="md" type="submit" variant="gs-green">
                {isSending ? (
                  'Sending link…'
                ) : (
                  <>
                    Email me a magic link
                    <Send className="ml-2 h-4 w-4" aria-hidden />
                  </>
                )}
              </GeButton>
            </form>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-gs-green/15 pt-7 sm:flex-row sm:justify-center sm:gap-4">
            <GeButton className="w-full sm:w-auto" href="/" size="md" variant="outline-gs-green">
              ← Back to website
            </GeButton>
          </div>
        </PremiumCard>
      </main>
    </PremiumPageShell>
  )
}
