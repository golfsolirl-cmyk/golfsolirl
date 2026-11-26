import { ArrowRight } from 'lucide-react'
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
 * Replaces the dense airport-transfers poster after client feedback that the site felt too busy.
 */
export function PremiumGolfHero({ className }: PremiumGolfHeroProps) {
  return (
    <section
      aria-label="GolfSol Ireland golf holiday bundles"
      className={cx('relative isolate overflow-hidden bg-forest-950 pt-[4.75rem] sm:pt-[5.25rem]', className)}
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
            src={PREMIUM_HERO_MOBILE_SRC}
          />
        </picture>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/50 to-cream"
        />
      </div>

      <div className="relative z-[1] mx-auto flex min-h-[min(72vh,38rem)] max-w-[1100px] flex-col justify-end px-5 pb-14 pt-10 sm:min-h-[min(78vh,42rem)] sm:px-8 sm:pb-16">
        <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[#f4dfa6]">
          GolfSol Ireland
        </p>
        <h1 className="mt-3 max-w-2xl font-ge text-[2.15rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-white sm:text-[3rem]">
          Costa del Sol golf holidays, simply planned.
        </h1>
        <p className="mt-4 max-w-xl font-ge text-[1.05rem] leading-7 text-white/88">
          Bundles for 3, 5 or 7 nights — transfers, hotels and tee times from one Irish desk.
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
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/55 bg-white/10 px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
          >
            Get a quote
          </a>
        </div>
      </div>
    </section>
  )
}
