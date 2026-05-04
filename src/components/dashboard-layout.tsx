import type { ReactNode } from 'react'
import { PageIdentityBar } from './page-identity-bar'
import { WaveDivider } from './ui/wave-divider'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeFooter } from '../pages/golf-experience/sections/ge-footer'
import { GeDualPhoneNavMobileButtons } from '../pages/golf-experience/components/ge-dual-phone-contact'
import { useAuth } from '../providers/auth-provider'
import { BrandFleetHeroPanel } from './brand-fleet-hero-panel'

export type DashboardVariant = 'client' | 'admin'

interface DashboardLayoutProps {
  readonly title: string
  readonly subtitle?: string
  readonly kicker: string
  readonly variant: DashboardVariant
  /** Optional badge / icon row shown beside the hero title (e.g. client notifications). */
  readonly titleAdornment?: ReactNode
  readonly children: ReactNode
}

export function DashboardLayout({ title, subtitle, kicker, variant, titleAdornment, children }: DashboardLayoutProps) {
  const { signOut, user, profile } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const showAdminNavLink = variant === 'admin' || profile?.role === 'admin'

  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
      <header className="fixed inset-x-0 top-0 z-40 bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="relative mx-auto flex max-w-[1340px] items-center px-4 py-1.5 sm:px-5 lg:justify-between lg:gap-4 lg:py-1">
          <div className="absolute left-2 top-1/2 flex -translate-y-1/2 sm:left-3 lg:hidden">
            <GeDualPhoneNavMobileButtons
              borderClass="border-ge-gray200 text-gs-green"
              hoverClass="hover:border-gs-gold/70 hover:text-gs-gold hover:shadow-[0_0_0_1px_rgba(255,199,44,0.2)]"
            />
          </div>

          <a
            aria-label="GolfSol Ireland home"
            className="mx-auto flex shrink-0 items-center transition-transform duration-300 lg:mx-0"
            href="/#top"
          >
            <GeBrandLockup tone="on-light" mode="sticky" />
          </a>

          <nav aria-label="Dashboard navigation" className="hidden items-center gap-3 lg:flex">
            {showAdminNavLink ? (
              <GeButton
                className="!min-h-0 !border-2 !border-gs-green/35 !bg-gs-green/8 !px-5 !py-2.5 !text-[0.72rem] !normal-case !tracking-[0.06em] !text-gs-green hover:!bg-gs-green/14"
                href={variant === 'admin' ? '/dashboard' : '/dashboard/admin'}
                size="sm"
                variant="outline-gs-green"
              >
                {variant === 'admin' ? 'Client dashboard' : 'Admin dashboard'}
              </GeButton>
            ) : null}
            <GeButton className="!min-h-0 !px-5 !py-2.5 !text-[0.72rem] !normal-case !tracking-[0.06em]" href="/" size="sm" variant="outline-ink">
              Home
            </GeButton>
            <GeButton className="!min-h-0 !px-5 !py-2.5 !text-[0.72rem]" size="sm" variant="gs-gold" type="button" onClick={handleSignOut}>
              Sign out
            </GeButton>
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
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                <h1 className="max-w-3xl text-[2.35rem] font-extrabold leading-[1.04] tracking-[-0.015em] text-white [text-shadow:0_2px_22px_rgba(0,0,0,0.45)] md:text-[3.35rem]">
                  {title}
                </h1>
                {titleAdornment ? <div className="shrink-0">{titleAdornment}</div> : null}
              </div>
              {subtitle ? (
                <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/95 [text-shadow:0_1px_18px_rgba(0,0,0,0.35)] md:text-[1.08rem] md:leading-relaxed">
                  {subtitle}
                </p>
              ) : null}
              {user?.email ? (
                <p className="mt-5 truncate text-sm font-semibold normal-case tracking-normal text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.4)] md:text-base">
                  {user.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:hidden lg:shrink-0 lg:pb-1">
              {showAdminNavLink ? (
                <GeButton
                  className="!min-h-0 !border-2 !border-white/80 !bg-transparent !px-5 !py-2.5 !text-[0.72rem] !text-white hover:!border-gs-gold hover:!bg-gs-gold hover:!text-gs-dark"
                  href={variant === 'admin' ? '/dashboard' : '/dashboard/admin'}
                  size="sm"
                  variant="outline-gs-white"
                >
                  {variant === 'admin' ? 'Client dashboard' : 'Admin dashboard'}
                </GeButton>
              ) : null}
              <GeButton
                className="!min-h-0 !border-2 !border-white/80 !bg-transparent !px-5 !py-2.5 !text-[0.72rem] !text-white hover:!border-gs-gold hover:!bg-gs-gold hover:!text-gs-dark"
                href="/"
                size="sm"
                variant="outline-gs-white"
              >
                Home
              </GeButton>
              <GeButton className="!min-h-0 !px-5 !py-2.5 !text-[0.72rem]" size="sm" variant="gs-gold" type="button" onClick={handleSignOut}>
                Sign out
              </GeButton>
            </div>
          </div>

          <BrandFleetHeroPanel className="mt-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-white/20" />
        </div>

        <div className="relative z-[2] -mb-px">
          <WaveDivider fill="#ffffff" />
        </div>
      </section>

      <PageIdentityBar compact description={subtitle} label={title} tone="ge" />

      <main className="relative z-[1] mx-auto w-full max-w-[1180px] flex-1 px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-12">
        {children}
      </main>

      <GeFooter />
    </div>
  )
}

export function DashboardLoadingShell({ label }: { readonly label: string }) {
  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white text-gs-dark">
      <header className="fixed inset-x-0 top-0 z-40 bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="relative mx-auto flex max-w-[1340px] items-center justify-center px-4 py-1.5 sm:px-5 lg:py-1">
          <a aria-label="GolfSol Ireland home" className="flex shrink-0 items-center" href="/#top">
            <GeBrandLockup tone="on-light" mode="sticky" />
          </a>
        </div>
      </header>
      <PageIdentityBar
        compact
        label={label}
        eyebrow="Loading"
        description="Preparing your dashboard workspace."
        offsetHeader
        tone="ge"
      />
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 text-center">
        <div className="mb-8 scale-[0.92] opacity-95">
          <GeBrandLockup tone="on-light" mode="footer" />
        </div>
        <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-gray500">{label}</p>
      </div>
      <GeFooter />
    </div>
  )
}
