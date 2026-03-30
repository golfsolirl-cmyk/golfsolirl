import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LuxuryButton } from '../components/ui/button'
import { Logo } from '../components/ui/logo'
import { SiteFooter } from '../components/site-footer'
import { WaveDivider } from '../components/ui/wave-divider'
import { integrationRegistry } from '../config/integrations'
import { AUTH_NEXT_STORAGE_KEY, isSafeInternalPath } from '../lib/internal-redirect'
import { useAuth } from '../providers/auth-provider'

const loginFooterIntro =
  'Golf Sol Ireland exists for golfers who want the Costa del Sol done properly: better courses, smarter stays, and a smoother trip from first enquiry to final round.'

const loginFooterCopyrightNote = 'Golf travel planning for Irish groups heading to the Costa del Sol.'

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
  const footerRef = useRef<HTMLElement | null>(null)
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
      <div className="flex min-h-screen flex-col bg-offwhite font-body text-forest-900">
        <section className="relative overflow-hidden bg-forest-950 pb-0">
          <LoginHeroBackdrop />
          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold-200 md:text-xs">Account access</p>
            <a aria-label="Golf Sol Ireland — home" className="mt-5 inline-block" href="/">
              <Logo size="large" tone="scrolled" />
            </a>
            <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-white md:text-4xl">Sign in</h1>
            <p className="mt-3 max-w-xl text-base leading-8 text-white/88 md:text-sm md:leading-relaxed">
              Connect Supabase to enable secure magic-link sign-in.
            </p>
          </div>
          <div className="relative z-[2] -mb-px">
            <WaveDivider fill="#f7f9f5" />
          </div>
        </section>
        <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-8 md:px-6 md:pb-28">
          <div className="rounded-[2rem] border border-forest-100 bg-white p-8 shadow-soft md:p-10">
            <p className="text-base leading-8 text-forest-700 md:text-sm md:leading-relaxed">
              Add <code className="rounded-md bg-forest-50 px-1.5 py-0.5 text-xs text-forest-900">VITE_SUPABASE_URL</code>{' '}
              and{' '}
              <code className="rounded-md bg-forest-50 px-1.5 py-0.5 text-xs text-forest-900">VITE_SUPABASE_ANON_KEY</code>{' '}
              to your environment, then restart the dev server.
            </p>
            <LuxuryButton className="mt-8" href="/" variant="primary">
              Back to home
            </LuxuryButton>
          </div>
        </main>
        <SiteFooter copyrightNote={loginFooterCopyrightNote} footerRef={footerRef} intro={loginFooterIntro} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-forest-950">
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="mb-10 scale-90">
            <Logo size="large" tone="scrolled" />
          </div>
          <p className="text-base font-medium tracking-wide text-white/55 md:text-sm">Loading…</p>
        </div>
        <SiteFooter copyrightNote={loginFooterCopyrightNote} footerRef={footerRef} intro={loginFooterIntro} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-offwhite font-body text-forest-900">
      <section className="relative overflow-hidden bg-forest-950 pb-0">
        <LoginHeroBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold-200 md:text-xs">Account access</p>
          <a aria-label="Golf Sol Ireland — home" className="mt-5 inline-block transition-opacity hover:opacity-95" href="/">
            <Logo size="large" tone="scrolled" />
          </a>
          <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-white md:text-[2.35rem] md:leading-tight">
            Sign in
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white md:text-base md:leading-relaxed">
            We&apos;ll email you a secure magic link — the same premium Golf Sol Ireland experience as the rest of the
            site. No password to remember.
          </p>
          {safeReturnPath ? (
            <p className="mt-3 max-w-xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-base leading-8 text-white/90 md:text-sm md:leading-relaxed">
              After you sign in, we&apos;ll bring you back to your package so you can save it to your account.
            </p>
          ) : null}
        </div>
        <div className="relative z-[2] -mb-px">
          <WaveDivider fill="#f7f9f5" />
        </div>
      </section>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-4 md:px-6 md:pb-28 md:pt-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gold-400 via-fairway-500 to-forest-700"
          />

          <div className="px-6 py-9 md:px-10 md:py-11">
            {queryError ? (
              <div className="mb-6 space-y-2 rounded-2xl border border-gold-200/90 bg-gold-50/90 px-4 py-3 text-base text-forest-900 md:text-sm">
                <p className="font-medium text-forest-950">
                  {queryError === 'no_session'
                    ? 'We could not complete sign-in from that link. Request a new magic link below.'
                    : queryError === 'auth'
                      ? 'Supabase returned an error for this sign-in attempt.'
                      : 'Something went wrong. Try again.'}
                </p>
                {queryHint ? <p className="text-sm leading-7 text-forest-700 md:text-xs">{decodeURIComponent(queryHint)}</p> : null}
                {queryError === 'no_session' ? (
                  <p className="text-sm leading-7 text-forest-600 md:text-xs">
                    Check Supabase → Authentication → URL configuration: add{' '}
                    <code className="rounded bg-white/80 px-1 py-0.5 text-[0.7rem] text-forest-900 ring-1 ring-forest-100">
                      {`${window.location.origin}/auth/callback`}
                    </code>{' '}
                    under Redirect URLs, then try again.
                  </p>
                ) : null}
              </div>
            ) : null}

            {sent ? (
              <div className="rounded-2xl border border-fairway-200 bg-fairway-50/80 px-4 py-4 text-base leading-8 text-forest-800 md:text-sm md:leading-relaxed">
                <p className="font-semibold text-forest-950">Check your inbox</p>
                <p className="mt-2 text-forest-700">
                  Open the link from Golf Sol Ireland to finish signing in. You can close this tab — the link opens in
                  your browser.
                </p>
              </div>
            ) : (
              <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-gold-600 md:text-xs"
                    htmlFor="login-email"
                  >
                    Email
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full rounded-2xl border border-forest-200 bg-offwhite/90 px-4 py-4 text-base text-forest-900 placeholder:text-forest-400 outline-none ring-gold-400/40 transition-shadow focus:border-fairway-500 focus:ring-2 md:py-3.5 md:text-sm"
                    id="login-email"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                {formError ? <p className="text-base font-medium text-red-700 md:text-sm">{formError}</p> : null}
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
      </main>

      <SiteFooter copyrightNote={loginFooterCopyrightNote} footerRef={footerRef} intro={loginFooterIntro} />
    </div>
  )
}
