import { useEffect } from 'react'
import { isMalagaAirportCollectionPoint } from '../lib/malaga-airport-pickup'
import type { TransferPlaceOption } from '../lib/transfer-location-suggestions'
import { TransferPlaceTypeahead } from './transfer-place-typeahead'

export type TransferCollectionPointFieldProps = {
  readonly inputId: string
  readonly flightInputId?: string
  readonly label: string
  readonly hint?: string
  readonly value: string
  readonly onChangeValue: (v: string) => void
  readonly onPickPlace?: (p: TransferPlaceOption) => void
  readonly placeholder?: string
  readonly inputClassName?: string
  readonly labelClassName?: string
  readonly flightNumber: string
  readonly onFlightNumberChange: (v: string) => void
  readonly flightLabel?: string
  readonly flightPlaceholder?: string
}

/**
 * Collection / pickup field with Costa del Sol autosuggest and conditional flight number (AGP / airport keywords).
 */
export function TransferCollectionPointField({
  inputId,
  flightInputId = `${inputId}-flight`,
  label,
  hint,
  value,
  onChangeValue,
  onPickPlace,
  placeholder,
  inputClassName,
  labelClassName,
  flightNumber,
  onFlightNumberChange,
  flightLabel = 'Flight number',
  flightPlaceholder = 'e.g. FR 7044'
}: TransferCollectionPointFieldProps) {
  const showFlight = isMalagaAirportCollectionPoint(value)

  useEffect(() => {
    if (!showFlight) {
      onFlightNumberChange('')
    }
  }, [showFlight, onFlightNumberChange])

  return (
    <div className="min-w-0">
      <span className={labelClassName}>{label}</span>
      <TransferPlaceTypeahead
        inputClassName={inputClassName}
        inputId={inputId}
        onChangeValue={onChangeValue}
        onPickPlace={onPickPlace}
        placeholder={placeholder ?? 'Hotel, golf course, or Málaga Airport (AGP)'}
        value={value}
      />
      {hint ? <span className="mt-1 block font-ge text-sm leading-snug text-ge-gray400 sm:text-[0.95rem]">{hint}</span> : null}
      {showFlight ? (
        <label className="mt-3 block" htmlFor={flightInputId}>
          <span className="mb-1 block font-ge text-sm font-bold uppercase tracking-[0.16em] text-brand-700 sm:text-[0.85rem]">
            {flightLabel}
          </span>
          <input
            autoComplete="off"
            className={inputClassName}
            id={flightInputId}
            name="inboundFlightNumber"
            onChange={(e) => onFlightNumberChange(e.target.value)}
            placeholder={flightPlaceholder}
            type="text"
            value={flightNumber}
          />
          <span className="mt-1 block font-ge text-sm leading-snug text-ge-gray500">
            We track your flight for meet-and-greet at arrivals.
          </span>
        </label>
      ) : null}
    </div>
  )
}
