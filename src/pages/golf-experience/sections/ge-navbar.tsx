import { useEffect, useState } from 'react'
import { AnimatePresence,  m  } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { prefetchRouteChunk } from '../../../lib/prefetch-route-chunk'
import { cx } from '../../../lib/utils'
import { BrandPlaneToFairwayTagline } from '../../../components/brand-plane-to-fairway-tagline'
import { GeBrandLockup } from '../components/brand-lockup'
import { GeButton } from '../components/ge-button'
import { primaryNav, type GeNavLink } from '../data/nav'
import { GeDualPhoneNavMobileButtons } from '../components/ge-dual-phone-contact'
import { GeMobileGlintIconButton } from '../components/ge-mobile-glint-icon'
import { GeTopBar } from './top-bar'

/** Logged-in client/admin area: extra nav actions alongside primary marketing links. */
export interface GeNavbarPortalSlot {
  readonly variant: 'client' | 'admin' | 'driver'
  /** When true (e.g. profile is admin while on client dashboard), show link to admin dashboard. */
  readonly showAdminDashboardLink: boolean
  readonly onSignOut: () => void | Promise<void>
}

interface GeNavbarProps {
  /** Render mode: 'auto' = sticky-white always (current). The legacy overlay
   *  was retired so the navbar's crest sits flush above the brand-composed
   *  hero image's gold ribbon and reads as one unified piece. */
  readonly mode?: 'auto'
  /** Dashboard / driver portal: append account actions; keep primary site nav + Get Quote. */
  readonly portalSlot?: GeNavbarPortalSlot
}

export function GeNavbar({ mode: _mode = 'auto', portalSlot }: GeNavbarProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  // Always render the solid white sticky bar. The hero image is now its own
  // self-contained brand creative below the navbar.
  const isOverlay = false
  const linkColor = 'text-gs-dark hover:text-gs-primary'

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 overflow-visible transition-all duration-300',
        isOverlay
          ? 'bg-transparent'
          : 'bg-cream shadow-[0_2px_12px_rgba(8,46,35,0.08)]'
      )}
    >
      {isOverlay ? <GeTopBar /> : null}
      <div
        className={cx(
          // Mobile (< lg): 3-column grid — phone | crest | menu share one vertical
          //   alignment axis (no absolute centering drift vs the scaled crest).
          // Desktop (lg+): flex row, brand left, nav right.
          'relative mx-auto w-full max-w-[1340px] overflow-visible px-3 transition-all duration-300 sm:px-5',
          'max-lg:grid max-lg:grid-cols-[auto_minmax(0,1fr)_auto] max-lg:items-center max-lg:gap-x-2 max-lg:gap-y-0',
          'lg:flex lg:items-center lg:justify-between lg:gap-4',
          isOverlay ? 'py-4' : 'py-1.5 max-lg:py-2 lg:py-1'
        )}
      >
        <div className="flex shrink-0 items-center justify-self-start lg:hidden">
          <GeDualPhoneNavMobileButtons
            glint
            lines="irish"
            borderClass="border-ge-gray200 text-gs-green"
            hoverClass="hover:border-brand-700/70 hover:text-brand-700 hover:shadow-[0_0_0_1px_rgba(19, 96, 71,0.2)]"
          />
        </div>

        <a
          href="/#top"
          aria-label="GolfSol Ireland home"
          className="mx-auto flex min-w-0 max-w-full shrink-0 justify-self-center overflow-visible transition-transform duration-300 max-lg:px-1 lg:mx-0 lg:justify-self-auto lg:self-end"
        >
          <GeBrandLockup tone={isOverlay ? 'on-dark' : 'on-light'} mode={isOverlay ? 'overlay' : 'sticky'} />
        </a>

        <div className="flex shrink-0 items-center justify-self-end gap-2 lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-4">
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-x-4 xl:gap-x-5 lg:flex"
          >
            {primaryNav.map((link) => (
              <DesktopNavItem key={link.label} link={link} colorClass={linkColor} />
            ))}
            {portalSlot ? <PortalNavActions portalSlot={portalSlot} layout="desktop" /> : null}
            {!portalSlot ? (
              <GeButton href="/contact" size="sm" variant={isOverlay ? 'outline-gs-white' : 'gs-gold'}>
                Get Quote
              </GeButton>
            ) : null}
          </nav>

          {isOverlay ? (
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="ge-mobile-menu"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/60 text-white transition-colors hover:border-white hover:bg-forest-900 lg:hidden"
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : (
            <GeMobileGlintIconButton
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="ge-mobile-menu"
              className="shrink-0 lg:hidden"
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              {isMenuOpen ? (
                <X className="h-[1.35rem] w-[1.35rem] stroke-[2] sm:h-6 sm:w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-[1.35rem] w-[1.35rem] stroke-[2] sm:h-6 sm:w-6" aria-hidden="true" />
              )}
            </GeMobileGlintIconButton>
          )}
        </div>
      </div>

      {/* Brand ribbon — own row so crest + nav keep their layout; never pushes menu sideways */}
      <div
        className={cx(
          'border-t',
          isOverlay
            ? 'border-white/10 bg-forest-950/40'
            : 'border-brand-700/12 bg-gradient-to-r from-cream via-white to-cream'
        )}
      >
        <div className="mx-auto flex w-full max-w-[1340px] justify-center px-2.5 py-1 sm:px-5 sm:py-1.5 lg:py-1.5">
          <BrandPlaneToFairwayTagline tone={isOverlay ? 'dark' : 'light'} layout="ribbon" className="max-w-full" />
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <m.div
            id="ge-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-t border-ge-gray100 bg-white lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="mx-auto max-w-[1280px] px-5 py-4">
              <ul className="flex flex-col divide-y divide-ge-gray100">
                {primaryNav.map((link) => (
                  <li key={link.label}>
                    {link.children?.length ? (
                      <div>
                        <button
                          type="button"
                          className="flex min-h-[48px] w-full items-center justify-between py-3 text-left font-ge text-sm font-bold uppercase tracking-[0.1em] text-gs-dark"
                          onClick={() =>
                            setOpenSubmenu((current) => (current === link.label ? null : link.label))
                          }
                          aria-expanded={openSubmenu === link.label}
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            className={cx(
                              'h-4 w-4 transition-transform',
                              openSubmenu === link.label ? 'rotate-180' : ''
                            )}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {openSubmenu === link.label ? (
                            <m.ul
                              key="sublist"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pb-3 pl-4"
                            >
                              {link.children.map((child) => (
                                <li key={child.label}>
                                  <a
                                    href={child.href}
                                    className="block min-h-[44px] py-2 text-sm text-ge-gray500 hover:text-gs-green"
                                    onClick={() => setIsMenuOpen(false)}
                                    onFocus={() => prefetchRouteChunk(child.href)}
                                    onMouseEnter={() => prefetchRouteChunk(child.href)}
                                  >
                                    {child.label}
                                  </a>
                                </li>
                              ))}
                            </m.ul>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <a
                        href={link.href}
                        className="block min-h-[48px] py-3 font-ge text-sm font-bold uppercase tracking-[0.1em] text-gs-dark hover:text-gs-green"
                        onClick={() => setIsMenuOpen(false)}
                        onFocus={() => prefetchRouteChunk(link.href)}
                        onMouseEnter={() => prefetchRouteChunk(link.href)}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {portalSlot ? (
                <div className="mt-4 border-t border-ge-gray100 pt-4">
                  <p className="mb-2 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ge-gray500">
                    {portalSlot.variant === 'admin' ? 'Admin' : 'Your account'}
                  </p>
                  <PortalNavActions portalSlot={portalSlot} layout="mobile" />
                </div>
              ) : null}
              {!portalSlot ? (
                <div className="mt-4">
                  <GeButton href="/contact" size="md" variant="gs-green" className="w-full">
                    Get a Quote
                  </GeButton>
                </div>
              ) : null}
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function PortalNavActions({
  portalSlot,
  layout
}: {
  readonly portalSlot: GeNavbarPortalSlot
  readonly layout: 'desktop' | 'mobile'
}) {
  const { variant, showAdminDashboardLink, onSignOut } = portalSlot
  const wrap =
    layout === 'desktop'
      ? 'flex flex-wrap items-center gap-2 xl:gap-3'
      : 'flex flex-col gap-2'

  const btnSm =
    layout === 'desktop'
      ? 'ge-portal-dash-btn !min-h-0 !border-2 !border-gs-green/35 !bg-gs-green/8 !px-4 !py-2 !text-[0.68rem] !normal-case !tracking-[0.06em] !text-black hover:!bg-gs-green/14'
      : 'ge-portal-dash-btn !min-h-0 !w-full !justify-center !border-2 !border-gs-green/35 !bg-gs-green/8 !py-2.5 !text-[0.78rem] !normal-case !tracking-[0.06em] !text-black hover:!bg-gs-green/14'

  const btnOutline =
    layout === 'desktop'
      ? '!min-h-0 !px-4 !py-2 !text-[0.68rem] !normal-case !tracking-[0.06em]'
      : '!min-h-0 !w-full !justify-center !py-2.5 !text-[0.78rem] !normal-case !tracking-[0.06em]'

  const btnGold =
    layout === 'desktop'
      ? '!min-h-0 !px-4 !py-2 !text-[0.68rem]'
      : '!min-h-0 !w-full !justify-center !py-2.5 !text-[0.78rem]'

  return (
    <div className={wrap}>
      {variant === 'driver' ? (
        <GeButton className={btnSm} href="/driver" size="sm" variant="outline-gs-green">
          Driver home
        </GeButton>
      ) : null}
      {variant === 'client' && showAdminDashboardLink ? (
        <GeButton className={btnSm} href="/dashboard/admin" size="sm" variant="outline-gs-green">
          Admin dashboard
        </GeButton>
      ) : null}
      {variant === 'admin' ? (
        <GeButton className={btnSm} href="/dashboard" size="sm" variant="outline-gs-green">
          Client dashboard
        </GeButton>
      ) : null}
      <GeButton className={btnGold} size="sm" variant="gs-green" type="button" onClick={() => void onSignOut()}>
        Sign out
      </GeButton>
    </div>
  )
}

function DesktopNavItem({ link, colorClass }: { readonly link: GeNavLink; readonly colorClass: string }) {
  const [open, setOpen] = useState(false)
  const hasChildren = Boolean(link.children?.length)

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (hasChildren) setOpen(true)
        prefetchRouteChunk(link.href)
        link.children?.forEach((child) => prefetchRouteChunk(child.href))
      }}
      onMouseLeave={() => hasChildren && setOpen(false)}
      onFocus={() => {
        if (hasChildren) setOpen(true)
        prefetchRouteChunk(link.href)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <a
        href={link.href}
        className={cx(
          'inline-flex items-center gap-1 whitespace-nowrap font-ge text-[0.78rem] font-bold uppercase tracking-[0.12em] transition-colors',
          colorClass
        )}
      >
        {link.label}
        {hasChildren ? <ChevronDown className="h-3 w-3" /> : null}
      </a>
      <AnimatePresence>
        {open && hasChildren && link.children ? (
          <m.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-sm border border-ge-gray100 bg-white py-2 shadow-lg"
          >
            {link.children.map((child) => (
              <a
                key={child.label}
                href={child.href}
                className="block px-4 py-2.5 font-ge text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-gs-dark hover:bg-ge-gray50 hover:text-gs-green"
                onFocus={() => prefetchRouteChunk(child.href)}
                onMouseEnter={() => prefetchRouteChunk(child.href)}
              >
                {child.label}
              </a>
            ))}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
