import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { cx } from '../../lib/utils'
import { DIVIDER_TONE_FILL, type PremiumDividerTone } from '../golfsol/premium-section-divider/premium-divider-art'
import { brandLogoAssetUrl } from '../../lib/brand-logo-assets'

export type SectionAtmosphereProps = {
  readonly className?: string
  readonly from?: PremiumDividerTone
  readonly to?: PremiumDividerTone
  /** Faint centred crest — brand punctuation, not a divider line. */
  readonly crestWatermark?: boolean
}

/**
 * Ambient section bridge — soft colour morph + fairway light.
 * No lines, no ribbons, no SVG waves.
 */
export function SectionAtmosphere({
  className,
  from = 'cream',
  to = 'cream',
  crestWatermark = false
}: SectionAtmosphereProps) {
  const reduceMotion = useReducedMotion()
  const fromColor = DIVIDER_TONE_FILL[from]
  const toColor = DIVIDER_TONE_FILL[to]

  return (
    <div
      aria-hidden
      className={cx('relative h-14 w-full overflow-hidden sm:h-16 md:h-[4.5rem]', className)}
      style={{
        background: `linear-gradient(180deg, ${fromColor} 0%, ${toColor} 100%)`
      }}
    >
      <m.div
        className="pointer-events-none absolute -left-[10%] top-1/2 h-28 w-[45%] -translate-y-1/2 rounded-full bg-[#0b4d3b]/10 blur-3xl"
        {...(reduceMotion
          ? {}
          : {
              animate: { opacity: [0.35, 0.55, 0.35], x: [0, 12, 0] },
              transition: { duration: 14, ease: 'easeInOut', repeat: Infinity }
            })}
      />
      <m.div
        className="pointer-events-none absolute -right-[8%] top-1/3 h-24 w-[38%] rounded-full bg-[#d4a843]/08 blur-3xl"
        {...(reduceMotion
          ? {}
          : {
              animate: { opacity: [0.25, 0.45, 0.25], x: [0, -10, 0] },
              transition: { duration: 16, ease: 'easeInOut', repeat: Infinity, delay: 1.2 }
            })}
      />

      {crestWatermark ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src={brandLogoAssetUrl()}
            alt=""
            className="h-16 w-16 select-none object-contain opacity-[0.055] sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20"
            decoding="async"
          />
        </div>
      ) : null}
    </div>
  )
}
