import { cx } from '../lib/utils'

/** Centered premium gold rule — site-wide section accent (replaces full-width green chrome lines). */
export const geGoldDividerLineClassName =
  'mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent'

interface GeGoldDividerLineProps {
  readonly className?: string
}

export function GeGoldDividerLine({ className }: GeGoldDividerLineProps) {
  return <div aria-hidden="true" className={cx(geGoldDividerLineClassName, className)} />
}

/** Card / panel top accent — centered gold rule inside a relative container. */
export function GeGoldDividerLineAbsoluteTop({ className }: GeGoldDividerLineProps) {
  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none absolute inset-x-0 top-0 flex justify-center', className)}
    >
      <div className={geGoldDividerLineClassName} />
    </div>
  )
}
