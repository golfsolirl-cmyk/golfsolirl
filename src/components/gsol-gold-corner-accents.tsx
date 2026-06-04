/**
 * Squiggly gold corner lines from foil business cards — decorative only.
 * Parent must be `position: relative` (and usually `overflow-hidden`).
 */
import { cx } from '../lib/utils'

export const GSOL_GOLD_ACCENT = '#E8BC55'

const CELTIC_PATH =
  'M4 4c12 8 20 8 28 0 8 12 8 20 0 28 12 8 20 8 28 0 8 12 8 20 0 28'

const ARC_PATHS = {
  tl: 'M8 52 Q8 8 52 8',
  tr: 'M72 52 Q72 8 28 8',
  br: 'M72 28 Q72 72 28 72',
  bl: 'M8 28 Q8 72 52 72'
} as const

type Corner = keyof typeof ARC_PATHS

type AccentPreset = 'footer' | 'hero' | 'light' | 'section'

const PRESET_STYLES: Record<
  AccentPreset,
  { celticOpacity: number; arcOpacity: number; celticSize: string; arcSize: string }
> = {
  footer: {
    celticOpacity: 0.4,
    arcOpacity: 0.88,
    celticSize: 'h-[min(11rem,26%)] w-[min(11rem,26%)]',
    arcSize: 'h-[min(13rem,30%)] w-[min(13rem,30%)]'
  },
  hero: {
    celticOpacity: 0.34,
    arcOpacity: 0.8,
    celticSize: 'h-[min(9rem,22%)] w-[min(9rem,22%)]',
    arcSize: 'h-[min(10rem,24%)] w-[min(10rem,24%)]'
  },
  section: {
    celticOpacity: 0.28,
    arcOpacity: 0.7,
    celticSize: 'h-[min(7rem,18%)] w-[min(7rem,18%)]',
    arcSize: 'h-[min(8rem,20%)] w-[min(8rem,20%)]'
  },
  light: {
    celticOpacity: 0.22,
    arcOpacity: 0.55,
    celticSize: 'h-[min(8rem,20%)] w-[min(8rem,20%)]',
    arcSize: 'h-[min(9rem,22%)] w-[min(9rem,22%)]'
  }
}

const CELTIC_POS: Record<Corner, string> = {
  tl: 'left-0 top-0',
  tr: 'right-0 top-0 scale-x-[-1]',
  br: 'bottom-0 right-0 scale-x-[-1] scale-y-[-1]',
  bl: 'bottom-0 left-0 scale-y-[-1]'
}

const ARC_POS: Record<Corner, string> = {
  tl: 'left-0 top-0',
  tr: 'right-0 top-0 scale-x-[-1]',
  br: 'bottom-0 right-0',
  bl: 'bottom-0 left-0 scale-y-[-1]'
}

export type GsolGoldCornerAccentsProps = {
  /** Visual weight — footer is strongest; light is for cream heroes. */
  readonly preset?: AccentPreset
  /** Which corners show the Celtic squiggle (default: all four). */
  readonly celticCorners?: readonly Corner[]
  /** Which corners show the bendy gold arc (default: tl + br, like foil cards). */
  readonly arcCorners?: readonly Corner[]
  readonly className?: string
}

export function GsolGoldCornerAccents({
  preset = 'footer',
  celticCorners = ['tl', 'tr', 'br', 'bl'],
  arcCorners = ['tl', 'br'],
  className
}: GsolGoldCornerAccentsProps) {
  const style = PRESET_STYLES[preset]

  return (
    <div
      aria-hidden
      className={cx('gsol-gold-accent pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {celticCorners.map((corner) => (
        <svg
          key={`celtic-${corner}`}
          className={cx('absolute', CELTIC_POS[corner], style.celticSize)}
          style={{ opacity: style.celticOpacity }}
          viewBox="0 0 80 80"
          fill="none"
        >
          <path d={CELTIC_PATH} fill="none" stroke={GSOL_GOLD_ACCENT} strokeWidth="1.2" />
          <circle cx="12" cy="12" r="2" fill={GSOL_GOLD_ACCENT} opacity="0.65" />
        </svg>
      ))}
      {arcCorners.map((corner) => (
        <svg
          key={`arc-${corner}`}
          className={cx('absolute', ARC_POS[corner], style.arcSize)}
          viewBox="0 0 80 80"
          fill="none"
        >
          <path
            d={ARC_PATHS[corner]}
            fill="none"
            stroke={GSOL_GOLD_ACCENT}
            strokeWidth="2.2"
            opacity={style.arcOpacity}
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  )
}
