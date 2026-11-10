import type { ReactNode } from 'react'
import { m } from 'framer-motion'
import {
  BRAND_ADMIN_OPERATIONS_HERO_ALT,
  BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_ALT,
  BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_SRC,
  BRAND_FLEET_HERO_IMAGE_SRC,
  BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
} from '../../../lib/brand-visual-assets'
import { cx } from '../../../lib/utils'
import { GsolGoldCornerAccents } from '../../../components/gsol-gold-corner-accents'
import { GeMarketingHeroPicture } from '../components/ge-marketing-hero-picture'

/** Same resolution as `AdminOperationsHubHero` — respects Vite `base`. */
const ADMIN_PORTAL_HERO_IMG_SRC = `${import.meta.env.BASE_URL}images/admin-operations-hero.webp`

export type GeHeroVariant = 'marketing' | 'portal'

export interface GeHeroProps {
  readonly variant?: GeHeroVariant
  /** Portal: kicker pill, main headline, supporting copy (shown over image bottom). */
  readonly portalKicker?: string
  readonly portalTitle?: string
  readonly portalSubtitle?: string
  readonly portalAdornment?: ReactNode
  /** Portal: live-updating line (e.g. Dublin time). */
  readonly portalTimestamp?: string
  /** Client: bespoke illustration. Admin: operations hero. Driver: twilight + fleet (`classic`). */
  readonly portalBackdrop?: 'client' | 'admin' | 'classic'
}

/**
 * Marketing: responsive hero art (desktop / mobile split from brand composite).
 * Portal: full-bleed imagery + overlays.
 */
export function GeHero({
  variant = 'marketing',
  portalKicker,
  portalTitle,
  portalSubtitle,
  portalAdornment,
  portalTimestamp,
  portalBackdrop = 'classic'
}: GeHeroProps = {}) {
  const isPortal = variant === 'portal'
  return (
    <section
      className={cx(
        'relative isolate',
        isPortal ? 'overflow-hidden bg-gs-dark' : 'overflow-hidden bg-cream'
      )}
      aria-labelledby="ge-hero-title"
      id="top"
    >
      {/* Reserve space under fixed navbar */}
      <div
        aria-hidden="true"
        className="w-full bg-cream"
        style={{ height: 'var(--ge-fixed-header-h)' }}
      />

      <div className={cx('relative w-full', isPortal && 'h-[13.5rem] sm:h-[15rem]')}>
        <GsolGoldCornerAccents preset={isPortal ? 'hero' : 'light'} className="z-[4]" />
        {isPortal && portalBackdrop === 'client' ? (
          <div className="absolute inset-0 z-0">
            <img
              alt={BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_ALT}
              className="h-full w-full scale-[1.02] object-cover object-[center_42%] sm:object-[center_38%]"
              decoding="async"
              fetchPriority="high"
              src={BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_SRC}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-gs-dark/88 via-forest-950/55 to-[#0a1f14]/70"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_70%_20%,rgba(19, 96, 71,0.12),transparent_55%)]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/[0.93] via-gs-dark/50 to-transparent" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`
              }}
            />
          </div>
        ) : isPortal && portalBackdrop === 'admin' ? (
          <div className="absolute inset-0 z-0">
            <img
              alt={BRAND_ADMIN_OPERATIONS_HERO_ALT}
              className="h-full w-full object-cover object-[center_45%] sm:object-[center_40%]"
              decoding="async"
              fetchPriority="high"
              src={ADMIN_PORTAL_HERO_IMG_SRC}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-gs-dark/85 via-forest-950/50 to-[#0a1f14]/68"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_72%_18%,rgba(19, 96, 71,0.1),transparent_55%)]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/[0.92] via-gs-dark/48 to-transparent" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.3] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`
              }}
            />
          </div>
        ) : isPortal ? (
          <>
            <div className="absolute inset-0 z-0">
              <img
                alt=""
                className="h-full w-full object-cover object-center"
                decoding="async"
                fetchPriority="high"
                src={BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-gs-dark/82 via-forest-950/40 to-forest-950/30"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-gs-dark/45 to-gs-dark/20" />
            </div>
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 z-[1] max-h-[min(46vh,380px)] w-auto max-w-[min(96%,520px)] -translate-x-1/2 object-contain object-bottom opacity-[0.97] drop-shadow-[0_28px_80px_rgba(0,0,0,0.6)] sm:left-auto sm:right-[4%] sm:max-h-[min(52vh,460px)] sm:translate-x-0 md:right-[6%]"
              decoding="async"
              src={BRAND_FLEET_HERO_IMAGE_SRC}
            />
          </>
        ) : (
          <>
            <h1
              id="ge-hero-title"
              className="sr-only"
            >
              Premium Costa del Sol golf holidays for Irish travellers
            </h1>
            <GeMarketingHeroPicture className="relative block w-full" />
          </>
        )}

        {isPortal && (portalTitle || portalKicker || portalSubtitle || portalTimestamp) ? (
          <div className="ge-on-dark pointer-events-none absolute inset-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/88 via-gs-dark/45 to-transparent px-0 pb-4 pt-3 sm:pb-5">
            <div className="pointer-events-auto mx-auto w-full max-w-[1180px] px-5 sm:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  {portalKicker ? (
                    <m.p
                      className="inline-flex rounded-full border border-white/25 bg-gradient-to-r from-white/[0.14] to-white/[0.06] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-50 shadow-[0_0_24px_rgba(0,0,0,0.35)] sm:text-sm"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {portalKicker}
                    </m.p>
                  ) : null}
                  {portalTitle ? (
                    <m.h1
                      id="ge-hero-title"
                      className="mt-2 max-w-3xl font-ge text-2xl font-extrabold leading-tight tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-3xl"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {portalTitle}
                    </m.h1>
                  ) : null}
                  {portalTimestamp ? (
                    <m.div
                      className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.12, duration: 0.4 }}
                    >
                      <p className="text-sm font-semibold tabular-nums text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-base">
                        {portalTimestamp}
                      </p>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-white md:text-sm">
                        Ireland (Dublin)
                      </span>
                    </m.div>
                  ) : null}
                  {portalSubtitle ? (
                    <m.p
                      className="mt-1 max-w-2xl border-l-2 border-white/70 pl-3 text-sm font-medium leading-snug text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.55)] sm:text-base"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {portalSubtitle}
                    </m.p>
                  ) : null}
                </div>
                {portalAdornment ? <div className="shrink-0">{portalAdornment}</div> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
