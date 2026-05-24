import { cx } from '../../../lib/utils'

interface GeCrestDividerProps {
  readonly className?: string
  readonly variant?: 'light' | 'dark'
}

/** Logo-inspired chrome + gold rule — ties homepage sections together. */
export function GeCrestDivider({ className, variant = 'light' }: GeCrestDividerProps) {
  const line =
    variant === 'dark'
      ? 'from-transparent via-[#d9be7a]/55 to-transparent'
      : 'from-transparent via-brand-700/45 to-transparent'

  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none flex w-full items-center justify-center px-5 sm:px-8', className)}
    >
      <span className={cx('h-px flex-1 max-w-[9rem] bg-gradient-to-r sm:max-w-[12rem]', line)} />
      <span className="mx-3 inline-flex h-2 w-2 rotate-45 border border-[#d9be7a]/70 bg-gs-green shadow-[0_0_12px_rgba(19,96,71,0.35)] sm:mx-4" />
      <span className={cx('h-px flex-1 max-w-[9rem] bg-gradient-to-r sm:max-w-[12rem]', line)} />
    </div>
  )
}
