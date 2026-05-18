import { m, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cx } from '../../../lib/utils'

/** Brand tokens — bespoke mustard / forest / cream. */
const FOREST = 'rgb(11, 77, 59)'
const CREAM = 'rgb(252, 250, 243)'

const EASE_LUX = [0.22, 1, 0.36, 1] as const
const TRANSITION = { duration: 0.4, ease: EASE_LUX }

/** Executive transfer van — side profile (filled). */
function VanSilhouetteFilled({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="currentColor"
        d="M6 58V34c0-3.5 2.8-6.3 6.3-6.3h36L64 15c1.8-2.6 4.7-4.2 7.8-4.2h78c7.8 0 14.8 4.5 18.2 11.4l14 25.2c.8 1.4 1.2 3 1.2 4.6V52c0 3.3-2.7 6-6 6h-11a5 5 0 01-5-5v-1a5 5 0 00-5-5H73a5 5 0 00-5 5v1a5 5 0 01-5 5H12.3A6.3 6.3 0 016 58z"
      />
      <path fill="currentColor" fillOpacity="0.28" d="M76 20h68a6 6 0 0 1 6 6v10H79l-3-9a5 5 0 0 0-4.7-3.4H76z" />
      <circle cx="58" cy="58" r="9" fill="currentColor" fillOpacity="0.35" />
      <circle cx="168" cy="58" r="9" fill="currentColor" fillOpacity="0.35" />
    </svg>
  )
}

/** Same profile — stroke-only for glass CTA. */
function VanSilhouetteOutline({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 76" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M6 58V34c0-3.5 2.8-6.3 6.3-6.3h36L64 15c1.8-2.6 4.7-4.2 7.8-4.2h78c7.8 0 14.8 4.5 18.2 11.4l14 25.2c.8 1.4 1.2 3 1.2 4.6V52c0 3.3-2.7 6-6 6h-11a5 5 0 01-5-5v-1a5 5 0 00-5-5H73a5 5 0 00-5 5v1a5 5 0 01-5 5H12.3A6.3 6.3 0 016 58z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeOpacity="0.45"
        d="M76 20h68a6 6 0 0 1 6 6v10H79l-3-9a5 5 0 0 0-4.7-3.4H76z"
      />
      <circle cx="58" cy="58" r="8.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="168" cy="58" r="8.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  )
}

export function GeHeroLuxuryCtas({ pageContext = 'default' }: { readonly pageContext?: 'default' | 'brandMustard' }) {
  const reduceMotion = useReducedMotion()
  const onMustard = pageContext === 'brandMustard'

  return (
    <section
      className={cx(
        'relative isolate overflow-hidden',
        onMustard
          ? 'border-t border-brand-forest/10 bg-transparent py-6 sm:py-8'
          : 'border-t border-white/[0.08] bg-gradient-to-b from-[#020807] via-[#061f18] to-[#030806]'
      )}
      aria-labelledby="luxury-hero-cta-heading"
    >
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute inset-0',
          onMustard ? 'opacity-0' : 'bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(214,168,62,0.14),transparent_55%)]'
        )}
      />
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute inset-0',
          onMustard ? 'opacity-0' : 'bg-[radial-gradient(ellipse_70%_40%_at_80%_100%,rgba(11,77,59,0.55),transparent_50%)]'
        )}
      />
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute inset-0 mix-blend-overlay',
          onMustard ? 'opacity-0' : 'opacity-[0.07]'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`
        }}
      />

      <div
        className={cx(
          'relative z-[1] mx-auto w-full max-w-[1400px] px-4 sm:px-8',
          onMustard ? 'rounded-[28px] border border-brand-forest/10 bg-brand-cream/95 py-6 shadow-brand-card sm:py-8' : 'py-8 sm:py-10'
        )}
      >
        <h2 id="luxury-hero-cta-heading" className="sr-only">
          Book a transfer or explore services
        </h2>

        <m.div
          className="relative"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_LUX, delay: 0.04 }}
        >
          <m.div
            className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-stretch sm:justify-center sm:gap-6"
            animate={reduceMotion ? {} : { y: [0, -3, 0] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
          >
          {/* Primary — metallic gold, van mark, shimmer */}
          <m.a
            href="/contact"
            className={cx(
              'ge-luxury-cta-primary group relative flex min-h-[88px] w-full flex-1 items-center overflow-hidden rounded-[28px] sm:min-h-[110px] sm:max-w-xl sm:flex-initial sm:min-w-[min(100%,420px)] lg:min-w-[460px]',
              'shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]',
              'transition-shadow duration-[400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              'hover:shadow-[0_16px_52px_rgba(0,0,0,0.5),0_0_48px_rgba(214,168,62,0.42),0_0_0_1px_rgba(255,255,255,0.1)_inset]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(214,168,62)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030806]'
            )}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={TRANSITION}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[rgb(236,200,95)] via-[rgb(214,168,62)] to-[rgb(165,118,38)]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/25 opacity-90"
            />
            <span
              aria-hidden
              className="absolute inset-0 shadow-[inset_0_3px_28px_rgba(0,0,0,0.38),inset_0_-2px_12px_rgba(255,255,255,0.18)]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.06)_58%,transparent_72%)] opacity-60"
            />
            {/* Shimmer sweep — CSS keyframes triggered on hover/focus */}
            <span
              aria-hidden
              className="ge-luxury-cta-shimmer-layer pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-14deg] bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 mix-blend-overlay"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100 group-hover:duration-300"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"
            />

            <span className="relative z-[1] flex w-full items-center gap-4 px-5 py-3 sm:gap-6 sm:px-8 sm:py-4">
              <span
                className="flex h-[52px] w-[4.25rem] shrink-0 items-center justify-center text-[rgb(11,77,59)] opacity-[0.92] drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] sm:h-[64px] sm:w-[5.25rem]"
                style={{ color: FOREST }}
              >
                <VanSilhouetteFilled className="h-full w-full" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                <span
                  className="font-display text-[clamp(1.05rem,2.8vw,1.45rem)] font-black leading-[1.05] tracking-[-0.02em]"
                  style={{ color: FOREST }}
                >
                  Book Your Transfer
                </span>
                <span
                  className="hidden font-ge text-[0.68rem] font-semibold uppercase tracking-[0.18em] sm:block"
                  style={{ color: FOREST, opacity: 0.72 }}
                >
                  Private airport chauffeur
                </span>
              </span>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgb(11,77,59)]/20 bg-[rgb(11,77,59)]/10 text-[rgb(11,77,59)] shadow-inner transition-transform duration-500 group-hover:translate-x-0.5 group-hover:bg-[rgb(11,77,59)]/18 sm:h-14 sm:w-14"
                aria-hidden
              >
                <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} />
              </span>
            </span>
          </m.a>

          {/* Secondary — glass outline, forest hover */}
          <m.a
            href="/services/transport"
            className={cx(
              'ge-luxury-cta-secondary group relative flex min-h-[88px] w-full flex-1 items-center overflow-hidden rounded-[28px] sm:min-h-[110px] sm:max-w-xl sm:flex-initial sm:min-w-[min(100%,380px)] lg:min-w-[420px]',
              'border-2 border-[rgba(252,250,243,0.55)] bg-[rgba(6,18,14,0.45)] shadow-[0_10px_36px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]',
              'backdrop-blur-xl backdrop-saturate-150',
              'transition-[border-color,box-shadow,background-color] duration-[400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              'hover:border-[rgba(252,250,243,0.92)] hover:bg-[rgba(11,77,59,0.88)] hover:shadow-[0_0_0_1px_rgba(214,168,62,0.25),0_18px_48px_rgba(11,77,59,0.55),0_0_32px_rgba(252,250,243,0.12)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(252,250,243,0.85)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030806]'
            )}
            whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={TRANSITION}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent opacity-80"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(214,168,62,0.06)_0%,transparent_40%,rgba(11,77,59,0.15)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <span className="relative z-[1] flex w-full items-center gap-4 px-5 py-3 sm:gap-6 sm:px-8 sm:py-4">
              <span
                className="flex h-[52px] w-[4.25rem] shrink-0 items-center justify-center text-[rgba(252,250,243,0.92)] transition-colors duration-500 group-hover:text-[rgb(252,250,243)] sm:h-[64px] sm:w-[5.25rem]"
                style={{ color: CREAM }}
              >
                <VanSilhouetteOutline className="h-full w-full" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                <span
                  className="font-display text-[clamp(1.02rem,2.6vw,1.35rem)] font-bold leading-[1.08] tracking-[-0.015em]"
                  style={{ color: CREAM }}
                >
                  Our Services
                </span>
                <span
                  className="hidden font-ge text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[rgba(252,250,243,0.78)] transition-colors group-hover:text-[rgba(252,250,243,0.92)] sm:block"
                >
                  Transfers · Golf · Stays
                </span>
              </span>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(252,250,243,0.35)] bg-[rgba(255,255,255,0.06)] text-[rgb(252,250,243)] shadow-[0_0_20px_rgba(252,250,243,0.08)] transition-all duration-500 group-hover:border-[rgba(252,250,243,0.65)] group-hover:bg-[rgba(255,255,255,0.12)] group-hover:shadow-[0_0_28px_rgba(214,168,62,0.35)] sm:h-14 sm:w-14"
                aria-hidden
              >
                <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
              </span>
            </span>
          </m.a>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
