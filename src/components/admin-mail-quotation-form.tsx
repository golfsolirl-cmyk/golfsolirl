import {
  MAIL_QUOTATION_FIELD_GROUPS,
  type MailQuotationField,
  type MailQuotationPackage
} from '../lib/admin-mail-quotation'
import { cx } from '../lib/utils'

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base text-forest-950 placeholder:text-forest-400'
const multilineClass = `${fieldClass} min-h-[88px] leading-relaxed`

type Props = {
  readonly value: MailQuotationPackage
  readonly onChange: (next: MailQuotationPackage) => void
}

export function AdminMailQuotationForm({ value, onChange }: Props) {
  const setField = (key: keyof MailQuotationPackage, text: string) => {
    onChange({ ...value, [key]: text })
  }

  return (
    <div className="mt-5 space-y-5 rounded-[1.5rem] border border-forest-200 bg-offwhite/70 p-4 sm:p-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-forest-800">Quotation fill-in</p>
        <p className="mt-1 text-base text-forest-700">
          Labelled boxes for this package letter. They fill the email sections and the quotation PDF. Leave a box empty
          to omit that row.
        </p>
      </div>
      {MAIL_QUOTATION_FIELD_GROUPS.map((group) => (
        <fieldset className="space-y-3 rounded-2xl border border-forest-100 bg-white p-4" key={group.id}>
          <legend className="px-1 font-display text-lg font-semibold text-forest-950">{group.title}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {group.fields.map((field: MailQuotationField) => {
              const wide = Boolean(field.multiline)
              const control = field.multiline ? (
                <textarea
                  className={multilineClass}
                  id={`mail-quote-${field.key}`}
                  onChange={(event) => setField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  value={value[field.key]}
                />
              ) : (
                <input
                  className={fieldClass}
                  id={`mail-quote-${field.key}`}
                  onChange={(event) => setField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  type="text"
                  value={value[field.key]}
                />
              )
              return (
                <label
                  className={cx('text-sm font-bold uppercase tracking-wide text-forest-800', wide && 'md:col-span-2')}
                  htmlFor={`mail-quote-${field.key}`}
                  key={field.key}
                >
                  {field.label}
                  {control}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
