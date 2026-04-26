import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'
import type { ContentFormConfig, ContentFormField } from '../content-page-context'
import { formatTravelDateInput } from '../../../lib/format-travel-date'

interface GeQuickEnquiryFormProps {
  readonly title: string
  readonly lead: string
  readonly interestPreset: string
  readonly routeLabel: string
  readonly formConfig: ContentFormConfig
}

const labelClass =
  'mb-1.5 block font-ge text-[0.88rem] font-bold uppercase tracking-[0.14em] text-ge-gray500 sm:text-[0.92rem]'
const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1.02rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25 sm:text-[1.04rem]'

function createInitialFieldValues(fields: readonly ContentFormField[]) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.id] = ''
    return accumulator
  }, {})
}

function getFieldPlaceholder(field: ContentFormField) {
  if (field.placeholder) return field.placeholder
  if (field.type === 'select') return `Select ${field.label.toLowerCase()}`
  return `Enter ${field.label.toLowerCase()}`
}

export function GeQuickEnquiryForm({
  title,
  lead,
  interestPreset,
  routeLabel,
  formConfig
}: GeQuickEnquiryFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const initialFieldValues = useMemo(() => createInitialFieldValues(formConfig.fields), [formConfig.fields])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initialFieldValues)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFieldValues(initialFieldValues)
    setStatus('idle')
    setErrorMessage(null)
  }, [initialFieldValues])

  useEffect(() => {
    if (status === 'success') {
      confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [status])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((current) => ({
      ...current,
      [fieldId]: fieldId === 'travelDates' ? formatTravelDateInput(value) : value
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)

    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    const phone = phoneWhatsApp.trim()

    if (!name || !mail || !phone) {
      setErrorMessage('Please add your name, email, and phone/WhatsApp.')
      setStatus('error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }
    const missingField = formConfig.fields.find((field) => field.required && !fieldValues[field.id]?.trim())
    if (missingField) {
      setErrorMessage(`Please complete ${missingField.label.toLowerCase()}.`)
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const interestLines = [
        interestPreset,
        `Page: ${routeLabel}`,
        ...formConfig.fields.map((field) => {
          const value = fieldValues[field.id]?.trim()
          return value ? `${field.label}: ${value}` : null
        })
      ].filter(Boolean)

      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email: mail,
          phoneWhatsApp: phone,
          interest: interestLines.join('\n'),
          bestTimeToCall: 'Any time'
        })
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data.message ?? 'Could not send your request right now.')
      }

      setStatus('success')
      setFullName('')
      setEmail('')
      setPhoneWhatsApp('')
      setFieldValues(initialFieldValues)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not send your request right now.')
    }
  }

  return (
    <div
      id="ge-enquiry-form"
      className="rounded-[1.75rem] border border-gs-dark/10 bg-white p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6"
    >
      <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.14em] text-ge-orange sm:text-[0.95rem]">
        {formConfig.badge}
      </p>
      <h2 className="mt-3 font-ge text-[1.95rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green sm:text-[2.1rem]">
        {title}
      </h2>
      <p className="mt-3 font-ge text-[1.06rem] leading-8 text-ge-gray500 sm:text-[1.1rem]">{lead}</p>
      <p className="mt-3 text-[1rem] font-medium leading-7 text-gs-dark/72 sm:text-[1.02rem]">
        We reply from Ireland by email, phone, or WhatsApp with a clear next step.
      </p>

      {status === 'success' ? (
        <div ref={confirmationRef} className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
          <p className="font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-gs-green sm:text-[0.96rem]">
            {formConfig.successTitle}
          </p>
          <p className="mt-2 font-ge text-[1.04rem] leading-8 text-gs-dark sm:text-[1.08rem]">
            {formConfig.successBody}
          </p>
          <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-4">
            Email us directly
          </GeButton>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className={labelClass}>Full name</span>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Phone / WhatsApp</span>
            <input
              className={inputClass}
              value={phoneWhatsApp}
              onChange={(e) => setPhoneWhatsApp(e.target.value)}
              autoComplete="tel"
              type="tel"
              required
              placeholder={contactInfo.phoneDisplay}
            />
          </label>

          {formConfig.fields.map((field) => {
            const value = fieldValues[field.id] ?? ''

            if (field.type === 'textarea') {
              return (
                <label key={field.id} className="block">
                  <span className={labelClass}>{field.label}</span>
                  <textarea
                    className="w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1.02rem] leading-8 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25 sm:text-[1.04rem]"
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={getFieldPlaceholder(field)}
                    rows={field.rows ?? 5}
                  />
                </label>
              )
            }

            if (field.type === 'select') {
              return (
                <label key={field.id} className="block">
                  <span className={labelClass}>{field.label}</span>
                  <select
                    className={inputClass}
                    value={value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    required={field.required}
                  >
                    <option value="">{getFieldPlaceholder(field)}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )
            }

            return (
              <label key={field.id} className="block">
                <span className={labelClass}>{field.label}</span>
                <input
                  className={inputClass}
                  value={value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  autoComplete={field.autoComplete}
                  required={field.required}
                  placeholder={getFieldPlaceholder(field)}
                />
              </label>
            )
          })}

          {status === 'error' && errorMessage ? (
            <p className="rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2.5 font-ge text-[1.02rem] leading-7 text-gs-dark sm:text-[1.04rem]">
              {errorMessage}
            </p>
          ) : null}

          <GeButton className="w-full" type="submit" variant="gs-gold" size="lg" disabled={status === 'submitting'}>
            <Send className="h-4 w-4" aria-hidden />
            {status === 'submitting' ? 'Sending...' : formConfig.submitLabel}
          </GeButton>
        </form>
      )}
    </div>
  )
}
