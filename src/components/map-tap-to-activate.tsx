import { useState, type ReactNode } from 'react'
import { cx } from '../lib/utils'

type MapTapToActivateProps = {
  readonly children: ReactNode
  readonly className?: string
  readonly label?: string
  readonly onActivate?: () => void
  readonly active?: boolean
}

/**
 * Overlay so page scroll wins until the visitor taps (or two-finger pans).
 */
export function MapTapToActivate({
  children,
  className,
  label = 'Tap to use the map',
  onActivate,
  active: controlledActive
}: MapTapToActivateProps) {
  const [localActive, setLocalActive] = useState(false)
  const active = controlledActive ?? localActive

  return (
    <div className={cx('relative overflow-hidden', className)}>
      {children}
      {!active ? (
        <button
          type="button"
          className="absolute inset-0 z-[500] flex cursor-pointer items-end justify-center bg-transparent pb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-inset"
          aria-label={label}
          onClick={() => {
            setLocalActive(true)
            onActivate?.()
          }}
          onTouchStart={(event) => {
            if (event.touches.length >= 2) {
              setLocalActive(true)
              onActivate?.()
            }
          }}
        >
          <span className="pointer-events-none rounded-full border border-forest-200/80 bg-white/95 px-3 py-1.5 font-ge text-[0.68rem] font-bold uppercase tracking-[0.12em] text-forest-900 shadow-md">
            {label}
          </span>
        </button>
      ) : null}
    </div>
  )
}
