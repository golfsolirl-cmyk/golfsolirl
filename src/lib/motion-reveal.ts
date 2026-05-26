import { useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type RefObject } from 'react'

type UseRevealInViewOptions = {
  readonly once?: boolean
  /** Fraction of element visible before reveal (0–1). Keep low for tall sections. */
  readonly amount?: number
}

const isMostlyInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  if (rect.height <= 0) {
    return false
  }
  const visibleTop = Math.max(rect.top, 0)
  const visibleBottom = Math.min(rect.bottom, vh)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)
  return visibleHeight >= Math.min(rect.height * 0.08, vh * 0.12) && rect.bottom > 0 && rect.top < vh
}

/**
 * Reliable scroll reveal for lazy-loaded below-the-fold sections.
 * `whileInView` alone can miss when the chunk mounts with the node already on screen.
 */
export function useRevealInView<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealInViewOptions = {}
): { readonly ref: RefObject<T | null>; readonly revealed: boolean } {
  const { once = true, amount = 0.06 } = options
  const ref = useRef<T | null>(null)
  const reduceMotion = useReducedMotion()
  const inView = useInView(ref, { once, amount, margin: '0px 0px -6% 0px' })
  const [revealed, setRevealed] = useState(Boolean(reduceMotion))

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true)
      return
    }
    if (inView) {
      setRevealed(true)
      return
    }
    if (!once && !inView) {
      setRevealed(false)
    }
  }, [inView, once, reduceMotion])

  useEffect(() => {
    if (reduceMotion || revealed) {
      return
    }
    const el = ref.current
    if (!el) {
      return
    }

    const check = () => {
      if (isMostlyInViewport(el)) {
        setRevealed(true)
      }
    }

    check()
    const raf = requestAnimationFrame(check)
    const t = window.setTimeout(check, 120)
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [reduceMotion, revealed])

  return { ref, revealed: revealed || Boolean(reduceMotion) }
}
