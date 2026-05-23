import { m, useReducedMotion } from 'framer-motion'
import { ClipboardPen } from 'lucide-react'
import { handleScrollToFormTarget } from '../../lib/scroll-to-form-target'
import { cx } from '../../lib/utils'

/** Homepage-style scroll cue copy — reused across marketing heroes. */
export const HERO_FORM_SCROLL_DEFAULT_LABEL = 'Plan your trip here'
export const HERO_FORM_SCROLL_DEFAULT_SUBLABEL = 'Quick quote form below'

export type HeroFormScrollCueProps = {
  readonly href: string
  readonly label?: string
  readonly sublabel?: string
  /** `overlay` = on the hero photo (desktop). `inline` = below the photo on mobile. */
  readonly placement?: 'overlay' | 'inline'
  readonly className?: string
}

/**
 * Scroll cue to the enquiry form.
 * Overlay: white type on dark translucent shell over the hero photo.
 * Inline: light card and dark type for rails on cream (e.g. mobile PremiumPageHero).
 */
export function HeroFormScrollCue({
  href,
  label = HERO_FORM_SCROLL_DEFAULT_LABEL,
  sublabel = HERO_FORM_SCROLL_DEFAULT_SUBLABEL,
  placement = 'overlay',
  className
}: HeroFormScrollCueProps) {
  const reduceMotion = useReducedMotion()
  const isInline = placement === 'inline'

  const shellClass = cx(
    'group relative shrink-0 transition-all duration-300 rounded-2xl border-2',
    ...(isInline
      ? [
          'hero-form-scroll-cue__shell--inline',
          'mx-auto flex w-full max-w-[min(100%,18.5rem)] flex-col items-center gap-2.5 px-4 py-3',
          'border-forest-800/25 bg-white shadow-[0_12px_36px_rgba(6,32,22,0.1)]',
          'hover:border-[#d4a843]/80 hover:bg-[#faf8f3] hover:shadow-[0_18px_48px_rgba(6,32,22,0.16)]'
        ]
      : [
          'inline-flex w-full max-w-[20rem] items-center gap-2.5 px-3.5 py-2.5 sm:max-w-[22rem] sm:gap-3 sm:px-4 sm:py-3',
          'shadow-[0_14px_40px_rgba(6,32,22,0.18)] backdrop-blur-md',
          'border-white/30 bg-forest-950/72',
          'hover:border-[#d4a843]/80 hover:bg-[#faf8f3] hover:shadow-[0_18px_48px_rgba(6,32,22,0.28)]'
        ])
  )

  const labelClass = cx(
    'hero-form-scroll-cue__label block font-ge text-[0.68rem] font-extrabold uppercase leading-snug tracking-[0.12em] sm:text-[0.72rem]',
    isInline && 'text-center'
  )

  const sublabelClass = cx(
    'hero-form-scroll-cue__sublabel mt-0.5 block font-ge text-[0.78rem] leading-snug sm:text-[0.82rem]',
    isInline && 'text-center'
  )

  const linkClass = cx(
    isInline
      ? 'relative z-10 flex w-full justify-center px-5 py-1'
      : 'absolute bottom-4 left-1/2 z-30 max-w-[calc(100%-1.5rem)] -translate-x-1/2 sm:bottom-5 md:max-w-[min(100%,20rem)]',
    className
  )

  const content = (
    <span className={cx(shellClass, 'hero-form-scroll-cue__shell')}>
      <span
        aria-hidden
        className={cx(
          'inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest-800 to-brand-700 text-white shadow-[0_6px_18px_rgba(11,77,59,0.35)] ring-2',
          isInline ? 'h-9 w-9 ring-forest-800/15' : 'h-10 w-10 ring-white/50 sm:h-11 sm:w-11'
        )}
      >
        <ClipboardPen className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
      </span>
      <span className={cx('min-w-0', isInline ? 'w-full px-1' : 'flex-1')}>
        <span className={labelClass}>{label}</span>
        <span className={sublabelClass}>{sublabel}</span>
      </span>
      {!isInline ? (
        <span aria-hidden className="hidden shrink-0 flex-col items-center gap-0.5 sm:flex">
          <span className="h-6 w-px bg-gradient-to-b from-[#d4a843]/90 to-white/40 group-hover:from-[#d4a843] group-hover:to-forest-800/30" />
          <span className="hero-form-scroll-cue__aside font-ge text-[0.65rem] font-bold uppercase tracking-[0.2em]">
            Form
          </span>
        </span>
      ) : null}
    </span>
  )

  return (
    <m.a
      href={href}
      onClick={(event) => handleScrollToFormTarget(event, href)}
      aria-label={`${label}. ${sublabel}`}
      className={linkClass}
      initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
      {!reduceMotion && !isInline ? (
        <m.span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.15rem] border border-[#d4a843]/40"
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
    </m.a>
  )
}
