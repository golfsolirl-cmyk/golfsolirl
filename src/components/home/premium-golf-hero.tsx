import { ArrowRight } from 'lucide-react'
import { IrelandPaymentsTrust } from '../ireland-payments-trust'
import { NAMED_HERO_IMAGE_SETS } from '../../lib/page-hero-images'
import { cx } from '../../lib/utils'

export const PREMIUM_HERO_DESKTOP_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.desktop
export const PREMIUM_HERO_TABLET_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.tablet
export const PREMIUM_HERO_MOBILE_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.mobile
export const PREMIUM_HERO_ALT = NAMED_HERO_IMAGE_SETS.homepageFleet.alt

type PremiumGolfHeroProps = {
  readonly className?: string
}

/**
 * Lean homepage hero — one brand signal, one headline, one short line, one CTA group.
 * Uses `.ge-on-dark` so page-level `.bg-offwhite` cannot force forest body colour onto this copy.
 */
export function PremiumGolfHero({ className }: PremiumGolfHeroProps) {
  return (
    <section
      aria-label="GolfSol Ireland golf holiday bundles"
      className={cx(
        'premium-golf-hero ge-on-dark relative isolate overflow-hidden bg-forest-950 pt-[4.75rem] text-white sm:pt-[5.25rem]',
        className
      )}
    >
      <div className="absolute inset-0">
        <picture>
          <source media="(min-width: 1024px)" srcSet={PREMIUM_HERO_DESKTOP_SRC} type="image/webp" />
          <source media="(min-width: 640px)" srcSet={PREMIUM_HERO_TABLET_SRC} type="image/webp" />
          <img
            alt={PREMIUM_HERO_ALT}
            className="h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            height={1600}
            loading="eager"
            src={PREMIUM_HERO_MOBILE_SRC}
            width={900}
          />
        </picture>
        <div
          aria-hidden
          className="premium-golf-hero-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,12,0.82)_0%,rgba(6,32,22,0.86)_48%,rgba(6,32,22,0.92)_100%)]"
        />
      </div>

      <div className="premium-golf-hero-copy relative z-[1] mx-auto flex min-h-[min(72vh,38rem)] max-w-[1100px] flex-col justify-end px-5 pb-14 pt-10 sm:min-h-[min(78vh,42rem)] sm:px-8 sm:pb-16">
        <p className="premium-golf-hero-kicker font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[#f4dfa6]">
          GolfSol Ireland
        </p>
        <h1 className="premium-golf-hero-title mt-3 max-w-2xl font-ge text-[2.15rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-[3rem]">
          Our golf holiday bundles
        </h1>
        <p className="premium-golf-hero-lead mt-4 max-w-xl font-ge text-[1.05rem] leading-7 text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]">
          Short breaks, most popular weeks, and full golf weeks — with Value, Classic and Premium hotels.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="/bundles"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4a843] px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#062016] shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
          >
            View bundles
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="/contact"
            className="premium-golf-hero-outline-cta inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white bg-white/15 px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.28)] backdrop-blur-sm"
          >
            Get a quote
          </a>
        </div>
        <IrelandPaymentsTrust className="mt-5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]" tone="dark" />
      </div>
    </section>
  )
}
