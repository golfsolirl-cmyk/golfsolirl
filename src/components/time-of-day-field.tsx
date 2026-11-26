import type { Ref } from 'react'
import {
  joinTimeOfDay,
  splitTimeOfDay,
  timeOfDayHourOptions,
  timeOfDayMinuteOptions
} from '../lib/time-of-day'

const DEFAULT_SELECT =
  'min-h-[52px] h-13 w-full rounded-xl border border-ge-gray200 bg-white px-3 font-ge text-[1.06rem] text-gs-dark outline-none transition-shadow focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

type TimeOfDayFieldProps = {
  readonly value: string
  readonly onChange: (next: string) => void
  readonly id?: string
  readonly name?: string
  readonly required?: boolean
  readonly disabled?: boolean
  readonly minuteStep?: number
  readonly className?: string
  readonly selectClassName?: string
  readonly hourAriaLabel?: string
  readonly minuteAriaLabel?: string
  readonly hourRef?: Ref<HTMLSelectElement>
}

/**
 * Mobile-reliable time picker: hour + minute selects → `HH:mm`.
 * Avoids native `input[type=time]`, which often fails under custom CSS on iOS/Android.
 */
export function TimeOfDayField({
  value,
  onChange,
  id,
  name = 'timeOfDay',
  required = false,
  disabled = false,
  minuteStep = 5,
  className,
  selectClassName = DEFAULT_SELECT,
  hourAriaLabel = 'Hour',
  minuteAriaLabel = 'Minute',
  hourRef
}: TimeOfDayFieldProps) {
  const { hour, minute } = splitTimeOfDay(value)
  const hours = timeOfDayHourOptions()
  const minutes = timeOfDayMinuteOptions(minuteStep, minute)

  const setHour = (nextHour: string) => {
    if (nextHour === '') {
      onChange('')
      return
    }
    onChange(joinTimeOfDay(nextHour, minute || '00'))
  }

  const setMinute = (nextMinute: string) => {
    if (nextMinute === '') {
      onChange('')
      return
    }
    onChange(joinTimeOfDay(hour || '00', nextMinute))
  }

  return (
    <div
      className={className ?? 'grid grid-cols-2 gap-2'}
      data-time-of-day-field=""
      data-time-value={value || undefined}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <input type="hidden" name={name} value={value} readOnly aria-hidden="true" />
      <label className="block min-w-0">
        <span className="sr-only">{hourAriaLabel}</span>
        <select
          id={id}
          ref={hourRef}
          className={selectClassName}
          value={hour}
          disabled={disabled}
          aria-label={hourAriaLabel}
          aria-required={required || undefined}
          data-time-hour=""
          onChange={(e) => setHour(e.target.value)}
          style={{ position: 'relative', zIndex: 2, touchAction: 'manipulation' }}
        >
          <option value="">Hour</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-0">
        <span className="sr-only">{minuteAriaLabel}</span>
        <select
          className={selectClassName}
          value={minute}
          disabled={disabled}
          aria-label={minuteAriaLabel}
          aria-required={required || undefined}
          data-time-minute=""
          onChange={(e) => setMinute(e.target.value)}
          style={{ position: 'relative', zIndex: 2, touchAction: 'manipulation' }}
        >
          <option value="">Min</option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
