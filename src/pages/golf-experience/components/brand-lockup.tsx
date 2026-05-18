import { m  } from 'framer-motion'
import { BrandLogoPicture, FooterBrandLogoPicture } from '../../../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../../lib/brand-logo-assets'
import { cx } from '../../../lib/utils'

interface BrandLockupProps {
  readonly tone: 'on-dark' | 'on-light'
  /**
   * 'overlay' renders the big stacked crest over the hero,
   * 'sticky'  renders the wide footer crest in the sticky navbar,
   * 'footer'  renders the wide landscape footer crest in the dark footer.
   *
   * All three modes now show the crest only — separate "GolfSol Ireland"
   * wordmark text was removed (the crest artwork already contains it).
   */
  readonly mode: 'overlay' | 'sticky' | 'footer'
  readonly className?: string
}

/**
 * The brand lockup for the GolfSol Ireland home page (`/`).
 * The crest artwork contains the full wordmark and flags; every mode renders it with
 * mode-specific sizing + entrance animations.
 */
export function GeBrandLockup({ tone, mode, className }: BrandLockupProps) {
  if (mode === 'overlay') {
    void tone
    return (
      <div className={cx('flex flex-col items-start', className)}>
        <BrandLogoPicture
          alt="GolfSol Ireland — Irish-owned Costa del Sol golf travel"
          width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
          decoding="async"
          fetchPriority="high"
          className="h-auto w-full max-w-[280px] select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]"
        />
      </div>
    )
  }

  if (mode === 'footer') {
    // Footer brand lockup — crest only. The artwork already contains
    // 'GOLFSOL IRELAND' so the separate wordmark + tagline have been
    // removed per design feedback.
    void tone
    return (
      <div className={cx('flex flex-col items-start', className)}>
        <FooterBrandLogoPicture
          alt="GolfSol Ireland"
          width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
          loading="lazy"
          decoding="async"
          className="h-auto w-full max-w-[320px] select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:max-w-[360px] md:max-w-[400px]"
        />
      </div>
    )
  }

  // Sticky lockup for the white navbar.
  // Crest is bottom-aligned (`lg:self-end` on nav link) and translated/scaled so it reads
  // as escaping slightly below the header bar into the hero.
  void tone
  return (
    <div className={cx('flex items-center', className)}>
      <m.div
        // Outer wrapper handles the spring entrance animation. Note we
        // animate ONLY opacity on mount (not scale) — the CSS transform on
        // the img owns the resting transform, otherwise Framer Motion
        // would overwrite the Tailwind scale-* utility.
        // overflow-visible so the CSS-scaled crest (mobile only) can render
        // past the navbar bottom edge into the white hero spacer below
        // without being clipped.
        className="relative shrink-0 overflow-visible"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.7, delay: 0.05 }}
      >
        <BrandLogoPicture
          alt="GolfSol Ireland"
          width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
          decoding="async"
          fetchPriority="high"
          // Layout box stays compact; crest scales from top and shifts down so it overlaps
          // the navbar bottom edge (see `ge-navbar` overflow-visible + home link `lg:self-end`).
          className="relative z-10 block h-[150px] w-auto origin-top translate-y-1 scale-[1.5] select-none object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.18),0_14px_34px_rgba(0,0,0,0.28),0_28px_56px_rgba(0,0,0,0.14)] sm:h-[166px] sm:translate-y-1.5 sm:scale-[1.46] md:h-[184px] md:translate-y-2 md:scale-[1.4] lg:h-[172px] lg:translate-y-2.5 lg:scale-[1.32] xl:h-[186px] xl:translate-y-3 xl:scale-[1.28]"
        />
        {/* One-shot gold shimmer sweep on mount */}
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ mixBlendMode: 'screen' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.6, times: [0, 0.15, 0.85, 1], delay: 0.6 }}
        >
          <m.div
            className="absolute inset-y-0 w-[55%] -skew-x-[20deg]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.0) 25%, rgba(217,190,122,0.85) 50%, rgba(217,190,122,0.0) 75%, transparent 100%)'
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.7 }}
          />
        </m.div>
      </m.div>
    </div>
  )
}
