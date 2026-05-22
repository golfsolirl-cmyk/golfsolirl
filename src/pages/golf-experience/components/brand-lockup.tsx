import { m  } from 'framer-motion'
import { BrandLogoPicture } from '../../../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_HEADER_SIZES, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../../lib/brand-logo-assets'
import { useHomepageTestLogo } from '../../../providers/homepagetest-variant'
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
  const testLogo = useHomepageTestLogo()
  const intrinsic = testLogo ?? GOLFSOL_BRAND_LOGO_INTRINSIC

  if (mode === 'overlay') {
    void tone
    return (
      <div className={cx('flex flex-col items-start', className)}>
        <BrandLogoPicture
          alt="GolfSol Ireland — Irish-owned Costa del Sol golf travel"
          width={intrinsic.width}
          height={intrinsic.height}
          decoding="async"
          fetchPriority="high"
          className={cx(
            'h-auto w-full select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]',
            testLogo
              ? 'max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px]'
              : 'max-w-[220px] sm:max-w-[260px] md:max-w-[280px] lg:max-w-[300px]'
          )}
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
        <BrandLogoPicture
          alt="GolfSol Ireland"
          width={intrinsic.width}
          height={intrinsic.height}
          loading="lazy"
          decoding="async"
          className={cx(
            'h-auto w-full select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]',
            testLogo
              ? 'max-w-[220px] sm:max-w-[240px] md:max-w-[260px]'
              : 'max-w-[240px] sm:max-w-[280px] md:max-w-[300px]'
          )}
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
          width={intrinsic.width}
          height={intrinsic.height}
          sizes={GOLFSOL_BRAND_LOGO_HEADER_SIZES}
          decoding="async"
          fetchPriority="high"
          // Native height (no CSS scale) keeps the crest sharp on retina; translate overlaps hero below navbar.
          className={cx(
            'relative z-10 block w-auto origin-top select-none object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.18),0_14px_34px_rgba(0,0,0,0.28),0_28px_56px_rgba(0,0,0,0.14)]',
            testLogo
              ? 'h-[100px] translate-y-0.5 sm:h-[104px] sm:translate-y-1 md:h-[108px] md:translate-y-1.5 lg:h-[104px] lg:translate-y-2 xl:h-[110px] xl:translate-y-2.5'
              : 'h-[112px] translate-y-0.5 sm:h-[118px] sm:translate-y-1 md:h-[124px] md:translate-y-1.5 lg:h-[118px] lg:translate-y-2 xl:h-[124px] xl:translate-y-2.5'
          )}
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
