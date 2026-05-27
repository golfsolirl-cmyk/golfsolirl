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
  /** `solid-dark` = forest card on hero photos. `solid-light` = cream card (readable, no blur). */
  readonly shellTone?: 'solid-dark' | 'solid-light'
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
  shellTone = 'solid-light',
  className
}: HeroFormScrollCueProps) {
  const reduceMotion = useReducedMotion()
  const isInline = placement === 'inline'
  const useSolidLight = shellTone === 'solid-light' || isInline

  const shellClass = cx(
    'group relative shrink-0 transition-all duration-300 rounded-2xl border-2',
    ...(useSolidLight
      ? [
          'hero-form-scroll-cue__shell--inline',
          'mx-auto flex w-full max-w-[min(100%,19.75rem)] flex-col items-center gap-2.5 px-4 py-3 sm:max-w-[23rem] sm:flex-row sm:px-4 sm:py-3.5',
          'border-[#d4a843]/55 bg-[#faf8f3] shadow-[0_14px_40px_rgba(6,32,22,0.14)]',
          'hover:border-brand-700/45 hover:bg-white hover:shadow-[0_18px_48px_rgba(6,32,22,0.18)]'
        ]
      : [
          'inline-flex w-full max-w-[21rem] items-center gap-2.5 px-3.5 py-2.5 sm:max-w-[23rem] sm:gap-3 sm:px-4 sm:py-3',
          'shadow-[0_14px_40px_rgba(6,32,22,0.18)]',
          'border-forest-800 bg-forest-950 text-white',
          'hover:border-[#d4a843]/80 hover:bg-forest-900 hover:shadow-[0_18px_48px_rgba(6,32,22,0.28)]'
        ])
  )

  const labelClass = cx(
    'hero-form-scroll-cue__label block font-ge text-[0.78rem] font-extrabold uppercase leading-snug tracking-[0.1em] sm:text-[0.84rem] sm:tracking-[0.11em]',
    isInline && 'text-center'
  )

  const sublabelClass = cx(
    'hero-form-scroll-cue__sublabel mt-0.5 block font-ge text-[0.88rem] leading-snug sm:text-[0.94rem]',
    isInline && 'text-center'
  )

  const linkClass = cx(
    isInline
      ? 'relative z-10 flex w-full justify-center px-5 py-1'
      : 'absolute bottom-4 left-1/2 z-30 max-w-[calc(100%-1.5rem)] -translate-x-1/2 sm:bottom-5 md:max-w-[min(100%,21rem)]',
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
          <span className="hero-form-scroll-cue__aside font-ge text-[0.72rem] font-bold uppercase leading-snug tracking-[0.16em] sm:text-[0.74rem]">
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
      transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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
