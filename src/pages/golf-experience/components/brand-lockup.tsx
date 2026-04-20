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

/**
 * Premium tri-leaf shamrock with subtle inner highlight + stem.
 * Sized via className font-size or h-/w-* utilities on the wrapper.
 */
function Shamrock({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 36"
      className={cx('shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="shamLeaf" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7fd07f" />
          <stop offset="55%" stopColor="#3aa53e" />
          <stop offset="100%" stopColor="#1f6c20" />
        </radialGradient>
      </defs>
      <g stroke="#1f6c20" strokeWidth="0.8">
        <ellipse cx="16" cy="8" rx="6" ry="8" transform="rotate(-12 16 8)" fill="url(#shamLeaf)" />
        <ellipse cx="8" cy="17" rx="6" ry="8" transform="rotate(48 8 17)" fill="url(#shamLeaf)" />
        <ellipse cx="24" cy="17" rx="6" ry="8" transform="rotate(-48 24 17)" fill="url(#shamLeaf)" />
      </g>
      <g fill="#fff8d6" opacity="0.55">
        <ellipse cx="14" cy="4.5" rx="1.4" ry="3.4" transform="rotate(-12 14 4.5)" />
        <ellipse cx="5" cy="13" rx="1.4" ry="3.4" transform="rotate(48 5 13)" />
        <ellipse cx="22" cy="13" rx="1.4" ry="3.4" transform="rotate(-48 22 13)" />
      </g>
      <path
        d="M16 18 C 17 24, 16 28, 14 33"
        stroke="#1f6c20"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * The header brand lockup for the GE clone home page (`/`).
 * Pairs the GolfSol crest PNG with a "GolfSol [shamrock] Ireland" wordmark.
 *
 *  - overlay  → big crest above 'GolfSol Ireland' in Dancing Script,
 *               hero-scale, sits over the dark hero image
 *  - sticky   → horizontal compact lockup for the white sticky navbar
 *  - footer   → landscape footer crest with wordmark + tagline beneath
 */
export function GeBrandLockup({ tone, mode, className }: BrandLockupProps) {
  const goldText =
    'bg-[linear-gradient(180deg,#fff7c4_0%,#ffe07a_18%,#f4b41a_55%,#c98a17_85%,#7a4f10_100%)] bg-clip-text text-transparent'
  const orangeText = 'text-[#ff7a1a]'
  const darkText = 'text-[#0d4a14]'

  if (mode === 'overlay') {
    // Overlay: just the crest, BIG. The crest art already contains
    // 'GOLFSOL IRELAND' so we don't repeat it. Tagline sits underneath.
    return (
      <div className={cx('flex flex-col items-start gap-1.5', className)}>
        <img
          src={crest}
          alt="GolfSol Ireland — Irish-owned golf travel"
          width={400}
          height={600}
          decoding="async"
          fetchPriority="high"
          className="h-[130px] w-auto shrink-0 select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:h-[160px] md:h-[190px] lg:h-[210px]"
        />
        <span
          className={cx(
            'pl-1 font-ge text-[0.6rem] font-semibold uppercase tracking-[0.28em] sm:text-[0.65rem] md:text-[0.7rem]',
            tone === 'on-dark' ? 'text-white/85' : 'text-[#0d4a14]/70'
          )}
        >
          Spain · Portugal · Morocco
        </span>
      </div>
    )
  }

  if (mode === 'footer') {
    return (
      <div className={cx('flex flex-col items-start gap-5', className)}>
        <img
          src={footerCrest}
          alt="GolfSol Ireland"
          width={800}
          height={533}
          loading="lazy"
          decoding="async"
          className="h-auto w-full max-w-[300px] select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:max-w-[340px] md:max-w-[380px]"
        />
        <div className="flex flex-col items-start leading-none">
          <span className={cx('font-brand-script text-[2.4rem] font-bold leading-[0.95] md:text-[2.8rem]', goldText)}>
            GolfSol
          </span>
          <div className="mt-1 flex items-center gap-2">
            <Shamrock className="h-6 w-6 md:h-7 md:w-7" />
            <span
              className={cx(
                'font-ge text-[1rem] font-extrabold uppercase leading-none tracking-[0.32em] md:text-[1.1rem]',
                orangeText
              )}
            >
              Ireland
            </span>
          </div>
        </div>
        <span className="font-ge text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/70">
          Spain · Portugal · Morocco
        </span>
      </div>
    )
  }

  // Sticky compact horizontal lockup for the white scrolled navbar.
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <img
        src={crest}
        alt=""
        aria-hidden="true"
        width={400}
        height={600}
        decoding="async"
        className="h-[58px] w-auto shrink-0 select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)] sm:h-[64px]"
      />
      <div className="flex items-center gap-2 leading-none">
        <span
          className={cx(
            'font-brand-script text-[1.55rem] font-bold leading-none sm:text-[1.75rem]',
            tone === 'on-dark' ? goldText : darkText
          )}
        >
          GolfSol
        </span>
        <Shamrock className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        <span
          className={cx(
            'font-ge text-[0.78rem] font-extrabold uppercase leading-none tracking-[0.28em] sm:text-[0.85rem]',
            tone === 'on-dark' ? orangeText : 'text-[#d96b1a]'
          )}
        >
          Ireland
        </span>
      </div>
    </div>
  )
}
