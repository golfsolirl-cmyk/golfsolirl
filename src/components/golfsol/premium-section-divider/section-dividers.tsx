import { SectionAtmosphere } from '../../ui/SectionAtmosphere'
import type { PremiumDividerTone } from './premium-divider-art'

export type SectionDividerIntensity = 'full' | 'light'

export type SectionDividerProps = {
  readonly className?: string
  readonly intensity?: SectionDividerIntensity
  readonly blendFrom?: PremiumDividerTone
  readonly blendTo?: PremiumDividerTone
}

export function SectionDividerTop({
  blendFrom = 'cream',
  blendTo = 'cream',
  intensity = 'light',
  className
}: SectionDividerProps) {
  return (
    <SectionAtmosphere
      from={blendFrom}
      to={blendTo}
      crestWatermark={intensity === 'full'}
      className={className}
    />
  )
}

export function SectionDividerBottom(props: SectionDividerProps) {
  return <SectionDividerTop {...props} />
}
