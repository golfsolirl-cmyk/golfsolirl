import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GeNavbar, type GeNavbarPortalSlot } from '../pages/golf-experience/sections/ge-navbar'
import { GeHero } from '../pages/golf-experience/sections/hero'
import { GeFooter } from '../pages/golf-experience/sections/ge-footer'
import { GeBrandLockup } from '../pages/golf-experience/components/brand-lockup'
import { WhatsappFab } from '../pages/golf-experience/components/whatsapp-fab'
import { useAuth } from '../providers/auth-provider'

export type DashboardVariant = 'client' | 'admin' | 'driver'

interface DashboardLayoutProps {
  readonly title: string
  readonly subtitle?: string
  readonly kicker: string
  readonly variant: DashboardVariant
  /** Optional badge / icon row shown beside the hero title (e.g. client notifications). */
  readonly titleAdornment?: ReactNode
  readonly children: ReactNode
}

/** Client-area hero clock — readable US-style date + 12h time (Ireland timezone). */
const dublinTimestamp = () => {
  const now = new Date()
  const dateLine = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Dublin',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now)
  const timeLine = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Dublin',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(now)
  return `${dateLine} at ${timeLine}`
}

export function DashboardLayout({ title, subtitle, kicker, variant, titleAdornment, children }: DashboardLayoutProps) {
  const { signOut, profile } = useAuth()
  const [clock, setClock] = useState(dublinTimestamp)

  useEffect(() => {
    const id = window.setInterval(() => setClock(dublinTimestamp()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [signOut])

  const portalSlot: GeNavbarPortalSlot = useMemo(
    () => ({
      variant: variant === 'driver' ? 'driver' : variant,
      showAdminDashboardLink: variant === 'client' && profile?.role === 'admin',
      onSignOut: handleSignOut
    }),
    [variant, profile?.role, handleSignOut]
  )

  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
      <GeNavbar portalSlot={portalSlot} />

      <main id="main" className="flex flex-1 flex-col">
        <GeHero
          variant="portal"
          portalBackdrop={variant === 'client' ? 'client' : variant === 'admin' ? 'admin' : 'classic'}
          portalKicker={kicker}
          portalTitle={title}
          portalTimestamp={clock}
          portalSubtitle={subtitle}
          portalAdornment={titleAdornment}
        />

        <div className="relative z-[1] mx-auto w-full max-w-[1180px] flex-1 px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-12">
          {children}
        </div>
      </main>

      <GeFooter />
      <WhatsappFab />
    </div>
  )
}

export function DashboardLoadingShell({ label }: { readonly label: string }) {
  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white text-gs-dark">
      <GeNavbar />
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
        <div className="mb-8 scale-[0.92] opacity-95">
          <GeBrandLockup tone="on-light" mode="footer" />
        </div>
        <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-gray500">{label}</p>
      </main>
      <GeFooter />
    </div>
  )
}
