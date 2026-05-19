import { useEffect, useMemo, useRef, useState } from 'react'
import { filterTransferPlaceOptions, type TransferPlaceOption } from '../lib/transfer-location-suggestions'
import { cx } from '../lib/utils'

export type TransferPlaceTypeaheadProps = {
  readonly inputId: string
  readonly value: string
  readonly onChangeValue: (v: string) => void
  readonly onPickPlace?: (p: TransferPlaceOption) => void
  readonly placeholder?: string
  readonly inputClassName?: string
  readonly listClassName?: string
}

/**
 * Costa del Sol hotels, golf courses, and airports — typeahead (no native datalist).
 */
export function TransferPlaceTypeahead({
  inputId,
  value,
  onChangeValue,
  onPickPlace,
  placeholder,
  inputClassName,
  listClassName
}: TransferPlaceTypeaheadProps) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const blurTimer = useRef<number | null>(null)
  const suggestions = useMemo(() => filterTransferPlaceOptions(value, 14), [value])

  useEffect(() => {
    if (!open) {
      return
    }
    setHi(0)
  }, [value, open])

  const cancelBlurTimer = () => {
    if (blurTimer.current != null) {
      window.clearTimeout(blurTimer.current)
      blurTimer.current = null
    }
  }

  const scheduleClose = () => {
    cancelBlurTimer()
    blurTimer.current = window.setTimeout(() => setOpen(false), 160)
  }

  const pick = (s: TransferPlaceOption) => {
    onChangeValue(s.label)
    onPickPlace?.(s)
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        autoComplete="off"
        className={cx(
          'mt-1 w-full rounded-xl border-2 border-forest-200 px-3 py-2 text-sm text-forest-900 outline-none ring-fairway-400/30 focus:border-fairway-500 focus:ring-2',
          inputClassName
        )}
        id={inputId}
        onBlur={scheduleClose}
        onChange={(e) => {
          const v = e.target.value
          onChangeValue(v)
          setOpen(v.trim().length >= 2)
        }}
        onFocus={() => {
          cancelBlurTimer()
          if (value.trim().length >= 2) {
            setOpen(true)
          }
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) {
            return
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHi((h) => Math.min(suggestions.length - 1, h + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHi((h) => Math.max(0, h - 1))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            pick(suggestions[hi])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {open && suggestions.length > 0 ? (
        <ul
          className={cx(
            'absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-auto rounded-xl border border-forest-200 bg-white py-1 shadow-lg ring-1 ring-black/5',
            listClassName
          )}
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${i}`} role="option" aria-selected={i === hi}>
              <button
                className={cx(
                  'w-full px-3 py-2.5 text-left text-sm text-forest-900 transition-colors',
                  i === hi ? 'bg-fairway-50' : 'hover:bg-offwhite/90'
                )}
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                onClick={() => pick(s)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
