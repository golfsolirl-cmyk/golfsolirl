import { LazyMotion, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

/** Lazy-loaded DOM animation features — use `m` from `framer-motion` inside this tree (strict mode). */
export function MotionRoot({ children }: { readonly children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
