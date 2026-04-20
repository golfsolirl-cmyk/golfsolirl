import type { ReactNode } from 'react'
import { cx } from '../../../lib/utils'
import { TriangleDivider } from './triangle-divider'

interface DividerSpec {
  readonly fill: string
  readonly variant?: 'simple' | 'layered'
  readonly height?: number
}

interface GeSectionProps {
  readonly id?: string
  readonly children: ReactNode
  readonly background?: 'white' | 'gray' | 'teal' | 'tealDark' | 'blue' | 'ink'
  readonly className?: string
  readonly innerClassName?: string
  readonly topDivider?: DividerSpec
  readonly bottomDivider?: DividerSpec
  readonly fullBleed?: boolean
}

const backgrounds = {
  white: 'bg-white text-gs-dark',
  gray: 'bg-ge-gray50 text-gs-dark',
  teal: 'bg-ge-teal text-white',
  tealDark: 'bg-ge-teal-dark text-white',
  blue: 'bg-gs-green text-white',
  ink: 'bg-gs-dark text-white'
} as const

export function GeSection({
  id,
  children,
  background = 'white',
  className,
  innerClassName,
  topDivider,
  bottomDivider,
  fullBleed = false
}: GeSectionProps) {
  return (
    <section
      id={id}
      className={cx('relative overflow-hidden', backgrounds[background], className)}
    >
      {topDivider ? (
        <TriangleDivider
          fill={topDivider.fill}
          position="top"
          variant={topDivider.variant ?? 'simple'}
          height={topDivider.height ?? 100}
        />
      ) : null}

      <div
        className={cx(
          'relative z-20 mx-auto',
          fullBleed ? 'max-w-none px-0' : 'max-w-[1180px] px-5 sm:px-8',
          // Padding is generous to match Divi sections
          topDivider ? 'pt-28 sm:pt-32' : 'pt-16 sm:pt-20',
          bottomDivider ? 'pb-28 sm:pb-32' : 'pb-16 sm:pb-20',
          innerClassName
        )}
      >
        {children}
      </div>

      {bottomDivider ? (
        <TriangleDivider
          fill={bottomDivider.fill}
          position="bottom"
          variant={bottomDivider.variant ?? 'simple'}
          height={bottomDivider.height ?? 100}
        />
      ) : null}
    </section>
  )
}
