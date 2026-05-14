import { BrandLogoPicture } from '../brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../lib/brand-logo-assets'
import { cx } from '../../lib/utils'

interface LogoProps {
  readonly className?: string
  readonly size?: 'default' | 'large'
  readonly tone?: 'hero' | 'scrolled' | 'light'
}

/** Brand shamrock fill — matches “Why groups trust” and all inline shamrocks site-wide */
export const shamrockIconColorClassName = 'text-fairway-600'

export function ShamrockIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cx(className, shamrockIconColorClassName)}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="12" cy="6" rx="5" ry="7" transform="rotate(-10 12 6)" />
      <ellipse cx="6.5" cy="14" rx="5" ry="7" transform="rotate(50 6.5 14)" />
      <ellipse cx="17.5" cy="14" rx="5" ry="7" transform="rotate(-50 17.5 14)" />
      <path
        d="M11 14v6c0 .5.4 1 1 1s1-.5 1-1v-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  )
}

export function Logo({ className, size = 'default', tone = 'light' }: LogoProps) {
  const isLarge = size === 'large'
  const isHero = tone === 'hero'
  const isScrolled = tone === 'scrolled'

  return (
    <span
      className={cx(
        'logo-text-content inline-flex min-w-0 items-center',
        isHero && 'drop-shadow-[0_8px_24px_rgba(10,32,8,0.22)]',
        isScrolled && 'drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]',
        className
      )}
    >
      <BrandLogoPicture
        alt="GolfSol Ireland"
        width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
        height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
        className={cx(
          'shrink-0 select-none object-contain',
          isLarge
            ? 'h-auto w-[18rem] sm:w-[21rem] md:w-[24rem]'
            : 'h-auto w-[13rem] sm:w-[15rem] md:w-[17rem]'
        )}
        decoding="async"
      />
    </span>
  )
}
