import { X } from 'lucide-react'
import { cx } from '../../lib/utils'

type DismissCloseButtonProps = {
  readonly onClick: () => void
  readonly className?: string
  /** Overrides the default accessible name. */
  readonly 'aria-label'?: string
  /** Visual tone for dark or light surfaces. */
  readonly tone?: 'light' | 'dark' | 'on-green'
}

/**
 * Accessible close control for banners, sheets, and sticky bars.
 * Always 44×44px minimum and aria-label="Close" (overridable).
 */
export function DismissCloseButton({
  onClick,
  className,
  tone = 'light',
  'aria-label': ariaLabel = 'Close'
}: DismissCloseButtonProps) {
  const toneClass =
    tone === 'dark'
      ? 'bg-white/15 text-white hover:bg-white/25'
      : tone === 'on-green'
        ? 'bg-white/20 text-white hover:bg-white/30'
        : 'bg-slate-100 text-gs-dark hover:bg-slate-200'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cx(
        'inline-flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a843] focus-visible:ring-offset-2',
        toneClass,
        className
      )}
    >
      <X className="h-5 w-5" aria-hidden />
    </button>
  )
}
