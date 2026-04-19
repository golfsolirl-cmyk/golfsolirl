import { cx } from '../../../lib/utils'

interface TriangleDividerProps {
  readonly fill?: string
  readonly position?: 'top' | 'bottom'
  readonly height?: number
  readonly variant?: 'simple' | 'layered'
  readonly className?: string
}

/**
 * Divi-style notched-triangle wave divider used by golfexperience.net.
 * Reproduces the SVG geometry M720 140 L640 0 L560 140 H0 V0 H1280 V140 H720z.
 */
export function TriangleDivider({
  fill = '#ffffff',
  position = 'bottom',
  height = 100,
  variant = 'simple',
  className
}: TriangleDividerProps) {
  const flip = position === 'top'

  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none absolute inset-x-0 z-10', position === 'top' ? 'top-0' : 'bottom-0', className)}
      style={{ transform: flip ? 'rotate(180deg)' : undefined, lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 1280 140"
        width="100%"
        height={height}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {variant === 'layered' ? (
          <g fill={fill}>
            <path d="M640 139L0 0v140h1280V0L640 139z" fillOpacity="0.5" />
            <path d="M640 139L0 42v98h1280V42l-640 97z" />
          </g>
        ) : (
          <g fill={fill}>
            <path d="M720 140L640 0l-80 140H0V0h1280v140H720z" />
          </g>
        )}
      </svg>
    </div>
  )
}
