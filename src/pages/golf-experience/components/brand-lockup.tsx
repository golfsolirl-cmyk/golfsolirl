import { motion } from 'framer-motion'
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
    // 'GOLFSOL IRELAND' so we don't repeat the wordmark. Tagline sits
    // beneath on tablets and up; on mobile we hide it to keep the area
    // breathing room next to the hamburger button.
    return (
      <div className={cx('flex flex-col items-start gap-1.5', className)}>
        <img
          src={crest}
          alt="GolfSol Ireland — Irish-owned golf travel"
          width={400}
          height={600}
          decoding="async"
          fetchPriority="high"
          className="h-[180px] w-auto shrink-0 select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] sm:h-[200px] md:h-[200px] lg:h-[220px]"
        />
        <span
          className={cx(
            'hidden pl-1 font-ge text-[0.6rem] font-semibold uppercase tracking-[0.28em] sm:inline sm:text-[0.65rem] md:text-[0.7rem]',
            tone === 'on-dark' ? 'text-white/85' : 'text-gs-dark/70'
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

  // Sticky horizontal lockup for the white navbar — sized to GRAB ATTENTION
  // on mobile (h-[96px] base), with spring entrance + a one-shot gold
  // shimmer sweep on mount and a subtle continuous float to draw the eye.
  return (
    <div className={cx('flex items-center gap-3 sm:gap-4', className)}>
      <motion.div
        className="relative shrink-0"
        initial={{ scale: 0.55, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, mass: 0.7, delay: 0.05 }}
      >
        <motion.img
          src={crest}
          alt=""
          aria-hidden="true"
          width={400}
          height={600}
          decoding="async"
          fetchPriority="high"
          className="relative z-10 block h-[96px] w-auto select-none object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)] sm:h-[104px] md:h-[110px] lg:h-[100px] xl:h-[108px]"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}
        />
        {/* One-shot gold shimmer sweep on mount — a moving gradient mask
            that travels across the crest once when the page loads. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ mixBlendMode: 'screen' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.6, times: [0, 0.15, 0.85, 1], delay: 0.6 }}
        >
          <motion.div
            className="absolute inset-y-0 w-[60%] -skew-x-[20deg]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,231,122,0.0) 25%, rgba(255,231,122,0.85) 50%, rgba(255,231,122,0.0) 75%, transparent 100%)'
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.7 }}
          />
        </motion.div>
        {/* Continuous soft radial glow — drawn behind the crest as a
            blurred radial gradient rather than box-shadow on a rectangle,
            so it reads as an organic warm halo not a square ring. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-4 -z-0"
          style={{
            background:
              'radial-gradient(circle at 50% 55%, rgba(255,199,44,0.55) 0%, rgba(255,199,44,0.18) 35%, rgba(255,199,44,0) 65%)',
            filter: 'blur(12px)'
          }}
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.92, 1.04, 0.92] }}
          transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity, delay: 1.4 }}
        />
      </motion.div>

      <motion.div
        className="flex items-center gap-2 leading-none sm:gap-2.5"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45, duration: 0.45, ease: 'easeOut' }}
      >
        <span
          className={cx(
            'font-brand-script font-bold leading-none',
            'text-[2rem] sm:text-[2.2rem] md:text-[2.4rem] lg:text-[2rem] xl:text-[2.2rem]',
            tone === 'on-dark' ? goldText : darkText
          )}
        >
          GolfSol
        </span>
        <Shamrock className="h-5 w-5 sm:h-[22px] sm:w-[22px] md:h-6 md:w-6 lg:h-5 lg:w-5" />
        <span
          className={cx(
            'font-ge font-extrabold uppercase leading-none tracking-[0.28em]',
            'text-[0.95rem] sm:text-[1.05rem] md:text-[1.1rem] lg:text-[0.95rem] xl:text-[1rem]',
            tone === 'on-dark' ? orangeText : 'text-[#d96b1a]'
          )}
        >
          Ireland
        </span>
      </motion.div>
    </div>
  )
}
