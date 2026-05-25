import { useReducedMotion } from 'framer-motion'
import { m } from 'framer-motion'
import { cx } from '../../lib/utils'
import '../../styles/section-shadow-bridge.css'

export type SectionShadowBridgeVariant = 'plateau-to-dark' | 'soft-lift'

const VARIANT_CLASS: Record<SectionShadowBridgeVariant, string> = {
  'plateau-to-dark': 'section-shadow-bridge--plateau-to-dark',
  'soft-lift': 'section-shadow-bridge--soft-lift'
}

export type SectionShadowBridgeProps = {
  readonly variant: SectionShadowBridgeVariant
  readonly className?: string
}

/**
 * Layered depth shadow between sections — the block above feels lifted,
 * the block below feels recessed. No gradient colour-morph strip.
 */
export function SectionShadowBridge({ variant, className }: SectionShadowBridgeProps) {
  const reduceMotion = useReducedMotion()

  return (
    <m.div
      aria-hidden
      className={cx('section-shadow-bridge', VARIANT_CLASS[variant], className)}
      initial={reduceMotion ? false : { opacity: 0.55 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="section-shadow-bridge__rim" />
      <span className="section-shadow-bridge__cast" />
      <span className="section-shadow-bridge__well" />
    </m.div>
  )
}
