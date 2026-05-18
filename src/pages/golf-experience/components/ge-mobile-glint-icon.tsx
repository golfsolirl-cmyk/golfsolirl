import { m  } from 'framer-motion'
import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../../../lib/utils'

/** Outer yellow→green jewel bezel — matches the airport-transfer brand gradient. */
const chromeOuter =
  'group relative inline-flex h-[3.25rem] w-[3.25rem] shrink-0 rounded-full p-[2px] sm:h-[3.375rem] sm:w-[3.375rem] ' +
  'bg-gradient-to-br from-[#fff3a0] via-[#9fd957] to-[#136047] ' +
  'shadow-[0_4px_16px_rgba(19,96,71,0.4),0_0_0_1px_rgba(159,217,87,0.55),inset_0_1px_0_rgba(255,255,255,0.85)] ' +
  'transition-[transform,box-shadow,filter] duration-200 hover:shadow-[0_6px_22px_rgba(19,96,71,0.55),0_0_0_1px_rgba(255,243,160,0.85)] hover:brightness-[1.04] active:scale-[0.97] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136047] focus-visible:ring-offset-2 focus-visible:ring-offset-white'

/** Inner pearl face + inset green hairline. */
const chromeInner =
  'relative flex h-full w-full items-center justify-center overflow-hidden rounded-full ' +
  'bg-gradient-to-b from-white via-[#f4faec] to-[#e1f1d6] ' +
  'ring-1 ring-inset ring-[#136047]/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]'

function GlintShimmerLayers() {
  return (
    <>
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        style={{ mixBlendMode: 'soft-light' }}
      >
        <m.span
          className="absolute inset-y-0 w-[70%] -skew-x-[19deg] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"
          animate={{ x: ['-150%', '170%'] }}
          transition={{ duration: 2.35, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
        />
      </m.span>
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 28% 22%, rgba(255,255,255,0.9) 0%, transparent 50%), radial-gradient(ellipse 70% 55% at 78% 88%, rgba(19,96,71,0.5) 0%, transparent 52%)',
          mixBlendMode: 'overlay'
        }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[4px] rounded-full border border-[#136047]/30 opacity-85"
      />
    </>
  )
}

function GlintFace({ children }: { readonly children: ReactNode }) {
  return (
    <span className={chromeInner}>
      <GlintShimmerLayers />
      <span className="relative z-10 flex items-center justify-center text-gs-green transition-colors duration-200 group-hover:text-gs-dark">
        {children}
      </span>
    </span>
  )
}

export function GeMobileGlintIconLink({
  children,
  className,
  ...rest
}: ComponentProps<'a'>) {
  return (
    <a className={cx(chromeOuter, className)} {...rest}>
      <GlintFace>{children}</GlintFace>
    </a>
  )
}

export function GeMobileGlintIconButton({
  children,
  className,
  ...rest
}: ComponentProps<'button'>) {
  return (
    <button type="button" className={cx(chromeOuter, className)} {...rest}>
      <GlintFace>{children}</GlintFace>
    </button>
  )
}
