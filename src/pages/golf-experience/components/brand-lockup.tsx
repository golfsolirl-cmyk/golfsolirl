import { motion } from 'framer-motion'
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

const footerCrest = '/golfsol-crest-footer.png'

/**
 * The brand lockup for the GolfSol Ireland home page (`/`).
 * The PNG crest contains the full wordmark, so every mode renders the
 * crest by itself with mode-specific sizing + entrance animations.
 */
export function GeBrandLockup({ tone, mode, className }: BrandLockupProps) {
  void tone

  if (mode === 'overlay') {
    return (
      <div className={cx('flex flex-col items-start', className)}>
        <img
          src={footerCrest}
          alt="GolfSol Ireland — Irish-owned Costa del Sol golf travel"
          width={800}
          height={533}
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
    return (
      <div className={cx('flex flex-col items-start', className)}>
        <img
          src={footerCrest}
          alt="GolfSol Ireland"
          width={800}
          height={533}
          loading="lazy"
          decoding="async"
          className="h-auto w-full max-w-[320px] select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:max-w-[360px] md:max-w-[400px]"
        />
      </div>
    )
  }

  // Sticky lockup for the white navbar.
  // Uses the wide footer crest as the SINGLE logo image — the artwork
  // already contains "GOLFSOL IRELAND" so no separate wordmark text is
  // rendered. Tone prop kept for API compatibility but visually unused.
  void tone
  return (
    <div className={cx('flex items-center', className)}>
      <motion.div
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
        <img
          src={footerCrest}
          alt="GolfSol Ireland"
          width={800}
          height={533}
          decoding="async"
          fetchPriority="high"
          // Layout box stays the same height (header doesn't grow), but on
          // mobile we visually scale the crest ~50% via CSS transform with
          // a top origin — the crest spills downward into the white hero
          // spacer below the navbar (which is also white, so it looks
          // continuous). lg:+ resets to scale-100 so desktop is unchanged.
          className="relative z-10 block h-[110px] w-auto origin-top scale-[1.45] select-none object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.35)] sm:h-[124px] sm:scale-[1.4] md:h-[140px] md:scale-[1.3] lg:h-[118px] lg:scale-100 xl:h-[130px]"
        />
        {/* One-shot gold shimmer sweep on mount */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ mixBlendMode: 'screen' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.6, times: [0, 0.15, 0.85, 1], delay: 0.6 }}
        >
          <motion.div
            className="absolute inset-y-0 w-[55%] -skew-x-[20deg]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,231,122,0.0) 25%, rgba(255,231,122,0.85) 50%, rgba(255,231,122,0.0) 75%, transparent 100%)'
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.7 }}
          />
        </motion.div>
        {/* Continuous soft radial glow halo */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-4 -z-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 55%, rgba(255,199,44,0.45) 0%, rgba(255,199,44,0.15) 40%, rgba(255,199,44,0) 70%)',
            filter: 'blur(12px)'
          }}
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.94, 1.04, 0.94] }}
          transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity, delay: 1.4 }}
        />
      </motion.div>
    </div>
  )
}
