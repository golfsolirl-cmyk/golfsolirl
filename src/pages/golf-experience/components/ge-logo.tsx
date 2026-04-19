import { cx } from '../../../lib/utils'

interface GeLogoProps {
  readonly className?: string
  readonly variant?: 'on-light' | 'on-dark'
}

/**
 * Square Golf Experience–style logo: green disc with golf flag and wordmark.
 * Drawn in-house. Not a copy of the source PNG.
 */
export function GeLogo({ className, variant = 'on-light' }: GeLogoProps) {
  const wordmarkColor = variant === 'on-light' ? '#2d3940' : '#ffffff'

  return (
    <div className={cx('inline-flex items-center gap-3', className)}>
      <svg
        aria-hidden="true"
        className="h-12 w-12 shrink-0"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="60" height="60" rx="6" fill="#007C69" />
        <rect x="2" y="2" width="60" height="60" rx="6" fill="none" stroke="#005a4d" strokeWidth="1.5" />
        {/* Putting green hill */}
        <ellipse cx="32" cy="50" rx="22" ry="6" fill="#29c4a9" opacity="0.55" />
        {/* Flagstick */}
        <line x1="40" y1="14" x2="40" y2="50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        {/* Flag */}
        <path d="M40 14 L40 24 L26 19 Z" fill="#ff5b2d" />
        {/* Hole */}
        <ellipse cx="40" cy="51" rx="3" ry="1.4" fill="#003d33" />
        {/* Ball */}
        <circle cx="22" cy="48" r="2.6" fill="#ffffff" stroke="#cccccc" strokeWidth="0.4" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className="font-ge text-[1.05rem] font-extrabold tracking-tight"
          style={{ color: wordmarkColor }}
        >
          GOLF
          <span className="text-ge-orange"> Experience</span>
        </span>
        <span
          className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-ge-teal"
        >
          Spain · Portugal · Morocco
        </span>
      </span>
    </div>
  )
}
