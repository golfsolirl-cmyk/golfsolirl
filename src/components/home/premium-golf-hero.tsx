import { ArrowRight } from 'lucide-react'
import { IrelandPaymentsTrust } from '../ireland-payments-trust'
import { NAMED_HERO_IMAGE_SETS, type HeroImageSet } from '../../lib/page-hero-images'
import { cx } from '../../lib/utils'

export const PREMIUM_HERO_DESKTOP_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.desktop
export const PREMIUM_HERO_TABLET_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.tablet
export const PREMIUM_HERO_MOBILE_SRC = NAMED_HERO_IMAGE_SETS.homepageFleet.mobile
export const PREMIUM_HERO_ALT = NAMED_HERO_IMAGE_SETS.homepageFleet.alt

export type LeanPublicHeroCta = {
  readonly label: string
  readonly href: string
}

export type LeanPublicHeroProps = {
  readonly ariaLabel?: string
  readonly kicker?: string
  readonly title: string
  readonly lead: string
  readonly images: HeroImageSet
  readonly primaryCta: LeanPublicHeroCta
  readonly secondaryCta?: LeanPublicHeroCta
  /** Show Ireland payments trust line under CTAs. Default true. */
  readonly showTrust?: boolean
  readonly className?: string
  /** Object-position for the hero photo (e.g. "center 40%"). */
  readonly imageObjectPosition?: string
}

/**
 * Lean public-page hero — photo + dark overlay, gold eyebrow, white title,
 * one short subtitle, primary + outline CTAs. Shared across marketing pages.
 * Uses `.ge-on-dark` so page-level `.bg-offwhite` cannot force forest body colour onto this copy.
 */
export function LeanPublicHero({
  ariaLabel,
  kicker = 'GolfSol Ireland',
  title,
  lead,
  images,
  primaryCta,
  secondaryCta,
  showTrust = true,
  className,
  imageObjectPosition = 'center'
}: LeanPublicHeroProps) {
  return (
    <section
      aria-label={ariaLabel ?? title}
      className={cx(
        'premium-golf-hero ge-on-dark relative isolate overflow-hidden bg-forest-950 text-white',
        className
      )}
      style={{ paddingTop: 'calc(var(--ge-fixed-header-h) + 0.65rem)' }}
    >
      <div className="absolute inset-0">
        <picture>
          <source media="(min-width: 1024px)" srcSet={images.desktop} type="image/webp" />
          <source media="(min-width: 640px)" srcSet={images.tablet} type="image/webp" />
          <img
            alt={images.alt}
            className="h-full w-full object-cover"
            decoding="async"
            fetchPriority="high"
            height={1600}
            loading="eager"
            src={images.mobile}
            style={{ objectPosition: imageObjectPosition }}
            width={900}
          />
        </picture>
        <div
          aria-hidden
          className="premium-golf-hero-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,12,0.82)_0%,rgba(6,32,22,0.86)_48%,rgba(6,32,22,0.92)_100%)]"
        />
      </div>

      <div className="premium-golf-hero-copy relative z-[1] mx-auto flex min-h-[min(72vh,38rem)] max-w-[1100px] flex-col justify-end overflow-visible px-4 pb-14 pt-5 xs:px-5 sm:min-h-[min(78vh,42rem)] sm:px-8 sm:pb-16 sm:pt-6">
        {/*
          Eyebrow sits below the measured sticky header (--ge-fixed-header-h).
          Keep type wrapping; never nowrap / overflow-hidden on the kicker.
        */}
        <p
          className="premium-golf-hero-kicker max-w-full font-ge text-[0.62rem] font-extrabold uppercase leading-snug tracking-[0.08em] text-[#f4dfa6] [overflow-wrap:anywhere] sm:text-[0.72rem] sm:tracking-[0.14em]"
          data-keep-color
        >
          {kicker}
        </p>
        <h1 className="premium-golf-hero-title mt-3 max-w-2xl font-ge text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-[3rem]">
          {title}
        </h1>
        <p
          className="premium-golf-hero-lead mt-4 max-w-xl font-ge text-[1.02rem] leading-7 text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.55)] sm:text-[1.05rem]"
          data-keep-color
        >
          {lead}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={primaryCta.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4a843] px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#062016] shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
          >
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          {secondaryCta ? (
            <a
              href={secondaryCta.href}
              className="premium-golf-hero-outline-cta inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white bg-white/15 px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.28)] backdrop-blur-sm"
            >
              {secondaryCta.label}
            </a>
          ) : null}
        </div>
        {showTrust ? <IrelandPaymentsTrust className="mt-5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]" tone="dark" /> : null}
      </div>
    </section>
  )
}

type PremiumGolfHeroProps = {
  readonly className?: string
}

/** Homepage default — same lean composition clients liked. */
export function PremiumGolfHero({ className }: PremiumGolfHeroProps) {
  return (
    <LeanPublicHero
      ariaLabel="GolfSol Ireland golf holiday bundles"
      className={className}
      images={NAMED_HERO_IMAGE_SETS.homepageFleet}
      kicker="GolfSol Ireland"
      lead="Short breaks, most popular weeks, and full golf weeks — with Value, Classic and Premium hotels."
      primaryCta={{ label: 'View bundles', href: '/bundles' }}
      secondaryCta={{ label: 'Get a quote', href: '/quote' }}
      title="Our golf holiday bundles"
    />
  )
}
