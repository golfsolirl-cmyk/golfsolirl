import {
  TRIP_STEP_STATUSES,
  TRIP_TRACKER_STEPS,
  formatIrishDateTime,
  type TripStepStatus
} from '../../lib/tow-admin-constants'

export type TripStepEmailLogEntry = {
  at: string
  stepId: string
  status: string
  to?: string
  subject?: string
}

type Props = {
  readonly tripTracker: Record<string, TripStepStatus>
  readonly emailOnStepChange: boolean
  readonly emailLog?: readonly TripStepEmailLogEntry[]
  readonly busy?: boolean
  readonly onToggleEmail: (on: boolean) => void
  readonly onStepChange: (stepId: string, status: TripStepStatus) => void
}

/** TOW-style stage checklist — enquiry lead detail and customer detail. */
export function TripTrackerPanel({
  tripTracker,
  emailOnStepChange,
  emailLog = [],
  busy,
  onToggleEmail,
  onStepChange
}: Props) {
  const done = TRIP_TRACKER_STEPS.filter((s) => (tripTracker?.[s.id] || 'todo') === 'done').length
  const total = TRIP_TRACKER_STEPS.length
  const pct = Math.round((done / total) * 100)

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <label className="flex items-start gap-2 text-sm font-semibold text-gs-dark">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[#136047]"
          checked={emailOnStepChange}
          disabled={busy}
          onChange={(e) => onToggleEmail(e.target.checked)}
        />
        <span>
          Email the customer when I change a step
          <span className="mt-0.5 block font-normal text-slate-500">
            Default on. Sends a short branded stage-update (Golf Sol template) on each change — especially when you tap
            Done.
          </span>
        </span>
      </label>

      <p className="mt-4 font-ge text-sm font-bold text-slate-600">
        {done} of {total} steps done ({pct}%)
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-gs-green transition-all" style={{ width: `${pct}%` }} />
      </div>

      <h2 className="mt-4 font-ge text-lg font-extrabold text-gs-dark">Trip tracker</h2>
      <ul className="mt-3 space-y-3">
        {TRIP_TRACKER_STEPS.map((step, i) => {
          const st = tripTracker?.[step.id] || 'todo'
          return (
            <li key={step.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-semibold text-gs-dark">
                {i + 1}. {step.label}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {TRIP_STEP_STATUSES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={busy}
                    onClick={() => onStepChange(step.id, opt.id)}
                    className={`min-h-10 rounded-lg px-3 py-2 text-xs font-semibold ${
                      st === opt.id
                        ? opt.id === 'done'
                          ? 'bg-emerald-500 text-white'
                          : opt.id === 'doing'
                            ? 'bg-gs-green text-white'
                            : opt.id === 'skip'
                              ? 'bg-slate-500 text-white'
                              : 'bg-gs-dark text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="font-ge text-sm font-extrabold text-gs-dark">Stage emails sent</h3>
        {emailLog.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">None yet</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {emailLog.slice(0, 12).map((e, i) => {
              const label = TRIP_TRACKER_STEPS.find((s) => s.id === e.stepId)?.label || e.stepId
              return (
                <li key={`${e.at}-${i}`} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-400">{formatIrishDateTime(e.at)}</span>
                  <br />
                  {label} → {e.status}
                  {e.to ? ` · ${e.to}` : ''}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
