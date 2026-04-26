import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Phone } from 'lucide-react'
import { PageIdentityBar } from './page-identity-bar'
import { SiteFooter } from './site-footer'
import { LuxuryButton } from './ui/button'
import { WaveDivider } from './ui/wave-divider'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { contactInfo } from '../pages/golf-experience/data/copy'
import { useAuth } from '../providers/auth-provider'

const dashboardFooterIntro =
  'Golf Sol Ireland exists for golfers who want the Costa del Sol done properly: better courses, smarter stays, and a smoother trip from first enquiry to final round.'

const dashboardFooterCopyrightNote = 'Golf travel planning for Irish groups heading to the Costa del Sol.'

export type DashboardVariant = 'client' | 'admin'

interface DashboardLayoutProps {
  readonly title: string
  readonly subtitle?: string
  readonly kicker: string
  readonly variant: DashboardVariant
  readonly children: ReactNode
}

export function DashboardLayout({ title, subtitle, kicker, variant, children }: DashboardLayoutProps) {
  const { signOut, user, profile } = useAuth()
  const footerRef = useRef<HTMLElement | null>(null)

  const handleSignOut = async () => {
    await signOut()
  }

  const showAdminNavLink = variant === 'admin' || profile?.role === 'admin'

  return (
    <div className="ge-page flex min-h-screen flex-col bg-white font-ge text-gs-dark">
      <header className="fixed inset-x-0 top-0 z-40 bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="relative mx-auto flex max-w-[1340px] items-center px-4 py-1.5 sm:px-5 lg:justify-between lg:gap-4 lg:py-1">
          <a
            href={`tel:${contactInfo.phoneTel}`}
            aria-label={`Call ${contactInfo.phoneDisplay}`}
            className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ge-gray200 text-gs-green transition-colors hover:border-gs-gold/70 hover:text-gs-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold focus-visible:ring-offset-2 sm:left-5 lg:hidden"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
          </a>

          <a
            aria-label="GolfSol Ireland home"
            className="mx-auto flex shrink-0 items-center transition-transform duration-300 lg:mx-0"
            href="/#top"
          >
            <GeBrandLockup tone="on-light" mode="sticky" />
          </a>

          <nav aria-label="Dashboard navigation" className="hidden items-center gap-3 lg:flex">
            {showAdminNavLink ? (
              <LuxuryButton
                className="!border-gs-green/20 !bg-gs-green/5 !px-5 !py-2.5 !text-xs !text-gs-green hover:!bg-gs-green/10"
                href={variant === 'admin' ? '/dashboard' : '/dashboard/admin'}
                variant="white"
              >
                {variant === 'admin' ? 'Client dashboard' : 'Admin dashboard'}
              </LuxuryButton>
            ) : null}
            <LuxuryButton
              className="!border-gs-green/20 !bg-white !px-5 !py-2.5 !text-xs !text-gs-dark hover:!bg-ge-gray50"
              href="/"
              variant="white"
            >
              Home
            </LuxuryButton>
            <LuxuryButton
              className="!bg-gs-gold !px-5 !py-2.5 !text-xs !text-gs-dark hover:!bg-gs-gold-light"
              type="button"
              variant="primary"
              onClick={handleSignOut}
            >
              Sign out
            </LuxuryButton>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gs-dark pb-0">
        <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
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

        <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-16 pt-10 sm:px-8 md:pb-20 md:pt-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="inline-flex rounded-full border border-gs-gold/35 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-gs-gold shadow-sm backdrop-blur">
                {kicker}
              </p>
              <h1 className="mt-6 max-w-3xl text-[2.35rem] font-extrabold leading-[1.04] tracking-[-0.015em] text-white md:text-[3.35rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/86 md:text-[1.08rem]">{subtitle}</p>
              ) : null}
              {user?.email ? (
                <p className="mt-5 truncate text-xs font-bold uppercase tracking-[0.16em] text-white/55 md:text-sm">{user.email}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:hidden lg:shrink-0 lg:pb-1">
              {showAdminNavLink ? (
                <LuxuryButton
                  className="!border-white/25 !px-5 !py-2.5 !text-xs"
                  href={variant === 'admin' ? '/dashboard' : '/dashboard/admin'}
                  variant="outline"
                >
                  {variant === 'admin' ? 'Client dashboard' : 'Admin dashboard'}
                </LuxuryButton>
              ) : null}
              <LuxuryButton className="!border-white/25 !px-5 !py-2.5 !text-xs" href="/" variant="outline">
                Home
              </LuxuryButton>
              <LuxuryButton
                className="!bg-gs-gold !px-5 !py-2.5 !text-xs !text-gs-dark hover:!bg-gs-gold-light"
                type="button"
                variant="primary"
                onClick={handleSignOut}
              >
                Sign out
              </LuxuryButton>
            </div>
          </div>
        </div>

        <div className="relative z-[2] -mb-px">
          <WaveDivider fill="#f7f9f5" />
        </div>
      </section>

      <PageIdentityBar compact description={subtitle} label={title} />

      <main className="relative z-[1] mx-auto w-full max-w-[1180px] flex-1 px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-12">
        {children}
      </main>

      <SiteFooter
        copyrightNote={dashboardFooterCopyrightNote}
        footerRef={footerRef}
        intro={dashboardFooterIntro}
      />
    </div>
  )
}

export function DashboardLoadingShell({ label }: { readonly label: string }) {
  return (
    <div className="ge-page min-h-screen bg-gs-dark text-white">
      <PageIdentityBar compact label={label} eyebrow="Loading" description="Preparing your dashboard workspace." />
      <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-6 text-center">
        <div className="mb-10 scale-90">
          <GeBrandLockup tone="on-dark" mode="footer" />
        </div>
        <p className="text-base font-medium tracking-[0.02em] text-white/72">{label}</p>
      </div>
    </div>
  )
}
