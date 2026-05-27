import { useEffect, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { cx } from '../lib/utils'

export const BRAND_PLANE_TO_FAIRWAY_TAGLINE = 'From Plane to Fairway'

export const BRAND_TAGLINE_MESSAGES = [
  { id: 'plane', before: 'From Plane', highlight: 'to Fairway' },
  { id: 'insured', before: 'All Transfers', highlight: 'Fully Insured' },
  { id: 'payments', before: 'All Payments Made', highlight: 'In Ireland' }
] as const

const CYCLE_MS = 3800
const TRANSITION = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }

type BrandPlaneToFairwayTaglineProps = {
  readonly tone?: 'light' | 'dark'
  /** Header ribbon = compact inline strip. Footer = wider editorial lockup. */
  readonly layout?: 'ribbon' | 'footer'
  readonly className?: string
}

function AnimatedTaglineText({
  tone,
  layout,
  messageIndex
}: {
  readonly tone: 'light' | 'dark'
  readonly layout: 'ribbon' | 'footer'
  readonly messageIndex: number
}) {
  const isDark = tone === 'dark'
  const isFooter = layout === 'footer'
  const message = BRAND_TAGLINE_MESSAGES[messageIndex]
  const reduceMotion = useReducedMotion()

  const highlightClass = isDark ? 'text-[#f4dfa6]' : 'text-brand-700'
  const baseClass = isDark ? 'text-white' : 'text-forest-950'

  const textVariants = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: TRANSITION
      }

  if (isFooter) {
    return (
      <span className="grid min-w-0 grid-cols-1 grid-rows-1 text-left leading-tight">
        <AnimatePresence mode="wait">
          <m.span
            key={message.id}
            className="col-start-1 row-start-1 flex flex-col justify-center"
            {...textVariants}
          >
            <span className={cx('block font-display text-[1.05rem] font-bold tracking-[-0.02em] sm:text-[1.14rem]', baseClass)}>
              {message.before}
            </span>
            <span className={cx('mt-0.5 block font-display text-[1.05rem] font-bold tracking-[-0.02em] sm:text-[1.14rem]', highlightClass)}>
              {message.highlight}
            </span>
          </m.span>
        </AnimatePresence>
      </span>
    )
  }

  return (
    <span className="grid min-w-0 grid-cols-1 grid-rows-1">
      <AnimatePresence mode="wait">
        <m.span
          key={message.id}
          className={cx(
            'col-start-1 row-start-1 flex min-w-0 flex-col items-center text-center leading-tight sm:flex-row sm:items-baseline sm:text-left',
            'font-display font-bold tracking-[-0.015em]',
            'text-[0.78rem] sm:whitespace-nowrap sm:text-[0.94rem] md:text-[0.98rem]',
            baseClass
          )}
          {...textVariants}
        >
          <span className="block sm:inline">{message.before}</span>
          <span className={cx('hidden font-normal opacity-45 sm:mx-1 sm:inline', highlightClass)} aria-hidden>
            ·
          </span>
          <span className={cx('block sm:inline', highlightClass)}>{message.highlight}</span>
        </m.span>
      </AnimatePresence>
    </span>
  )
}

function useTaglineCycle(enabled: boolean) {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % BRAND_TAGLINE_MESSAGES.length)
    }, CYCLE_MS)
    return () => window.clearInterval(id)
  }, [enabled, reduceMotion])

  return reduceMotion ? 0 : index
}

/**
 * Brand tagline with rotating trust messages.
 * Flat inline layout — no pill container.
 */
export function BrandPlaneToFairwayTagline({
  tone = 'light',
  layout = 'ribbon',
  className
}: BrandPlaneToFairwayTaglineProps) {
  const isFooter = layout === 'footer'
  const messageIndex = useTaglineCycle(true)
  const liveMessage = BRAND_TAGLINE_MESSAGES[messageIndex]

  return (
    <div
      className={cx(
        'inline-flex min-w-0 max-w-full items-center',
        isFooter ? '' : 'w-full justify-center sm:w-auto sm:justify-start',
        className
      )}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${liveMessage.before} ${liveMessage.highlight}`}
    >
      <AnimatedTaglineText tone={tone} layout={layout} messageIndex={messageIndex} />
    </div>
  )
}
