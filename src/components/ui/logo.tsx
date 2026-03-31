import logoIcon from '../../golf-sol-ireland-logo.svg'
import { cx } from '../../lib/utils'

interface LogoProps {
  readonly className?: string
  readonly size?: 'default' | 'large'
  readonly tone?: 'hero' | 'scrolled' | 'light'
}

export function ShamrockIcon({
  className,
  dark = false
}: {
  readonly className?: string
  readonly dark?: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      className={cx(className, dark ? 'text-white' : 'text-forest-700')}
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

  const primaryClassName = isHero ? 'text-[#003805]' : isScrolled ? 'text-white/85' : 'text-[#003805]'
  const secondaryClassName = isScrolled ? 'text-[#f18e4c]' : 'text-[#dc5801]'
  const taglineClassName = isHero ? 'text-white/90' : isScrolled ? 'text-white/50' : 'text-[#4B5563]'
  const heroWordmarkStyle = isHero
    ? {
        textShadow:
          '-1px -1px 0 rgba(255,255,255,0.95), 1px -1px 0 rgba(255,255,255,0.95), -1px 1px 0 rgba(255,255,255,0.95), 1px 1px 0 rgba(255,255,255,0.95), 0 6px 18px rgba(10,32,8,0.28)'
      }
    : undefined
  const heroTextStyle = isHero
    ? {
        textShadow: '0 4px 16px rgba(10,32,8,0.45)'
      }
    : undefined

  return (
    <span
      className={cx(
        'logo-text-content flex min-w-0 items-center gap-4',
        isHero && 'drop-shadow-[0_8px_24px_rgba(10,32,8,0.22)]',
        className
      )}
    >
      <img
        alt=""
        aria-hidden="true"
        className={cx(
          'shrink-0 object-contain',
          isLarge
            ? 'h-32 w-32 scale-[1.55] sm:h-36 sm:w-36 md:h-40 md:w-40'
            : 'h-[5.25rem] w-[5.25rem] scale-[1.2] md:h-28 md:w-28'
        )}
        src={logoIcon}
      />

      <span className="flex min-w-0 flex-col justify-center gap-0.5">
        <span className="flex flex-wrap items-baseline gap-2">
          <span
            className={cx(
              'logo-wordmark logo-wordmark-main min-w-0 font-display font-black uppercase leading-none tracking-[-0.035em]',
              isLarge ? 'text-[2.4rem] sm:text-[2.65rem] md:text-[2.9rem]' : 'text-[1.9rem] md:text-[2.15rem]',
              primaryClassName
            )}
            style={heroWordmarkStyle}
          >
            GolfSol
          </span>
          <ShamrockIcon
            className={cx(
              'shrink-0 self-center',
              isLarge ? 'h-9 w-9 md:h-10 md:w-10' : 'h-7 w-7 md:h-8 md:w-8'
            )}
            dark={isScrolled}
          />
          <span
            className={cx(
              'logo-wordmark logo-wordmark-ireland font-display font-semibold uppercase leading-none tracking-[0.14em]',
              isLarge ? 'text-[1rem] sm:text-[1.02rem] md:text-[1.1rem]' : 'text-[0.82rem] md:text-[0.92rem]',
              secondaryClassName
            )}
            style={heroTextStyle}
          >
            Ireland
          </span>
        </span>

        <span
          className={cx(
            'logo-tagline block pl-0.5 font-body font-medium uppercase tracking-[0.16em] leading-tight',
            isLarge ? 'text-[0.82rem] md:text-[0.84rem]' : 'text-[0.74rem]',
            taglineClassName
          )}
          style={heroTextStyle}
        >
          The future of your golf trip
        </span>
      </span>
    </span>
  )
}
