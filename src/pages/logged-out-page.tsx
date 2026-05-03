import { useEffect } from 'react'
import { PageIdentityBar } from '../components/page-identity-bar'
import { WaveDivider } from '../components/ui/wave-divider'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeFooter } from '../pages/golf-experience/sections/ge-footer'
import { GeNavbar } from '../pages/golf-experience/sections/ge-navbar'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { useAuth } from '../providers/auth-provider'

const LoggedOutHeroBackdrop = () => (
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

export function LoggedOutPage() {
  const { session, profile, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading || !session) {
      return
    }
    window.location.replace(profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard')
  }, [isLoading, session, profile?.role])

  if (isLoading) {
    return (
      <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
        <GeNavbar />
        <PageIdentityBar
          compact
          description="You have been signed out of Golf Sol Ireland."
          label="Signed out"
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
        <LoggedOutHeroBackdrop />
        <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-16 pt-6 sm:px-8 md:pb-20 md:pt-8">
          <p className="font-ge text-xs font-bold uppercase tracking-[0.22em] text-gs-gold">Session closed</p>
          <h1 className="mt-5 max-w-3xl font-ge text-[2.1rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-white md:text-[2.85rem]">
            You&apos;re signed out
          </h1>
          <p className="mt-4 max-w-xl font-ge text-base leading-8 text-white/88 md:text-[1.08rem]">
            Thanks for visiting your Golf Sol Ireland workspace. Your session is cleared on this device — same polished
            experience as sign-in, just walking you to the exit.
          </p>
        </div>
        <div className="relative z-[2] -mb-px">
          <WaveDivider fill="#ffffff" />
        </div>
      </section>

      <PageIdentityBar
        compact
        description="You have been securely signed out. Come back any time with your magic link."
        label="Signed out"
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
            <div className="rounded-2xl border border-ge-gray200 bg-ge-gray50 px-4 py-4 font-ge text-base leading-8 text-gs-dark">
              <p className="font-bold text-gs-dark">Successfully logged out</p>
              <p className="mt-2 text-ge-gray600">
                When you&apos;re ready to check quotes, packages, or trip details again, use the button below — we&apos;ll
                send a fresh secure link to your inbox.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <GeButton className="w-full sm:w-auto" href="/login" size="md" variant="gs-gold">
                Sign in again
              </GeButton>
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
