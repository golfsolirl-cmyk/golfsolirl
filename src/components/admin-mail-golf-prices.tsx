import { emptyGolfCourseOption, formatQuotationEuro, quotationComputed, type MailQuotationPackage } from '../lib/admin-mail-quotation'

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base text-forest-950 placeholder:text-forest-400'
const labelClass = 'text-sm font-bold uppercase tracking-wide text-forest-800'

type Props = {
  readonly value: MailQuotationPackage
  readonly onChange: (next: MailQuotationPackage) => void
  readonly openPayment: boolean
  readonly onOpenPaymentChange: (next: boolean) => void
}

export function AdminMailGolfPrices({ value, onChange, openPayment, onOpenPaymentChange }: Props) {
  const computed = quotationComputed(value)
  const courses = Array.isArray(value.golfCourses) ? value.golfCourses : []
  const setCourse = (id: string, patch: Partial<(typeof courses)[number]>) => {
    onChange({
      ...value,
      golfCourses: courses.map((row) => (row.id === id ? { ...row, ...patch } : row))
    })
  }

  return (
    <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
      <legend className="px-1 font-display text-lg font-semibold text-forest-950">Golf course prices</legend>
      <p className="text-sm leading-relaxed text-forest-700">
        Price each course per golfer. The total is price × number of golfers. When you send this branded email, that total opens as a payment on their portal.
      </p>
      {courses.map((course) => {
        const line = computed.courses.find((row) => row.id === course.id)
        const total = line?.total ?? 0
        return (
          <div className="grid gap-3 rounded-xl border border-forest-100 bg-offwhite/80 p-3 md:grid-cols-12" key={course.id}>
            <label className={`${labelClass} md:col-span-5`}>
              Course
              <input
                className={fieldClass}
                onChange={(e) => setCourse(course.id, { name: e.target.value })}
                placeholder="Finca Cortesin"
                value={course.name}
              />
            </label>
            <label className={`${labelClass} md:col-span-3`}>
              Price per golfer (€)
              <input
                className={fieldClass}
                inputMode="decimal"
                onChange={(e) => setCourse(course.id, { pricePerGolfer: e.target.value })}
                placeholder="180"
                value={course.pricePerGolfer}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Golfers
              <input
                className={fieldClass}
                inputMode="numeric"
                onChange={(e) => setCourse(course.id, { golferCount: e.target.value })}
                placeholder={value.golfers || '8'}
                value={course.golferCount}
              />
            </label>
            <div className="md:col-span-2">
              <p className={labelClass}>Total</p>
              <p className="mt-1.5 rounded-xl border border-forest-200 bg-white px-4 py-3 text-base font-semibold text-forest-950">
                {total > 0 ? formatQuotationEuro(total) : '—'}
              </p>
            </div>
            {courses.length > 1 ? (
              <button
                className="text-left text-sm font-semibold text-red-800 md:col-span-12"
                onClick={() => onChange({ ...value, golfCourses: courses.filter((row) => row.id !== course.id) })}
                type="button"
              >
                Remove course
              </button>
            ) : null}
          </div>
        )
      })}
      {courses.length < 8 ? (
        <button
          className="text-sm font-semibold text-forest-800 underline"
          onClick={() =>
            onChange({
              ...value,
              golfCourses: [...courses, emptyGolfCourseOption({ golferCount: value.golfers })]
            })
          }
          type="button"
        >
          + Add golf course
        </button>
      ) : null}
      <p className="text-sm font-semibold text-forest-950">
        Golf courses total: {computed.golfTotal > 0 ? formatQuotationEuro(computed.golfTotal) : '—'}
        {computed.payableEuros > computed.golfTotal
          ? ` · Portal payment with hotel package: ${formatQuotationEuro(computed.payableEuros)}`
          : computed.payableEuros > 0
            ? ` · Portal payment: ${formatQuotationEuro(computed.payableEuros)}`
            : ''}
      </p>
      <label className="flex items-start gap-3 text-sm text-forest-900">
        <input
          checked={openPayment}
          className="mt-1 h-4 w-4 rounded border-forest-300 text-fairway-700"
          onChange={(e) => onOpenPaymentChange(e.target.checked)}
          type="checkbox"
        />
        <span>Open this price as a payment link on their portal when the branded email is sent.</span>
      </label>
    </fieldset>
  )
}
