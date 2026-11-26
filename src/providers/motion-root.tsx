import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Lazy-loaded DOM animation features — use `m` from `framer-motion` inside this tree (strict mode).
 * Public pages skip scroll-reveal / fade-in motion so content does not pop in piece by piece.
 * Admin / portal keep normal motion.
 */
export function MotionRoot({ children }: { readonly children: ReactNode }) {
  const path =
    typeof window !== 'undefined'
      ? window.location.pathname.replace(/\/+$/, '') || '/'
      : '/'
  const keepMotion =
    path.startsWith('/dashboard') ||
    path.startsWith('/driver') ||
    path.startsWith('/documents') ||
    path.startsWith('/packages-admin') ||
    path.startsWith('/package-admin') ||
    path.startsWith('/auth/')

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={keepMotion ? 'user' : 'always'}>{children}</MotionConfig>
    </LazyMotion>
  )
}
