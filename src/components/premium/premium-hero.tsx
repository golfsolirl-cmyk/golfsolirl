import { m, type Variants } from 'framer-motion'
import { ArrowRight, Sparkles, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/utils'
import { GeButton } from '../../pages/golf-experience/components/ge-button'
import { PAGE_HERO_REGISTRY, type PageHeroSource, type PageHeroVariant } from './page-hero-registry'

/**
 * Premium Hero — the homepage's editorial hero pattern, packaged as a
 * single drop-in component. Used on every public page so the brand
 * language (kicker pill → accent bar → two-tone headline → lead → body
 * → dual CTA) stays consistent.
 *
 * Each page passes its own `variant` (lookup into PAGE_HERO_REGISTRY)
 * so every page gets a *different* photographic backdrop while keeping
 * the same overlay treatment (warm grade, gold accent line, vignette,
 * page-label badge).
 *
 * Form pages (login, etc) pass children — the form card slots into the
 * right column of the hero on desktop and stacks below on mobile.
 */

export interface PremiumHeroCta {
  readonly label: ReactNode
  readonly href?: string
  readonly onClick?: () => void
  readonly variant?: 'gs-green' | 'outline-gs-green' | 'ghost-white' | 'outline-gs-white'
  readonly icon?: LucideIcon
  readonly external?: boolean
}

export interface PremiumHeroProps {
  /** Picks the photo / badge / tint from PAGE_HERO_REGISTRY. */
  readonly variant: PageHeroVariant
  readonly kicker?: string
  readonly kickerIcon?: LucideIcon
  /** First half of the headline (cream / white). */
  readonly headlinePrimary: string
  /** Second half of the headline (gold gradient — receives the accent). */
  readonly headlineAccent?: string
  readonly lead?: string
  readonly body?: ReactNode
  readonly primaryCta?: PremiumHeroCta
  readonly secondaryCta?: PremiumHeroCta
  /** Optional small line below the CTAs (e.g. "Magic link · No password"). */
  readonly aside?: string
  /** Slot for a page-specific card (e.g. login form). Renders at right column on desktop. */
  readonly children?: ReactNode
  readonly className?: string
}

const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
  }
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }
  }
}

/** Maps tintHue → CSS overlay gradient applied on top of the photo. */
const TINT_OVERLAYS: Record<string, string> = {
  warm:
    'linear-gradient(135deg, rgba(217,190,122,0.18) 0%, rgba(11,77,59,0.55) 60%, rgba(6,32,22,0.85) 100%)',
  gold:
    'linear-gradient(135deg, rgba(244,223,166,0.22) 0%, rgba(217,190,122,0.18) 30%, rgba(6,32,22,0.85) 100%)',
  cool:
    'linear-gradient(135deg, rgba(11,77,59,0.20) 0%, rgba(11,77,59,0.55) 50%, rgba(6,32,22,0.88) 100%)',
  forest:
    'linear-gradient(135deg, rgba(11,107,69,0.30) 0%, rgba(6,59,42,0.65) 60%, rgba(6,32,22,0.92) 100%)'
}

export function PremiumHero({
  variant,
  kicker,
  kickerIcon: KickerIcon = Sparkles,
  headlinePrimary,
  headlineAccent,
  lead,
  body,
  primaryCta,
  secondaryCta,
  aside,
  children,
  className
}: PremiumHeroProps) {
  const photo: PageHeroSource = PAGE_HERO_REGISTRY[variant]
  const tint = TINT_OVERLAYS[photo.tintHue] ?? TINT_OVERLAYS.warm
  const PrimaryIcon = primaryCta?.icon ?? ArrowRight

  return (
    <section
      className={cx(
        'premium-hero ge-on-dark relative isolate overflow-hidden',
        'bg-gs-dark text-white',
        className
      )}
    >
      {/* —— Hero photo (different per page) + unified brand overlay —— */}
      <picture className="pointer-events-none absolute inset-0 -z-10 block">
        <source srcSet={photo.desktopWebp ?? photo.desktop} media="(min-width: 768px)" />
        <source srcSet={photo.mobileWebp ?? photo.mobile} media="(max-width: 767.98px)" />
        <img
          src={photo.desktop}
          alt={photo.alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </picture>

      {/* Warm/gold/forest tint per page (same on every page = brand consistency). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{ background: tint }}
      />
      {/* Bottom darkening for legible white type. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-t from-[#04130c]/80 via-transparent to-[#04130c]/40"
      />
      {/* Centre vignette so the headline column always reads. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(0,0,0,0.42), transparent 70%)'
        }}
      />
      {/* Gold accent rule across the bottom (same as facts CTA panel). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-12 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.55) 30%, rgba(244,223,166,0.85) 50%, rgba(217,190,122,0.55) 70%, transparent 100%)'
        }}
      />

      <div
        className={cx(
          'relative mx-auto w-full max-w-[1180px] px-5 sm:px-8',
          'pb-20 pt-24 sm:pb-24 sm:pt-28 lg:pb-28 lg:pt-32'
        )}
      >
        <m.div
          variants={heroContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className={cx(
            'grid items-center gap-10 lg:gap-14',
            children ? 'lg:grid-cols-[1.05fr_minmax(320px,440px)]' : 'lg:grid-cols-1'
          )}
        >
          <div className="min-w-0">
            {/* Page-label badge */}
            <m.span
              variants={heroItem}
              className="inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-white/[0.08] px-3.5 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] backdrop-blur-sm sm:text-[0.74rem]"
              style={{ color: '#fbe8b5' }}
            >
              <KickerIcon className="h-3.5 w-3.5 shrink-0" aria-hidden style={{ color: '#fbe8b5' }} />
              {kicker ?? photo.badge}
            </m.span>

            {/* Brand-green / gold accent bar */}
            <m.span
              aria-hidden="true"
              variants={heroItem}
              className="mt-5 block h-1 w-14 rounded-full bg-gradient-to-r from-[#fff5cf] via-[#f4dfa6] to-[#d9be7a]"
            />

            {/* Two-tone headline (white primary + gold-gradient accent) */}
            <m.h1
              variants={heroItem}
              className="mt-5 max-w-[20ch] font-ge text-[2.2rem] font-extrabold uppercase leading-[1.04] tracking-[0.01em] drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] sm:text-[2.7rem] lg:text-[3.05rem]"
              style={{ color: '#ffffff' }}
            >
              <span style={{ color: '#ffffff' }}>{headlinePrimary}</span>
              {headlineAccent ? (
                <>
                  {headlinePrimary && !headlinePrimary.endsWith(' ') ? ' ' : ''}
                  <span
                    className="bg-clip-text"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 45%, #d9be7a 100%)',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {headlineAccent}
                  </span>
                </>
              ) : null}
            </m.h1>

            {/* Lead */}
            {lead ? (
              <m.p
                variants={heroItem}
                className="mt-5 max-w-2xl font-ge text-[0.94rem] font-semibold uppercase tracking-[0.16em] drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-[1rem]"
                style={{ color: '#ffffff' }}
              >
                {lead}
              </m.p>
            ) : null}

            {/* Body */}
            {body ? (
              <m.div
                variants={heroItem}
                className="mt-5 max-w-2xl font-ge text-[1.04rem] leading-[1.72] drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] sm:text-[1.1rem]"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                {body}
              </m.div>
            ) : null}

            {/* CTA row */}
            {(primaryCta || secondaryCta) ? (
              <m.div
                variants={heroItem}
                className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
              >
                {primaryCta ? (
                  <GeButton
                    href={primaryCta.href}
                    variant={primaryCta.variant ?? 'gs-green'}
                    size="lg"
                    className="w-full sm:w-auto"
                    {...(primaryCta.onClick ? { onClick: primaryCta.onClick } : {})}
                    {...(primaryCta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {primaryCta.label}
                    <PrimaryIcon className="ml-1 h-4 w-4" aria-hidden />
                  </GeButton>
                ) : null}

                {secondaryCta ? (
                  <GeButton
                    href={secondaryCta.href}
                    variant={secondaryCta.variant ?? 'outline-gs-white'}
                    size="lg"
                    className="w-full sm:w-auto"
                    {...(secondaryCta.onClick ? { onClick: secondaryCta.onClick } : {})}
                    {...(secondaryCta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {secondaryCta.label}
                  </GeButton>
                ) : null}
              </m.div>
            ) : null}

            {aside ? (
              <m.p
                variants={heroItem}
                className="mt-7 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] sm:text-[0.76rem]"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                {aside}
              </m.p>
            ) : null}
          </div>

          {/* Right-side card slot (form, etc) — only renders if children passed */}
          {children ? (
            <m.div
              variants={heroItem}
              className="relative w-full"
            >
              {/* Soft halo behind the card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 rounded-[2.1rem] bg-gradient-to-br from-[#f4dfa6]/[0.18] via-transparent to-[#0d3a2a]/[0.4] opacity-80 blur-2xl"
              />
              <div className="relative">{children}</div>
            </m.div>
          ) : null}
        </m.div>
      </div>
    </section>
  )
}
