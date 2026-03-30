import type { ReactNode } from 'react'
import { useRef } from 'react'
import { SiteFooter } from './site-footer'
import { LuxuryButton } from './ui/button'
import { Logo } from './ui/logo'
import { WaveDivider } from './ui/wave-divider'
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
    <div className="flex min-h-screen flex-col bg-offwhite font-body text-forest-900">
      <section className="relative overflow-hidden bg-forest-950 pb-0">
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
          className="pointer-events-none absolute bottom-32 left-1/3 h-48 w-48 rounded-full bg-forest-700/30 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10 md:px-6 md:pb-24 md:pt-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200 shadow-sm">{kicker}</p>
              <a
                aria-label="Golf Sol Ireland — home"
                className="mt-5 inline-block max-w-full transition-opacity hover:opacity-95"
                href="/"
              >
                <Logo size="large" tone="scrolled" />
              </a>
              <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-white md:text-[2.35rem] md:leading-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/88 md:text-base">{subtitle}</p>
              ) : null}
              {user?.email ? (
                <p className="mt-4 truncate text-xs font-medium tracking-wide text-white/55 md:text-sm">{user.email}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:shrink-0 lg:pb-1">
              {showAdminNavLink ? (
                <LuxuryButton
                  className="!px-5 !py-2.5 !text-xs"
                  href={variant === 'admin' ? '/dashboard' : '/dashboard/admin'}
                  variant="outline"
                >
                  {variant === 'admin' ? 'Client dashboard' : 'Admin dashboard'}
                </LuxuryButton>
              ) : null}
              <LuxuryButton className="!px-5 !py-2.5 !text-xs" href="/" variant="outline">
                Home
              </LuxuryButton>
              <LuxuryButton
                className="!px-5 !py-2.5 !text-xs"
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

      <main className="relative z-[1] mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 md:px-6 md:pb-28 md:pt-12">
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-forest-950 px-6 text-center">
      <div className="mb-10 scale-90">
        <Logo size="large" tone="scrolled" />
      </div>
      <p className="text-sm font-medium tracking-wide text-white/55">{label}</p>
    </div>
  )
}
