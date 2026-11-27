import { cx } from '../lib/utils'

type IrishFlagEmblemProps = {
  readonly className?: string
  readonly title?: string
  readonly size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'h-5 w-[1.9rem]',
  md: 'h-6 w-[2.25rem]',
  lg: 'h-8 w-[3rem]'
} as const

/** Crisp SVG Irish tricolour — avoids emoji flags that break on Windows. */
export function IrishFlagEmblem({
  className,
  title = 'Ireland',
  size = 'md'
}: IrishFlagEmblemProps) {
  return (
    <svg
      className={cx(
        'shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.22)] ring-1 ring-black/15',
        sizeClass[size],
        className
      )}
      viewBox="0 0 30 20"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect width="10" height="20" fill="#169B62" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#FF883E" />
    </svg>
  )
}
