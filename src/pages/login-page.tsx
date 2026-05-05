import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PageIdentityBar } from '../components/page-identity-bar'
import { WaveDivider } from '../components/ui/wave-divider'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeFooter } from '../pages/golf-experience/sections/ge-footer'
import { GeNavbar } from '../pages/golf-experience/sections/ge-navbar'
import { BrandFleetHeroPanel } from '../components/brand-fleet-hero-panel'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { integrationRegistry } from '../config/integrations'
import { AUTH_NEXT_STORAGE_KEY, AUTH_PORTAL_CTX_LABEL_KEY, isSafeInternalPath } from '../lib/internal-redirect'
import { useAuth } from '../providers/auth-provider'

const LoginHeroBackdrop = () => (
  <>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-32 top-28 h-80 w-80 rounded-full bg-gs-green/25 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-36 h-72 w-72 rounded-full bg-gs-gold/20 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-32 left-1/3 h-48 w-48 rounded-full bg-ge-orange/20 blur-3xl"
    />
  </>
)

const normalizeLoginPath = () => (window.location.pathname.replace(/\/+$/, '') || '/') as string

export function LoginPage() {
  const sentConfirmationRef = useRef<HTMLDivElement>(null)
  const { signInWithMagicLink, session, profile, isLoading, isSupabaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
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

  useEffect(() => {
    if (isLoading || !session) {
      return
    }

    const path = normalizeLoginPath()
    const sp = new URLSearchParams(window.location.search)
    const explicitAs = sp.get('as')?.trim().toLowerCase()

    if (explicitAs === 'client') {
      window.location.replace('/dashboard')
      return
    }

    if (explicitAs === 'admin') {
      if (profile?.role === 'admin') {
        window.location.replace('/dashboard/admin')
      } else {
        window.location.replace('/dashboard')
      }
      return
    }

    if (safeReturnPath) {
      window.location.replace(safeReturnPath)
      return
    }

    if (path === '/dashboard/login') {
      window.location.replace('/dashboard')
      return
    }

    if (path === '/dashboard/admin/login') {
      if (profile?.role === 'admin') {
        window.location.replace('/dashboard/admin')
      } else {
        window.location.replace('/dashboard')
      }
      return
    }

    if (profile?.role === 'admin') {
      window.location.replace('/dashboard/admin')
      return
    }

    window.location.replace('/dashboard')
  }, [isLoading, session, profile?.role, safeReturnPath])

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

    const callbackBase = `${window.location.origin}/auth/callback`
    const redirectTo = safeReturnPath
      ? `${callbackBase}?next=${encodeURIComponent(safeReturnPath)}`
      : callbackBase

    if (safeReturnPath) {
      try {
        sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, safeReturnPath)
      } catch {
        /* private mode */
      }
    }

    setIsSending(true)
    const { error } = await signInWithMagicLink(email, { redirectTo })
    setIsSending(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setSent(true)
  }

  if (!integrationRegistry.supabase.enabled || !isSupabaseConfigured) {
    return (
      <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
        >
          Skip to content
        </a>
        <GeNavbar />
        <section className="relative overflow-hidden bg-gs-dark pb-0" id="main">
          <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
          <LoginHeroBackdrop />
          <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-16 pt-6 sm:px-8 md:pb-20 md:pt-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_minmax(260px,440px)] lg:items-start lg:gap-12">
              <div className="min-w-0">
                <p className="font-ge text-xs font-bold uppercase tracking-[0.22em] text-gs-gold">Account access</p>
                <h1 className="mt-5 max-w-3xl font-ge text-[2.1rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-white md:text-[2.65rem]">
                  Sign in
                </h1>
                <p className="mt-4 max-w-xl font-ge text-base leading-8 text-white/86 md:text-[1.05rem]">
                  Connect Supabase to enable secure magic-link sign-in.
                </p>
              </div>
              <BrandFleetHeroPanel className="hidden shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-white/25 lg:block" variant="login" />
            </div>
            <BrandFleetHeroPanel className="mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.28)] ring-white/20 lg:hidden" variant="login" />
          </div>
          <div className="relative z-[2] -mb-px">
            <WaveDivider fill="#ffffff" />
          </div>
        </section>
        <PageIdentityBar
          compact
          description="Secure magic-link sign-in for saved trips, proposals, and account access."
          label="Sign in"
          offsetHeader
          tone="ge"
        />
        <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-5 pb-20 pt-6 sm:px-8 md:pb-28 md:pt-8">
          <div className="rounded-2xl border border-ge-gray100 bg-white p-8 shadow-[0_20px_50px_rgba(15,42,12,0.06)] md:p-10">
            <p className="font-ge text-sm leading-relaxed text-ge-gray600 sm:text-[0.95rem]">
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
            <GeButton className="mt-8 w-full sm:w-auto" href="/" size="md" variant="gs-green">
              Back to home
            </GeButton>
          </div>
        </main>
        <GeFooter />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
        <GeNavbar />
        <PageIdentityBar
          compact
          description="Secure magic-link sign-in for saved trips, proposals, and account access."
          label="Sign in"
          offsetHeader
          tone="ge"
        />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-6">
          <div className="mb-8 scale-[0.92] opacity-95">
            <GeBrandLockup tone="on-light" mode="footer" />
          </div>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-gray500">Loading…</p>
        </div>
        <GeFooter />
      </div>
    )
  }

  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <section className="relative overflow-hidden bg-gs-dark pb-0" id="main">
        <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
        <LoginHeroBackdrop />
        <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-16 pt-6 sm:px-8 md:pb-20 md:pt-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(260px,440px)] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <p className="font-ge text-xs font-bold uppercase tracking-[0.22em] text-gs-gold">Account access</p>
              <h1 className="mt-5 max-w-3xl font-ge text-[2.1rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-white md:text-[2.85rem]">
                Sign in
              </h1>
              <p className="mt-4 max-w-xl font-ge text-base leading-8 text-white/88 md:text-[1.08rem]">
                We&apos;ll email you a secure magic link — the same GolfSol Ireland experience as the rest of the site. No
                password to remember.
              </p>
              {safeReturnPath ? (
                <p className="mt-4 max-w-xl rounded-2xl border border-white/18 bg-white/10 px-4 py-3 font-ge text-base leading-7 text-white/92">
                  After you sign in, we&apos;ll bring you back to your package so you can save it to your account.
                </p>
              ) : null}
            </div>
            <BrandFleetHeroPanel className="hidden shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-white/25 lg:block" variant="login" />
          </div>
          <BrandFleetHeroPanel className="mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.28)] ring-white/20 lg:hidden" variant="login" />
        </div>
        <div className="relative z-[2] -mb-px">
          <WaveDivider fill="#ffffff" />
        </div>
      </section>

      <PageIdentityBar
        compact
        description="Secure magic-link sign-in for saved trips, proposals, and account access."
        label="Sign in"
        offsetHeader
        tone="ge"
      />

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-5 pb-20 pt-4 sm:px-8 md:pb-28 md:pt-6">
        <div className="relative overflow-hidden rounded-2xl border border-ge-gray100 bg-white shadow-[0_20px_50px_rgba(15,42,12,0.06)]">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gs-gold via-gs-green to-gs-electric"
          />

          <div className="px-6 py-9 md:px-10 md:py-11">
            {portalCtxBanner ? (
              <div className="mb-6 rounded-2xl border border-gs-green/40 bg-ge-gray50 px-4 py-3 font-ge text-sm leading-relaxed text-gs-dark">
                {portalCtxBanner}
              </div>
            ) : null}

            <p className="mb-6 font-ge text-xs leading-relaxed text-ge-gray600">
              <span className="font-semibold text-gs-dark">Same email, two dashboards?</span> Use{' '}
              <code className="rounded bg-ge-gray50 px-1 font-mono text-[0.7rem] text-gs-dark ring-1 ring-ge-gray200">
                /dashboard/login
              </code>{' '}
              for the client portal and{' '}
              <code className="rounded bg-ge-gray50 px-1 font-mono text-[0.7rem] text-gs-dark ring-1 ring-ge-gray200">
                /dashboard/admin/login
              </code>{' '}
              for operations — or add{' '}
              <code className="rounded bg-ge-gray50 px-1 font-mono text-[0.7rem] text-gs-dark ring-1 ring-ge-gray200">
                ?as=client
              </code>{' '}
              /{' '}
              <code className="rounded bg-ge-gray50 px-1 font-mono text-[0.7rem] text-gs-dark ring-1 ring-ge-gray200">
                ?as=admin
              </code>{' '}
              on this page when already signed in.
            </p>

            {queryError ? (
              <div className="mb-6 space-y-2 rounded-2xl border border-gs-gold/50 bg-[#fff9e8] px-4 py-3 font-ge text-base text-gs-dark">
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
                className="rounded-2xl border border-ge-gray200 bg-ge-gray50 px-4 py-4 font-ge text-base leading-8 text-gs-dark"
              >
                <p className="font-bold text-gs-dark">Check your inbox</p>
                <p className="mt-2 text-ge-gray600">
                  Open the link from GolfSol Ireland to finish signing in. You can close this tab — the link opens in
                  your browser.
                </p>
              </div>
            ) : (
              <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-2 block font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-dark"
                    htmlFor="login-email"
                  >
                    Email
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full rounded-xl border-2 border-ge-gray200 bg-white px-4 py-3.5 font-ge text-base text-gs-dark placeholder:text-ge-gray400 outline-none transition-[border-color,box-shadow] focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    id="login-email"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                {formError ? <p className="font-ge text-base font-semibold text-ge-orange">{formError}</p> : null}
                <GeButton className="w-full" disabled={isSending} size="md" type="submit" variant="gs-gold">
                  {isSending ? 'Sending link…' : 'Email me a magic link'}
                </GeButton>
              </form>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 border-t border-ge-gray100 pt-8 sm:flex-row sm:justify-center sm:gap-4">
              <GeButton className="w-full sm:w-auto" href="/" size="md" variant="outline-gs-green">
                ← Back to website
              </GeButton>
            </div>
          </div>
        </div>
      </main>

      <GeFooter />
    </div>
  )
}
