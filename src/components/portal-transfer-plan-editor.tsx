import { useCallback } from 'react'
import { COURSES, getCostaDelSolHotelPicklist } from '../data/coastal-golf-data'
import type { PortalGolfTransferLeg, PortalHotelTransferLeg, PortalTransferPlan } from '../lib/package-build'
import { cx } from '../lib/utils'

const inputClass =
  'w-full rounded-xl border-2 border-ge-gray200 bg-white px-3 py-2.5 font-ge text-sm text-gs-dark outline-none transition-[border-color,box-shadow] focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

const labelClass = 'mb-1.5 block font-ge text-xs font-bold uppercase tracking-[0.14em] text-gs-green'

const coursesSorted = [...COURSES].sort((a, b) => a.name.localeCompare(b.name, 'en'))
const hotelsSorted = getCostaDelSolHotelPicklist()

interface PortalTransferPlanEditorProps {
  readonly value: PortalTransferPlan
  readonly onChange: (next: PortalTransferPlan) => void
  readonly disabled?: boolean
}

export function PortalTransferPlanEditor({ value, onChange, disabled }: PortalTransferPlanEditorProps) {
  const setGolfLegs = useCallback(
    (next: readonly PortalGolfTransferLeg[]) => {
      onChange({ ...value, golfLegs: next })
    },
    [onChange, value]
  )

  const setHotelLegs = useCallback(
    (next: readonly PortalHotelTransferLeg[]) => {
      onChange({ ...value, hotelLegs: next })
    },
    [onChange, value]
  )

  const addGolfLeg = () => {
    setGolfLegs([...value.golfLegs, { courseId: '', notes: '' }])
  }

  const addHotelLeg = () => {
    setHotelLegs([...value.hotelLegs, { hotelName: '', notes: '' }])
  }

  const updateGolf = (index: number, patch: Partial<PortalGolfTransferLeg>) => {
    const next = value.golfLegs.map((row, i) => (i === index ? { ...row, ...patch } : row))
    setGolfLegs(next)
  }

  const updateHotel = (index: number, patch: Partial<PortalHotelTransferLeg>) => {
    const next = value.hotelLegs.map((row, i) => (i === index ? { ...row, ...patch } : row))
    setHotelLegs(next)
  }

  const removeGolf = (index: number) => {
    if (value.golfLegs.length <= 1) {
      setGolfLegs([{ courseId: '', notes: '' }])
      return
    }
    setGolfLegs(value.golfLegs.filter((_, i) => i !== index))
  }

  const removeHotel = (index: number) => {
    if (value.hotelLegs.length <= 1) {
      setHotelLegs([{ hotelName: '', notes: '' }])
      return
    }
    setHotelLegs(value.hotelLegs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 rounded-2xl border border-[#d9d9d9] bg-[#FFFBF7] p-5 shadow-inner sm:p-6">
      <div>
        <p className="font-display text-base font-semibold text-gs-dark">Golf course transfers (Costa del Sol)</p>
        <p className="mt-1 text-sm text-forest-600">
          Pick each course you want golf-day transport to or from. Add timing or pickup notes if you have them.
        </p>
        <div className="mt-4 space-y-4">
          {value.golfLegs.map((leg, index) => (
            <div
              className="rounded-2xl border border-forest-200/80 bg-white p-4 shadow-sm"
              key={`golf-${String(index)}`}
            >
              <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                <div>
                  <label className={labelClass} htmlFor={`portal-golf-course-${index}`}>
                    Course
                  </label>
                  <select
                    className={inputClass}
                    disabled={disabled}
                    id={`portal-golf-course-${index}`}
                    onChange={(e) => updateGolf(index, { courseId: e.target.value })}
                    value={leg.courseId}
                  >
                    <option value="">Select a course…</option>
                    {coursesSorted.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.region}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor={`portal-golf-notes-${index}`}>
                    Notes (optional)
                  </label>
                  <input
                    className={inputClass}
                    disabled={disabled}
                    id={`portal-golf-notes-${index}`}
                    onChange={(e) => updateGolf(index, { notes: e.target.value })}
                    placeholder="e.g. morning tee, pickup at hotel 07:30"
                    type="text"
                    value={leg.notes}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor={`portal-golf-pickup-${index}`}>
                    Pick-up date &amp; time (optional)
                  </label>
                  <input
                    className={inputClass}
                    disabled={disabled}
                    id={`portal-golf-pickup-${index}`}
                    onChange={(e) => updateGolf(index, { pickupAtLocal: e.target.value })}
                    type="datetime-local"
                    value={leg.pickupAtLocal ?? ''}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  className="font-ge text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500 underline-offset-2 hover:text-brand-700 hover:underline disabled:opacity-40"
                  disabled={disabled}
                  type="button"
                  onClick={() => removeGolf(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            className="rounded-full border border-dashed border-gs-green/40 px-4 py-2 font-ge text-xs font-bold uppercase tracking-[0.14em] text-gs-green hover:bg-gs-green/5 disabled:opacity-40"
            disabled={disabled}
            type="button"
            onClick={addGolfLeg}
          >
            + Add another course
          </button>
        </div>
      </div>

      <div className="border-t border-[#d9d9d9] pt-8">
        <p className="font-display text-base font-semibold text-gs-dark">Hotel &amp; resort transfers</p>
        <p className="mt-1 text-sm text-forest-600">
          Choose your base hotel from our Costa del Sol shortlist (from course vicinities). Add notes for split stays or
          multiple pickups.
        </p>
        <div className="mt-4 space-y-4">
          {value.hotelLegs.map((leg, index) => (
            <div
              className="rounded-2xl border border-forest-200/80 bg-white p-4 shadow-sm"
              key={`hotel-${String(index)}`}
            >
              <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor={`portal-hotel-${index}`}>
                    Hotel / resort
                  </label>
                  <select
                    className={inputClass}
                    disabled={disabled}
                    id={`portal-hotel-${index}`}
                    onChange={(e) => updateHotel(index, { hotelName: e.target.value })}
                    value={leg.hotelName}
                  >
                    <option value="">Select a hotel…</option>
                    {hotelsSorted.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor={`portal-hotel-notes-${index}`}>
                    Notes (optional)
                  </label>
                  <input
                    className={inputClass}
                    disabled={disabled}
                    id={`portal-hotel-notes-${index}`}
                    onChange={(e) => updateHotel(index, { notes: e.target.value })}
                    placeholder="e.g. second villa in Estepona, luggage van"
                    type="text"
                    value={leg.notes}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor={`portal-hotel-pickup-${index}`}>
                    Pick-up date &amp; time (optional)
                  </label>
                  <input
                    className={inputClass}
                    disabled={disabled}
                    id={`portal-hotel-pickup-${index}`}
                    onChange={(e) => updateHotel(index, { pickupAtLocal: e.target.value })}
                    type="datetime-local"
                    value={leg.pickupAtLocal ?? ''}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  className="font-ge text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500 underline-offset-2 hover:text-brand-700 hover:underline disabled:opacity-40"
                  disabled={disabled}
                  type="button"
                  onClick={() => removeHotel(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            className="rounded-full border border-dashed border-gs-green/40 px-4 py-2 font-ge text-xs font-bold uppercase tracking-[0.14em] text-gs-green hover:bg-gs-green/5 disabled:opacity-40"
            disabled={disabled}
            type="button"
            onClick={addHotelLeg}
          >
            + Add another hotel leg
          </button>
        </div>
      </div>

      {value.updatedAt ? (
        <p className={cx('text-xs text-ge-gray500', disabled && 'opacity-60')}>
          Last saved to your package: {new Date(value.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      ) : null}
    </div>
  )
}
