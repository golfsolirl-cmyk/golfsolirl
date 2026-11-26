import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'
import { PublicScrollEnter } from '../components/public-scroll-enter'

/**
 * Lazy-loaded DOM animation features — use `m` from `framer-motion` inside this tree (strict mode).
 * Public pages get subtle CSS scroll-enter (PublicScrollEnter); Framer respects prefers-reduced-motion.
 */
export function MotionRoot({ children }: { readonly children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <PublicScrollEnter />
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
