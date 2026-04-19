import { cx } from '../../../lib/utils'

interface GeLogoProps {
  readonly className?: string
  /** Wordmark color tone — only affects the optional inline wordmark, not the badge. */
  readonly variant?: 'on-light' | 'on-dark'
  /** Badge diameter in pixels. */
  readonly size?: number
  /** Show inline wordmark to the right of the badge. The source site puts the
   *  brand inside the badge itself, so default false. */
  readonly showWordmark?: boolean
}

/**
 * Circular Golf Experience–style badge logo: white disc with green wordmark
 * "GOLF EXPERIENCE EST.1989" stacked around a small flagstick glyph.
 * Drawn in-house. Not a copy of the source PNG.
 */
export function GeLogo({ className, variant = 'on-light', size = 88, showWordmark = false }: GeLogoProps) {
  const wordmarkColor = variant === 'on-light' ? '#2d3940' : '#ffffff'

  return (
    <div className={cx('inline-flex items-center gap-3', className)}>
      <svg
        aria-label="Golf Experience"
        role="img"
        className="shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id="ge-curve-top" d="M 16 60 a 44 44 0 0 1 88 0" fill="none" />
          <path id="ge-curve-bottom" d="M 18 64 a 42 42 0 0 0 84 0" fill="none" />
        </defs>
        {/* White disc */}
        <circle cx="60" cy="60" r="56" fill="#ffffff" />
        <circle cx="60" cy="60" r="56" fill="none" stroke="#007C69" strokeWidth="2" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="#007C69" strokeWidth="0.6" opacity="0.5" />

        {/* Center glyph: golfer flag-on-green */}
        <g transform="translate(60 64)">
          {/* Flagstick */}
          <line x1="0" y1="-22" x2="0" y2="6" stroke="#007C69" strokeWidth="1.6" strokeLinecap="round" />
          {/* Flag pennant */}
          <path d="M0 -22 L0 -13 L-12 -17 Z" fill="#ff5b2d" />
          {/* Green hill */}
          <ellipse cx="0" cy="8" rx="22" ry="3.6" fill="#007C69" opacity="0.18" />
          {/* Hole */}
          <ellipse cx="0" cy="6.5" rx="2.4" ry="0.9" fill="#003d33" />
          {/* Ball */}
          <circle cx="-10" cy="4" r="1.8" fill="#ffffff" stroke="#007C69" strokeWidth="0.5" />
        </g>

        {/* Top arc: GOLF EXPERIENCE */}
        <text
          fontFamily="Open Sans, sans-serif"
          fontWeight="800"
          fontSize="11"
          fill="#007C69"
          letterSpacing="2"
        >
          <textPath href="#ge-curve-top" startOffset="50%" textAnchor="middle">
            GOLF EXPERIENCE
          </textPath>
        </text>
        {/* Bottom arc: EST. 1989 */}
        <text
          fontFamily="Open Sans, sans-serif"
          fontWeight="700"
          fontSize="9"
          fill="#007C69"
          letterSpacing="3"
        >
          <textPath href="#ge-curve-bottom" startOffset="50%" textAnchor="middle">
            EST. 1989
          </textPath>
        </text>
      </svg>

      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className="font-ge text-[1.05rem] font-extrabold tracking-tight"
            style={{ color: wordmarkColor }}
          >
            GOLF
            <span className="text-ge-blue"> Experience</span>
          </span>
          <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-ge-teal">
            Spain · Portugal · Morocco
          </span>
        </span>
      ) : null}
    </div>
  )
}
