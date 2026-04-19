import { cx } from '../../../lib/utils'

interface BrandLockupProps {
  readonly tone: 'on-dark' | 'on-light'
  /**
   * 'overlay' renders the big stacked lockup over the hero (header at /),
   * 'sticky'  renders a compact horizontal lockup for the white sticky navbar,
   * 'footer'  renders the wider landscape footer crest with the wordmark
   *           lockup alongside, sized for the dark footer brand column.
   */
  readonly mode: 'overlay' | 'sticky' | 'footer'
  readonly className?: string
}

const crest = '/golfsol-crest-header.png'
const footerCrest = '/golfsol-crest-footer.png'

function Shamrock({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 28"
      className={cx('shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#3aa53e" stroke="#1f6c20" strokeWidth="0.8">
        <ellipse cx="12" cy="6" rx="5" ry="6.5" transform="rotate(-12 12 6)" />
        <ellipse cx="6"  cy="13" rx="5" ry="6.5" transform="rotate(48 6 13)" />
        <ellipse cx="18" cy="13" rx="5" ry="6.5" transform="rotate(-48 18 13)" />
      </g>
      <g fill="#7fd07f" opacity="0.6">
        <ellipse cx="11" cy="3.5" rx="1.2" ry="3" transform="rotate(-12 11 3.5)" />
        <ellipse cx="4"  cy="10"  rx="1.2" ry="3" transform="rotate(48 4 10)" />
        <ellipse cx="16" cy="10"  rx="1.2" ry="3" transform="rotate(-48 16 10)" />
      </g>
      <path d="M12 14 L12 25" stroke="#1f6c20" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/**
 * The header brand lockup for the GE clone home page (`/`).
 * Pairs the GolfSol crest with a "GolfSol · Ireland" wordmark and a shamrock.
 * Uses two layouts:
 *   - overlay  → big crest above the wordmark (stacked, 1 line "GolfSol Ireland"),
 *                hero-scale, sits over the dark hero image
 *   - sticky   → horizontal lockup with smaller crest + wordmark on a white bar
 */
export function GeBrandLockup({ tone, mode, className }: BrandLockupProps) {
  const goldText = 'text-[#f4b41a]'
  const orangeText = 'text-[#ff9b3f]'
  const darkText = 'text-[#0d4a14]'

  if (mode === 'overlay') {
    return (
      <div className={cx('flex items-center gap-2.5 sm:gap-3.5', className)}>
        <img
          src={crest}
          alt=""
          aria-hidden="true"
          width={400}
          height={600}
          decoding="async"
          fetchPriority="high"
          className="h-[80px] w-auto shrink-0 select-none object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)] sm:h-[88px] md:h-[96px] lg:h-[104px]"
        />
        <div className="hidden flex-col items-start gap-0.5 leading-none xl:flex">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cx(
                'font-ge font-extrabold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]',
                'text-[1.35rem] md:text-[1.5rem] lg:text-[1.7rem]',
                tone === 'on-dark' ? goldText : darkText
              )}
            >
              GolfSol
            </span>
            <Shamrock className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            <span
              className={cx(
                'font-ge font-bold uppercase tracking-[0.16em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]',
                'text-[0.78rem] md:text-[0.85rem] lg:text-[0.95rem]',
                tone === 'on-dark' ? orangeText : 'text-[#d96b1a]'
              )}
            >
              Ireland
            </span>
          </div>
          <span
            className={cx(
              'font-ge text-[0.6rem] font-semibold uppercase tracking-[0.22em] lg:text-[0.65rem]',
              tone === 'on-dark' ? 'text-white/75' : 'text-[#0d4a14]/70'
            )}
          >
            Spain · Portugal · Morocco
          </span>
        </div>
      </div>
    )
  }

  if (mode === 'footer') {
    return (
      <div className={cx('flex flex-col items-start gap-4', className)}>
        <img
          src={footerCrest}
          alt="GolfSol Ireland"
          width={800}
          height={533}
          loading="lazy"
          decoding="async"
          className="h-auto w-full max-w-[280px] select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:max-w-[320px] md:max-w-[360px]"
        />
        <div className="flex items-baseline gap-2 leading-none">
          <span className={cx('font-ge text-[1.65rem] font-extrabold tracking-tight md:text-[1.85rem]', goldText)}>
            GolfSol
          </span>
          <Shamrock className="h-6 w-6 md:h-7 md:w-7" />
          <span className={cx('font-ge text-[1rem] font-bold uppercase tracking-[0.18em] md:text-[1.1rem]', orangeText)}>
            Ireland
          </span>
        </div>
        <span className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/70">
          Spain · Portugal · Morocco
        </span>
      </div>
    )
  }

  // sticky compact horizontal lockup
  return (
    <div className={cx('flex items-center gap-2.5', className)}>
      <img
        src={crest}
        alt=""
        aria-hidden="true"
        width={400}
        height={600}
        decoding="async"
        className="h-[44px] w-auto select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)] sm:h-[52px]"
      />
      <div className="flex items-baseline gap-1.5">
        <span
          className={cx(
            'font-ge text-[1.05rem] font-extrabold leading-none tracking-tight sm:text-[1.2rem]',
            tone === 'on-dark' ? goldText : darkText
          )}
        >
          GolfSol
        </span>
        <Shamrock className="h-4 w-4" />
        <span
          className={cx(
            'font-ge text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] sm:text-[0.8rem]',
            tone === 'on-dark' ? orangeText : 'text-[#d96b1a]'
          )}
        >
          Ireland
        </span>
      </div>
    </div>
  )
}
