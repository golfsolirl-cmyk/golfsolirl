import { AIRPORT_CORRIDOR_HOTELS } from '../data/airport-corridor-hotels'
import { COURSES } from '../data/coastal-golf-data'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'
import { MALAGA_AIRPORT_REF, type PortalTransferStop, type PortalTransferStopKind } from '../lib/trip-workspace-draft'

const inputClass =
  'w-full rounded-2xl border-2 border-orange-400 bg-white px-4 py-3 text-sm text-forest-900 outline-none transition-[border-color,box-shadow] focus:border-orange-500 focus:ring-2 focus:ring-orange-300/70'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-brand-600'

export const transferStopDisplayLabel = (stop: PortalTransferStop): string => {
  if (stop.kind === 'malaga_airport') {
    return 'Málaga Airport (AGP)'
  }
  if (stop.kind === 'hotel') {
    const h = AIRPORT_CORRIDOR_HOTELS.find((x) => x.slug === stop.ref)
    return h?.name ?? stop.ref
  }
  const c = COURSES.find((x) => x.id === stop.ref)
  return c ? `${c.name} — ${c.region}` : stop.ref
}

const stopSummaryLine = (stop: PortalTransferStop): string => {
  const base = transferStopDisplayLabel(stop)
  const t = stop.pickupAtLocal?.trim()
  return t ? `${base} (${t.replace('T', ' ')})` : base
}

export const formatTransferRouteSummary = (stops: readonly PortalTransferStop[]): string =>
  stops.map(stopSummaryLine).join(' → ')

const kindOptionsForIndex = (index: number): { value: PortalTransferStopKind; label: string }[] => {
  if (index === 0) {
    return [
      { value: 'malaga_airport', label: 'Málaga Airport (AGP)' },
      { value: 'hotel', label: 'Hotel (Costa del Sol)' }
    ]
  }
  return [
    { value: 'malaga_airport', label: 'Málaga Airport (AGP)' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'golf_course', label: 'Golf course' }
  ]
}

interface PortalTransferRouteBuilderProps {
  readonly stops: readonly PortalTransferStop[]
  readonly onStopsChange: (next: PortalTransferStop[]) => void
  readonly contactPhone: string
  readonly onContactPhoneChange: (value: string) => void
  readonly partySize: number
  readonly onClose: () => void
}

export function PortalTransferRouteBuilder({
  stops,
  onStopsChange,
  contactPhone,
  onContactPhoneChange,
  partySize,
  onClose
}: PortalTransferRouteBuilderProps) {
  const summary = formatTransferRouteSummary(stops)

  const carryPickup = (cur: PortalTransferStop): Partial<Pick<PortalTransferStop, 'pickupAtLocal'>> => {
    const v = cur.pickupAtLocal?.trim()
    return v ? { pickupAtLocal: v } : {}
  }

  const replaceStop = (index: number, stop: PortalTransferStop) => {
    onStopsChange(stops.map((s, i) => (i === index ? stop : s)))
  }

  const handleKindChange = (index: number, kind: PortalTransferStopKind) => {
    const cur = stops[index]
    if (kind === 'malaga_airport') {
      replaceStop(index, { kind: 'malaga_airport', ref: MALAGA_AIRPORT_REF, ...carryPickup(cur) })
      return
    }
    if (kind === 'hotel') {
      const ref =
        cur.kind === 'hotel' && AIRPORT_CORRIDOR_HOTELS.some((h) => h.slug === cur.ref)
          ? cur.ref
          : (AIRPORT_CORRIDOR_HOTELS[0]?.slug ?? '')
      replaceStop(index, { kind: 'hotel', ref, ...carryPickup(cur) })
      return
    }
    const ref =
      cur.kind === 'golf_course' && COURSES.some((c) => c.id === cur.ref) ? cur.ref : (COURSES[0]?.id ?? '')
    replaceStop(index, { kind: 'golf_course', ref, ...carryPickup(cur) })
  }

  const addStop = () => {
    if (stops.length >= 8) {
      return
    }
    onStopsChange([...stops, { kind: 'malaga_airport', ref: MALAGA_AIRPORT_REF }])
  }

  const removeStop = (index: number) => {
    if (index === 0 || stops.length <= 1) {
      return
    }
    onStopsChange(stops.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-2xl border border-fairway-200/90 bg-white p-5 shadow-md md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Transfer route</p>
          <h3 className="font-display mt-1 text-lg font-semibold text-forest-950">Airport, hotels &amp; courses</h3>
          <p className="mt-2 text-xs text-forest-600">
            Pickup is Málaga Airport or a corridor hotel. Add up to eight stops total (pickup + drops). We use this with your
            enquiry reference when you save preferences.
          </p>
        </div>
        <button
          className="shrink-0 rounded-full border border-forest-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-600 transition-colors hover:bg-forest-50"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {stops.map((stop, index) => (
          <div className="rounded-xl border border-forest-100 bg-offwhite/70 p-4" key={index}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-ge-gray500">
                {index === 0 ? 'Pickup' : `Stop ${index + 1}`}
              </span>
              {index > 0 ? (
                <button
                  className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
                  onClick={() => removeStop(index)}
                  type="button"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <label className={labelClass} htmlFor={`transfer-kind-${index}`}>
              Location type
            </label>
            <select
              className={cx(inputClass, 'mt-1')}
              id={`transfer-kind-${index}`}
              onChange={(e) => handleKindChange(index, e.target.value as PortalTransferStopKind)}
              value={stop.kind}
            >
              {kindOptionsForIndex(index).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {stop.kind === 'hotel' ? (
              <div className="mt-3">
                <label className={labelClass} htmlFor={`transfer-hotel-${index}`}>
                  Hotel
                </label>
                <select
                  className={cx(inputClass, 'mt-1')}
                  id={`transfer-hotel-${index}`}
                  onChange={(e) => replaceStop(index, { kind: 'hotel', ref: e.target.value, ...carryPickup(stop) })}
                  value={AIRPORT_CORRIDOR_HOTELS.some((h) => h.slug === stop.ref) ? stop.ref : AIRPORT_CORRIDOR_HOTELS[0]?.slug}
                >
                  {AIRPORT_CORRIDOR_HOTELS.map((h) => (
                    <option key={h.slug} value={h.slug}>
                      {h.name} ({h.stars}★)
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {stop.kind === 'golf_course' ? (
              <div className="mt-3">
                <label className={labelClass} htmlFor={`transfer-course-${index}`}>
                  Golf course
                </label>
                <select
                  className={cx(inputClass, 'mt-1')}
                  id={`transfer-course-${index}`}
                  onChange={(e) => replaceStop(index, { kind: 'golf_course', ref: e.target.value, ...carryPickup(stop) })}
                  value={COURSES.some((c) => c.id === stop.ref) ? stop.ref : COURSES[0]?.id}
                >
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.region}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="mt-3">
              <label className={labelClass} htmlFor={`transfer-pickup-${index}`}>
                Pick-up date &amp; time (optional)
              </label>
              <input
                className={cx(inputClass, 'mt-1')}
                id={`transfer-pickup-${index}`}
                onChange={(e) => replaceStop(index, { ...stop, pickupAtLocal: e.target.value })}
                type="datetime-local"
                value={stop.pickupAtLocal ?? ''}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <LuxuryButton disabled={stops.length >= 8} onClick={addStop} type="button" variant="outline">
          Add stop ({stops.length}/8)
        </LuxuryButton>
      </div>

      <div className="mt-5">
        <label className={labelClass} htmlFor="transfer-contact-phone">
          Contact number (transfers)
        </label>
        <input
          autoComplete="tel"
          className={cx(inputClass, 'mt-1')}
          id="transfer-contact-phone"
          inputMode="tel"
          onChange={(e) => onContactPhoneChange(e.target.value)}
          placeholder="+353…"
          type="tel"
          value={contactPhone}
        />
        <p className="mt-2 text-xs text-ge-gray500">
          Party size for this workspace: <span className="font-semibold text-forest-800">{partySize}</span> (max 8 guests —
          adjust in the list on the left).
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-forest-200/80 bg-white px-4 py-3 text-sm text-forest-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Route preview</p>
        <p className="mt-2 font-medium leading-relaxed text-forest-950">{summary}</p>
      </div>
    </div>
  )
}
