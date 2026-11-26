import { X } from 'lucide-react'
import { cx } from '../../lib/utils'

type DismissCloseButtonProps = {
  readonly onClick: () => void
  readonly className?: string
  /** Overrides the default accessible name. */
  readonly 'aria-label'?: string
  /**
   * Visual tone for the surface behind the control:
   * - `light` — light / cream cards & banners (dark X, bordered pill)
   * - `dark` — dark / forest panels (light X on translucent pill)
   * - `on-green` — green CTAs / WhatsApp green
   */
  readonly tone?: 'light' | 'dark' | 'on-green'
}

/**
 * Accessible close control for banners, sheets, and sticky bars.
 * Always 44×44px minimum. Uses `data-keep-color` so `.ge-on-dark` theme
 * overrides cannot force a white X onto a light pill.
 */
export function DismissCloseButton({
  onClick,
  className,
  tone = 'light',
  'aria-label': ariaLabel = 'Close'
}: DismissCloseButtonProps) {
  const toneClass =
    tone === 'dark'
      ? cx(
          'border border-white/45 bg-white/20 text-white shadow-sm',
          'hover:border-white/70 hover:bg-white/30',
          '[color:#ffffff!important] [background-color:rgba(255,255,255,0.22)!important]'
        )
      : tone === 'on-green'
        ? cx(
            'border border-white/50 bg-white/25 text-white shadow-sm',
            'hover:border-white/75 hover:bg-white/35',
            '[color:#ffffff!important] [background-color:rgba(255,255,255,0.28)!important]'
          )
        : cx(
            // Opaque cream pill + near-black X — readable on light cards AND when
            // nested inside a dark `.ge-on-dark` section (WhatsApp / callback strip).
            'border border-[#0b3123]/30 bg-[#fffdf8] text-[#062016] shadow-[0_2px_8px_rgba(6,32,22,0.12)]',
            'hover:border-[#0b3123]/55 hover:bg-[#f3ecda]',
            'active:bg-[#ebe3cf]',
            '[color:#062016!important] [background-color:#fffdf8!important]'
          )

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-keep-color
      data-gsol-dismiss-close={tone}
      onClick={onClick}
      className={cx(
        'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        toneClass,
        className
      )}
    >
      <X className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
    </button>
  )
}
