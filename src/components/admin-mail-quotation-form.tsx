import {
  MAIL_QUOTATION_INCLUDE_FIELDS,
  MAIL_QUOTATION_NOTE_FIELDS,
  emptyHotelOption,
  formatQuotationEuro,
  quotationComputed,
  type MailQuotationField,
  type MailQuotationHotelOption,
  type MailQuotationPackage
} from '../lib/admin-mail-quotation'
import { cx } from '../lib/utils'

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base text-forest-950 placeholder:text-forest-400'
const multilineClass = `${fieldClass} min-h-[88px] leading-relaxed`
const labelClass = 'text-sm font-bold uppercase tracking-wide text-forest-800'

type Props = {
  readonly value: MailQuotationPackage
  readonly onChange: (next: MailQuotationPackage) => void
}

function TextField({
  field,
  value,
  onChange,
  wide
}: {
  readonly field: MailQuotationField
  readonly value: string
  readonly onChange: (text: string) => void
  readonly wide?: boolean
}) {
  const control = field.multiline ? (
    <textarea
      className={multilineClass}
      id={`mail-quote-${field.key}`}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      value={value}
    />
  ) : (
    <input
      className={fieldClass}
      id={`mail-quote-${field.key}`}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      type="text"
      value={value}
    />
  )
  return (
    <label className={cx(labelClass, wide && 'md:col-span-2')} htmlFor={`mail-quote-${field.key}`}>
      {field.label}
      {control}
    </label>
  )
}

export function AdminMailQuotationForm({ value, onChange }: Props) {
  const computed = quotationComputed(value)
  const setField = (key: keyof MailQuotationPackage, text: string) => {
    if (key === 'hotelOptions') return
    onChange({ ...value, [key]: text })
  }
  const setOption = (id: string, patch: Partial<MailQuotationHotelOption>) => {
    onChange({
      ...value,
      hotelOptions: value.hotelOptions.map((row) => (row.id === id ? { ...row, ...patch } : row))
    })
  }

  return (
    <div className="mt-5 space-y-5 rounded-[1.5rem] border border-forest-200 bg-offwhite/70 p-4 sm:p-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest-800">Golf holiday quotation</p>
        <p className="mt-1 text-base text-forest-700">
          Same labelled sections as the Golf Sol Ireland quotation letter. Empty boxes are left off the PDF and email.
          Hotel totals update as you type.
        </p>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
        <legend className="px-1 font-display text-lg font-semibold text-forest-950">Your package</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={labelClass}>
            Destination
            <input className={fieldClass} onChange={(e) => setField('destination', e.target.value)} placeholder="Marbella" value={value.destination} />
          </label>
          <label className={labelClass}>
            Travel dates
            <input className={fieldClass} onChange={(e) => setField('travelDates', e.target.value)} placeholder="12–19 April" value={value.travelDates} />
          </label>
          <label className={labelClass}>
            Duration
            <input className={fieldClass} onChange={(e) => setField('duration', e.target.value)} placeholder="7 nights" value={value.duration} />
          </label>
          <label className={labelClass}>
            Number of golfers
            <input
              className={fieldClass}
              onChange={(e) => {
                const golfers = e.target.value
                onChange({
                  ...value,
                  golfers,
                  hotelOptions: value.hotelOptions.map((row) =>
                    row.golferCount.trim() && row.golferCount !== value.golfers ? row : { ...row, golferCount: golfers }
                  )
                })
              }}
              placeholder="8"
              value={value.golfers}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
        <legend className="px-1 font-display text-lg font-semibold text-forest-950">Package price</legend>
        <div className="space-y-3">
          {value.hotelOptions.map((opt, index) => {
            const total = computed.options[index]?.total || 0
            return (
              <div className="grid gap-3 rounded-xl border border-forest-100 bg-offwhite/60 p-3 md:grid-cols-12" key={opt.id}>
                <label className={cx(labelClass, 'md:col-span-4')}>
                  Option {index + 1} / hotel
                  <input className={fieldClass} onChange={(e) => setOption(opt.id, { name: e.target.value })} placeholder="5-star hotel, Puerto Banús" value={opt.name} />
                </label>
                <label className={cx(labelClass, 'md:col-span-3')}>
                  Price per person (€)
                  <input className={fieldClass} inputMode="decimal" onChange={(e) => setOption(opt.id, { pricePerPerson: e.target.value })} placeholder="1550" value={opt.pricePerPerson} />
                </label>
                <label className={cx(labelClass, 'md:col-span-2')}>
                  Golfers
                  <input className={fieldClass} inputMode="numeric" onChange={(e) => setOption(opt.id, { golferCount: e.target.value })} placeholder={value.golfers || '8'} value={opt.golferCount} />
                </label>
                <div className="md:col-span-3">
                  <p className={labelClass}>Total</p>
                  <p className="mt-1.5 rounded-xl border border-forest-200 bg-white px-4 py-3 text-base font-semibold text-forest-950">
                    {total > 0 ? formatQuotationEuro(total) : '—'}
                  </p>
                </div>
                {value.hotelOptions.length > 1 ? (
                  <button
                    className="text-left text-sm font-semibold text-red-800 md:col-span-12"
                    onClick={() => onChange({ ...value, hotelOptions: value.hotelOptions.filter((row) => row.id !== opt.id) })}
                    type="button"
                  >
                    Remove option
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
        {value.hotelOptions.length < 6 ? (
          <button
            className="text-sm font-semibold text-forest-800 underline"
            onClick={() =>
              onChange({
                ...value,
                hotelOptions: [...value.hotelOptions, emptyHotelOption({ golferCount: value.golfers })]
              })
            }
            type="button"
          >
            + Add hotel option
          </button>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
        <legend className="px-1 font-display text-lg font-semibold text-forest-950">Your package includes</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {MAIL_QUOTATION_INCLUDE_FIELDS.map((field) => (
            <TextField
              field={field}
              key={field.key}
              onChange={(text) => setField(field.key, text)}
              value={String(value[field.key] ?? '')}
              wide={Boolean(field.multiline)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
        <legend className="px-1 font-display text-lg font-semibold text-forest-950">Transfer and payment</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={labelClass}>
            Transfer total (€)
            <input className={fieldClass} inputMode="decimal" onChange={(e) => setField('transferTotal', e.target.value)} placeholder="1200" value={value.transferTotal} />
          </label>
          <label className={labelClass}>
            Transfer per person
            <input className={fieldClass} readOnly value={computed.transferPerPerson ? formatQuotationEuro(computed.transferPerPerson) : '—'} />
          </label>
          <label className={labelClass}>
            Deposit %
            <input className={fieldClass} inputMode="decimal" onChange={(e) => setField('depositPercent', e.target.value)} placeholder="20" value={value.depositPercent} />
          </label>
          <label className={labelClass}>
            Deposit amount
            <input className={fieldClass} readOnly value={computed.depositAmount ? formatQuotationEuro(computed.depositAmount) : '—'} />
          </label>
          <label className={labelClass}>
            Final balance
            <input className={fieldClass} readOnly value={computed.balanceDue ? formatQuotationEuro(computed.balanceDue) : '—'} />
          </label>
          <label className={labelClass}>
            Balance due
            <input className={fieldClass} onChange={(e) => setField('balanceDueDate', e.target.value)} placeholder="21 days before travel" value={value.balanceDueDate} />
          </label>
          <label className={cx(labelClass, 'md:col-span-2')}>
            Quote expiry / hold
            <input className={fieldClass} onChange={(e) => setField('quoteExpiry', e.target.value)} placeholder="Hold rooms until 4 April" value={value.quoteExpiry} />
          </label>
        </div>
        <p className="text-sm text-forest-600">
          Deposit and balance are calculated from the first hotel option with a total. Transfer per person uses the golfer count.
        </p>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4">
        <legend className="px-1 font-display text-lg font-semibold text-forest-950">Notes and sign-off</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {MAIL_QUOTATION_NOTE_FIELDS.map((field) => (
            <TextField
              field={field}
              key={field.key}
              onChange={(text) => setField(field.key, text)}
              value={String(value[field.key] ?? '')}
              wide
            />
          ))}
          <label className={labelClass}>
            Consultant name
            <input className={fieldClass} onChange={(e) => setField('signOffName', e.target.value)} value={value.signOffName} />
          </label>
          <label className={labelClass}>
            Direct phone
            <input className={fieldClass} onChange={(e) => setField('signOffPhone', e.target.value)} value={value.signOffPhone} />
          </label>
          <label className={cx(labelClass, 'md:col-span-2')}>
            Email
            <input className={fieldClass} onChange={(e) => setField('signOffEmail', e.target.value)} value={value.signOffEmail} />
          </label>
        </div>
      </fieldset>

      <div className="rounded-2xl border border-forest-200 bg-white p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-forest-800">Live letter preview</p>
        <p className="mt-3 font-display text-xl font-semibold text-forest-950">Your golf holiday quotation</p>
        <dl className="mt-3 space-y-1 text-base text-forest-900">
          {value.destination.trim() ? (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 font-semibold text-forest-700">Destination</dt>
              <dd>{value.destination}</dd>
            </div>
          ) : null}
          {value.travelDates.trim() ? (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 font-semibold text-forest-700">Travel dates</dt>
              <dd>{value.travelDates}</dd>
            </div>
          ) : null}
          {computed.options
            .filter((opt) => opt.total > 0)
            .map((opt) => (
              <div className="flex gap-3" key={opt.id}>
                <dt className="w-40 shrink-0 font-semibold text-forest-700">{opt.name || 'Hotel'}</dt>
                <dd>{opt.summary}</dd>
              </div>
            ))}
          {computed.depositAmount > 0 ? (
            <div className="flex gap-3">
              <dt className="w-40 shrink-0 font-semibold text-forest-700">Deposit</dt>
              <dd>
                {computed.depositPercent}% · {formatQuotationEuro(computed.depositAmount)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  )
}
