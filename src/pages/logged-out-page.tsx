import { useEffect } from 'react'
import { LogIn, ShieldCheck } from 'lucide-react'
import { PremiumHero, PremiumCard, PremiumPageShell } from '../components/premium'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { useAuth } from '../providers/auth-provider'

/**
 * Logged-out — premium re-skin using the shared Premium Kit so the page
 * inherits the same hero language as the homepage. Auth / redirect logic
 * is preserved; only the visual shell is replaced.
 */
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
      <PremiumPageShell
        identityLabel="Signed out"
        identityDescription="You have been signed out of Golf Sol Ireland."
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

  return (
    <PremiumPageShell
      identityLabel="Signed out"
      identityDescription="You have been securely signed out. Come back any time with your magic link."
    >
      <PremiumHero
        variant="loggedOut"
        kicker="Session closed"
        kickerIcon={ShieldCheck}
        headlinePrimary="You're"
        headlineAccent="signed out."
        lead="Same crew · Same number · Whenever you're back."
        body={
          <>
            Thanks for visiting your <span className="font-extrabold">Golf Sol Ireland</span> workspace.
            Your session is cleared on this device — same polished experience as sign-in, just walking
            you to the exit.
          </>
        }
        primaryCta={{
          label: 'Sign in again',
          href: '/dashboard/login',
          variant: 'gs-green',
          icon: LogIn
        }}
        secondaryCta={{
          label: '← Back to website',
          href: '/',
          variant: 'outline-gs-white'
        }}
        aside="Magic link · No password · Inbox-fast"
      />

      <main className="relative z-[1] mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-12 sm:px-8 md:pb-28">
        <PremiumCard tone="light">
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-green">
            Successfully logged out
          </p>
          <p className="mt-3 font-ge text-[1.04rem] leading-[1.72] text-ge-gray500 sm:text-[1.08rem]">
            When you're ready to check quotes, packages, or trip details again, use the buttons
            below — we'll send a fresh secure link to your inbox.
          </p>

          <div className="mt-8 flex flex-col gap-3 border-t border-gs-green/15 pt-7 sm:flex-row sm:flex-wrap">
            <GeButton className="w-full sm:w-auto" href="/dashboard/login" size="md" variant="gs-green">
              Sign in again
            </GeButton>
            <GeButton className="w-full sm:w-auto" href="/" size="md" variant="outline-gs-green">
              ← Back to website
            </GeButton>
          </div>
        </PremiumCard>
      </main>
    </PremiumPageShell>
  )
}
