import type { ReactNode } from 'react'
import { cx } from '../../../lib/utils'
import { SectionDividerBottom, SectionDividerTop, type SectionDividerIntensity } from './section-dividers'
import type { PremiumDividerTone } from './premium-divider-art'

export type PremiumSectionWrapProps = {
  readonly children: ReactNode
  readonly className?: string
  readonly dividerTop?: boolean
  readonly dividerBottom?: boolean
  readonly dividerIntensity?: SectionDividerIntensity
  readonly blendFrom?: PremiumDividerTone
  readonly blendTo?: PremiumDividerTone
}

/**
 * Wraps homepage sections with optional branded ribbon dividers.
 * Keeps existing section markup inside — only adds transition chrome.
 */
export function PremiumSectionWrap({
  children,
  className,
  dividerTop = false,
  dividerBottom = false,
  dividerIntensity = 'full',
  blendFrom = 'cream',
  blendTo = 'cream'
}: PremiumSectionWrapProps) {
  return (
    <div className={cx('relative isolate', className)}>
      {dividerTop ? (
        <SectionDividerTop
          intensity={dividerIntensity}
          blendFrom={blendFrom}
          blendTo={blendTo}
        />
      ) : null}
      <div className="relative z-20">{children}</div>
      {dividerBottom ? (
        <SectionDividerBottom
          intensity={dividerIntensity}
          blendFrom={blendFrom}
          blendTo={blendTo}
        />
      ) : null}
    </div>
  )
}

export { SectionDividerTop, SectionDividerBottom } from './section-dividers'
export type { PremiumDividerTone } from './premium-divider-art'
