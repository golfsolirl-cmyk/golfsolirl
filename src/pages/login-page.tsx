import { useEffect, useState, type FormEvent } from 'react'
import { LuxuryButton } from '../components/ui/button'
import { Logo } from '../components/ui/logo'
import { WaveDivider } from '../components/ui/wave-divider'
import { PublicSiteShell } from '../components/public/public-site-shell'
import { integrationRegistry } from '../config/integrations'
import { AUTH_NEXT_STORAGE_KEY, isSafeInternalPath } from '../lib/internal-redirect'
import { usePageMetadata } from '../lib/page-metadata'
import { useAuth } from '../providers/auth-provider'

const LoginHeroBackdrop = () => (
  <>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-fairway-600/25 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-16 left-1/3 h-48 w-48 rounded-full bg-forest-700/30 blur-3xl"
    />
  </>
)

export function LoginPage() {
  const { signInWithMagicLink, session, profile, isLoading, isSupabaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const queryError = params.get('error')
  const queryHint = params.get('hint')
  const nextRaw = params.get('next') ?? ''
  const safeReturnPath = nextRaw && isSafeInternalPath(nextRaw) ? nextRaw : null

  usePageMetadata({
    title: 'Client sign in',
    description: 'Sign in to access your saved GolfSol Ireland packages, proposals, and client trip documents.',
    canonicalPath: '/login',
    noindex: true
  })

  useEffect(() => {
    if (isLoading || !session) {
      return
    }

    if (safeReturnPath) {
      window.location.replace(safeReturnPath)
      return
    }

    if (profile?.role === 'admin') {
      window.location.replace('/dashboard/admin')
      return
    }

    window.location.replace('/dashboard')
  }, [isLoading, session, profile?.role, safeReturnPath])

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
      <PublicSiteShell withCookieBanner={false} withWhatsApp={false}>
        <main id="main" className="bg-offwhite font-body text-forest-900">
          <section className="relative overflow-hidden bg-forest-950 pb-0 pt-[134px] sm:pt-[148px] md:pt-[164px] lg:pt-[130px] xl:pt-[142px]">
          <LoginHeroBackdrop />
          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Account access</p>
            <a aria-label="GolfSol Ireland — home" className="mt-5 inline-block" href="/">
              <Logo size="large" tone="scrolled" />
            </a>
            <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-white md:text-4xl">Sign in</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/88">
              Connect Supabase to enable secure magic-link sign-in.
            </p>
          </div>
          <div className="relative z-[2] -mb-px">
            <WaveDivider fill="#f7f9f5" />
          </div>
          </section>
          <section className="relative z-[1] mx-auto w-full max-w-lg px-4 pb-20 pt-8 md:px-6 md:pb-28">
            <div className="rounded-[2rem] border border-forest-100 bg-white p-8 shadow-soft md:p-10">
              <p className="text-sm leading-relaxed text-forest-700">
                Add <code className="rounded-md border border-forest-200 bg-white px-1.5 py-0.5 text-xs text-forest-900">VITE_SUPABASE_URL</code>{' '}
                and{' '}
                <code className="rounded-md border border-forest-200 bg-white px-1.5 py-0.5 text-xs text-forest-900">VITE_SUPABASE_ANON_KEY</code>{' '}
                to your environment, then restart the dev server.
              </p>
              <LuxuryButton className="mt-8" href="/" variant="primary">
                Back to home
              </LuxuryButton>
            </div>
          </section>
        </main>
      </PublicSiteShell>
    )
  }

  if (isLoading) {
    return (
      <PublicSiteShell withCookieBanner={false} withWhatsApp={false}>
        <main id="main" className="flex min-h-[70vh] items-center justify-center bg-forest-950 px-6 pt-[134px] text-center sm:pt-[148px] md:pt-[164px] lg:pt-[130px] xl:pt-[142px]">
          <div className="flex flex-col items-center">
            <div className="mb-10 scale-90">
              <Logo size="large" tone="scrolled" />
            </div>
            <p className="text-sm font-medium tracking-wide text-white/55">Loading…</p>
          </div>
        </main>
      </PublicSiteShell>
    )
  }

  return (
    <PublicSiteShell withCookieBanner={false} withWhatsApp={false}>
      <main id="main" className="bg-offwhite font-body text-forest-900">
      <section className="relative overflow-hidden bg-forest-950 pb-0 pt-[134px] sm:pt-[148px] md:pt-[164px] lg:pt-[130px] xl:pt-[142px]">
        <LoginHeroBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">Account access</p>
          <a aria-label="GolfSol Ireland — home" className="mt-5 inline-block transition-opacity hover:opacity-95" href="/">
            <Logo size="large" tone="scrolled" />
          </a>
          <h1 className="font-display mt-6 text-[2.2rem] font-bold tracking-[-0.03em] text-white md:text-[2.85rem] md:leading-tight">
            Sign in
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white md:text-lg">
            We&apos;ll email you a secure magic link — the same premium GolfSol Ireland experience as the rest of the
            site. No password to remember.
          </p>
          {safeReturnPath ? (
            <p className="mt-3 max-w-xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-base text-white/90">
              After you sign in, we&apos;ll bring you back to your package so you can save it to your account.
            </p>
          ) : null}
        </div>
        <div className="relative z-[2] -mb-px">
          <WaveDivider fill="#f7f9f5" />
        </div>
      </section>

      <section className="relative z-[1] mx-auto w-full max-w-lg px-4 pb-20 pt-4 md:px-6 md:pb-28 md:pt-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-fairway-500 to-forest-700"
          />

          <div className="px-6 py-9 md:px-10 md:py-11">
            {queryError ? (
              <div className="mb-6 space-y-2 rounded-2xl border border-gold-200/90 bg-gold-50/90 px-4 py-3 text-base text-forest-900">
                <p className="font-medium text-forest-950">
                  {queryError === 'no_session'
                    ? 'We could not complete sign-in from that link. Request a new magic link below.'
                    : queryError === 'auth'
                      ? 'Supabase returned an error for this sign-in attempt.'
                      : 'Something went wrong. Try again.'}
                </p>
                {queryHint ? <p className="text-sm text-forest-700">{decodeURIComponent(queryHint)}</p> : null}
                {queryError === 'no_session' ? (
                  <p className="text-sm text-forest-600">
                    Check Supabase → Authentication → URL configuration: add{' '}
                    <code className="rounded bg-white/80 px-1 py-0.5 text-xs text-forest-900 ring-1 ring-forest-100">
                      {`${window.location.origin}/auth/callback`}
                    </code>{' '}
                    under Redirect URLs, then try again.
                  </p>
                ) : null}
              </div>
            ) : null}

            {sent ? (
              <div className="rounded-2xl border border-forest-200 bg-white px-4 py-4 text-base leading-8 text-forest-900">
                <p className="font-semibold text-forest-950">Check your inbox</p>
                <p className="mt-2 text-forest-700">
                  Open the link from GolfSol Ireland to finish signing in. You can close this tab — the link opens in
                  your browser.
                </p>
              </div>
            ) : (
              <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-forest-900"
                    htmlFor="login-email"
                  >
                    Email
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full rounded-2xl border border-forest-200 bg-offwhite/90 px-4 py-4 text-base text-forest-900 placeholder:text-forest-400 outline-none ring-gold-400/40 transition-shadow focus:border-fairway-500 focus:ring-2"
                    id="login-email"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                {formError ? <p className="text-base font-medium text-red-700">{formError}</p> : null}
                <LuxuryButton
                  className="w-full justify-center"
                  disabled={isSending}
                  type="submit"
                  variant="primary"
                >
                  {isSending ? 'Sending link…' : 'Email me a magic link'}
                </LuxuryButton>
              </form>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 border-t border-forest-100 pt-8 sm:flex-row sm:justify-center sm:gap-4">
              <LuxuryButton className="w-full sm:w-auto" href="/" variant="white">
                ← Back to website
              </LuxuryButton>
            </div>
          </div>
        </div>
      </section>
      </main>
    </PublicSiteShell>
  )
}
