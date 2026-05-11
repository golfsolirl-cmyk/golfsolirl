import { ArrowRight, Sparkles } from 'lucide-react'
import {
  PORTAL_ADD_ON_ICON_STROKE,
  portalAddOnPremiumIcon,
  portalAddOnPremiumTileClass
} from '../lib/portal-add-on-premium-icons'
import type { PortalInterestCategory } from '../lib/portal-interest-tickets'
import { cx } from '../lib/utils'

export function PortalAddToYourTripStrip(props: {
  readonly onSelect: (category: PortalInterestCategory) => void
  /** `loadingOverlay`: stronger lift over blurred dashboard while account data loads */
  readonly variant?: 'page' | 'loadingOverlay'
}) {
  const overlay = props.variant === 'loadingOverlay'
  const TransferGlyph = portalAddOnPremiumIcon('transfers')
  const GolfGlyph = portalAddOnPremiumIcon('golf_courses')
  const HotelGlyph = portalAddOnPremiumIcon('hotels')

  return (
    <section
      aria-label="Request trip add-ons"
      className={cx(
        'relative overflow-hidden rounded-[1.85rem] border border-forest-200/80 bg-[linear-gradient(145deg,#fffefb_0%,#f4faf6_38%,#eef6f0_100%)] px-5 py-6 shadow-[0_20px_50px_-12px_rgba(15,61,46,0.18)] sm:px-7 sm:py-7',
        overlay && 'ring-2 ring-white/90 shadow-[0_28px_90px_-12px_rgba(15,61,46,0.35)]'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold-300/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-fairway-600/10 blur-3xl"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-500" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">Add to your trip</p>
        </div>
        <div className="mt-2 h-px max-w-[7rem] rounded-full bg-gradient-to-r from-gold-400 via-gold-300/80 to-transparent" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-700">
          {overlay ? (
            <>
              You already have trip desk threads — add another request while we finish loading your dashboard.
            </>
          ) : (
            <>
              Request private transfers on the Costa del Sol, extra golf rounds, or hotel and accommodation. We pick this up on
              your existing trip desk thread.
            </>
          )}
        </p>
        <div className={cx('grid gap-3 sm:grid-cols-3 sm:gap-4', overlay ? 'mt-5' : 'mt-6')}>
          <button
            type="button"
            onClick={() => props.onSelect('transfers')}
            className={cx(
              'group relative flex min-h-[5.25rem] flex-col items-start justify-between overflow-hidden rounded-2xl border border-emerald-700/25',
              'bg-gradient-to-br from-emerald-900 via-fairway-700 to-emerald-950 p-4 text-left text-white shadow-lg',
              'transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-950/25',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4faf6]'
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.12)_45%,transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:duration-700"
            />
            <span className="relative flex w-full items-start justify-between gap-2">
              <span
                className={cx(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105',
                  portalAddOnPremiumTileClass('transfers')
                )}
              >
                <TransferGlyph className="h-5 w-5 text-white" strokeWidth={PORTAL_ADD_ON_ICON_STROKE} aria-hidden />
              </span>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-white/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold-200"
                aria-hidden
              />
            </span>
            <span className="relative mt-3 block w-full">
              <span className="font-display text-base font-semibold tracking-tight">Transfers</span>
              <span className="mt-0.5 block text-[0.72rem] font-medium uppercase tracking-[0.12em] text-emerald-100/85">
                Airport · hotel · course
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => props.onSelect('golf_courses')}
            className={cx(
              'group relative flex min-h-[5.25rem] flex-col items-start justify-between overflow-hidden rounded-2xl border border-forest-800/30',
              'bg-gradient-to-br from-forest-950 via-forest-900 to-[#0c2810] p-4 text-left text-white shadow-lg',
              'transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/35 hover:shadow-xl hover:shadow-forest-950/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4faf6]'
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(213,198,0,0.18)_42%,transparent_68%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="relative flex w-full items-start justify-between gap-2">
              <span
                className={cx(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105',
                  portalAddOnPremiumTileClass('golf_courses')
                )}
              >
                <GolfGlyph className="h-5 w-5 text-white" strokeWidth={PORTAL_ADD_ON_ICON_STROKE} aria-hidden />
              </span>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-white/45 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold-300"
                aria-hidden
              />
            </span>
            <span className="relative mt-3 block w-full">
              <span className="font-display text-base font-semibold tracking-tight">Golf courses</span>
              <span className="mt-0.5 block text-[0.72rem] font-medium uppercase tracking-[0.12em] text-gold-100/80">
                Rounds &amp; tee times
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => props.onSelect('hotels')}
            className={cx(
              'group relative flex min-h-[5.25rem] flex-col items-start justify-between overflow-hidden rounded-2xl border border-amber-900/25',
              'bg-gradient-to-br from-[#1a2e22] via-forest-900 to-[#0f2414] p-4 text-left text-white shadow-lg',
              'transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/30 hover:shadow-xl hover:shadow-black/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4faf6]'
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(253,230,138,0.12)_40%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="relative flex w-full items-start justify-between gap-2">
              <span
                className={cx(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105',
                  portalAddOnPremiumTileClass('hotels')
                )}
              >
                <HotelGlyph className="h-5 w-5 text-white" strokeWidth={PORTAL_ADD_ON_ICON_STROKE} aria-hidden />
              </span>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-white/45 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-amber-100"
                aria-hidden
              />
            </span>
            <span className="relative mt-3 block w-full">
              <span className="font-display text-base font-semibold tracking-tight">Accommodation</span>
              <span className="mt-0.5 block text-[0.72rem] font-medium uppercase tracking-[0.12em] text-amber-50/75">
                Hotels &amp; villas
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
