import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Send, Star } from 'lucide-react'
import { BookedDatesAvailabilityNotice } from '../../../components/booked-dates-availability-notice'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'
import type { ContentFormConfig, ContentFormField } from '../content-page-context'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  QUOTE_INTENTS,
  TRIP_ARRIVAL_MODE,
  WEBSITE_ENQUIRY_FORM
} from '../../../lib/enquiry-form-registry'
import { assertDatesNotBooked, loadBookedServiceDayIsoSet } from '../../../lib/booked-service-days'
import { formatTravelDateInput } from '../../../lib/format-travel-date'
import { getLocalDateIso } from '../../../lib/local-date-iso'
import { plannedTravelDatesErrorMessage, travelEndMinIso, travelStartMinIso } from '../../../lib/travel-date-bounds'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../../../lib/post-enquiry-client'
import { postWebsiteTestimonial } from '../../../lib/post-website-testimonial'

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
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [bookedDays, setBookedDays] = useState<Set<string>>(() => new Set())
  const [testimonialRating, setTestimonialRating] = useState(5)
  const confirmationRef = useRef<HTMLDivElement>(null)
  const isTestimonialForm = formConfig.submissionKind === 'testimonial'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const booked = await loadBookedServiceDayIsoSet(getSupabaseBrowserClient())
      if (!cancelled) {
        setBookedDays(booked)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setFieldValues(initialFieldValues)
    setStatus('idle')
    setErrorMessage(null)
    setErrorCode(null)
  }, [initialFieldValues])

  useEffect(() => {
    const mode = fieldValues.tripArrivalMode?.trim()
    if (mode !== TRIP_ARRIVAL_MODE.alreadyAtAgp) {
      return
    }
    const hasTravelDates = formConfig.fields.some((f) => f.id === 'travelDateFrom' || f.id === 'travelDateTo')
    if (!hasTravelDates) {
      return
    }
    const t = getLocalDateIso()
    setFieldValues((prev) => {
      if (prev.tripArrivalMode?.trim() !== TRIP_ARRIVAL_MODE.alreadyAtAgp) {
        return prev
      }
      if (prev.travelDateFrom === t && prev.travelDateTo === t) {
        return prev
      }
      return { ...prev, travelDateFrom: t, travelDateTo: t }
    })
  }, [fieldValues.tripArrivalMode, formConfig.fields])

  useEffect(() => {
    const mode = fieldValues.tripArrivalMode?.trim()
    if (mode !== TRIP_ARRIVAL_MODE.planned) {
      return
    }
    const hasTravelPair =
      formConfig.fields.some((f) => f.id === 'travelDateFrom') && formConfig.fields.some((f) => f.id === 'travelDateTo')
    if (!hasTravelPair) {
      return
    }
    const t = travelStartMinIso()
    setFieldValues((prev) => {
      if (prev.tripArrivalMode?.trim() !== TRIP_ARRIVAL_MODE.planned) {
        return prev
      }
      const dfs = prev.travelDateFrom?.trim().slice(0, 10) ?? ''
      const dts = prev.travelDateTo?.trim().slice(0, 10) ?? ''
      let nf = prev.travelDateFrom ?? ''
      let nt = prev.travelDateTo ?? ''
      let changed = false
      if (dfs.length === 10 && dfs < t) {
        nf = t
        changed = true
      }
      const dfs2 = nf.trim().slice(0, 10)
      const dts2 = nt.trim().slice(0, 10)
      if (dfs2.length === 10 && dts2.length === 10) {
        const em = travelEndMinIso(dfs2)
        if (dts2 < em) {
          nt = em
          changed = true
        }
      }
      if (!changed) {
        return prev
      }
      return { ...prev, travelDateFrom: nf, travelDateTo: nt }
    })
  }, [fieldValues.tripArrivalMode, fieldValues.travelDateFrom, fieldValues.travelDateTo, formConfig.fields])

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

    const tripModeField = formConfig.fields.find((f) => f.id === 'tripArrivalMode')
    if (tripModeField) {
      const mode = fieldValues.tripArrivalMode?.trim() ?? ''
      if (tripModeField.required && !mode) {
        setErrorMessage('Please select trip timing.')
        setStatus('error')
        return
      }
      if (mode === TRIP_ARRIVAL_MODE.planned) {
        const df = fieldValues.travelDateFrom?.trim() ?? ''
        const dt = fieldValues.travelDateTo?.trim() ?? ''
        if (!df || !dt) {
          setErrorMessage('Add travel start and end dates, or choose “Already at Málaga (AGP)”.')
          setStatus('error')
          return
        }
        const plannedErr = plannedTravelDatesErrorMessage(df, dt)
        if (plannedErr) {
          setErrorMessage(plannedErr)
          setStatus('error')
          return
        }
      }
      if (mode === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
        const hasTravelPair =
          formConfig.fields.some((f) => f.id === 'travelDateFrom') && formConfig.fields.some((f) => f.id === 'travelDateTo')
        if (hasTravelPair) {
          const today = getLocalDateIso()
          const df = fieldValues.travelDateFrom?.trim() ?? ''
          const dt = fieldValues.travelDateTo?.trim() ?? ''
          if (df !== today || dt !== today) {
            setErrorMessage('When you are already here, set both travel dates to today’s date only.')
            setStatus('error')
            return
          }
        }
      }
      if (!tripModeField.required && mode === TRIP_ARRIVAL_MODE.planned) {
        const df = fieldValues.travelDateFrom?.trim() ?? ''
        const dt = fieldValues.travelDateTo?.trim() ?? ''
        if (!df || !dt) {
          setErrorMessage('Add both travel dates, or set trip timing back to “—”.')
          setStatus('error')
          return
        }
        const plannedErrOptional = plannedTravelDatesErrorMessage(df, dt)
        if (plannedErrOptional) {
          setErrorMessage(plannedErrOptional)
          setStatus('error')
          return
        }
      }
    }

    const dfCheck = fieldValues.travelDateFrom?.trim().slice(0, 10) ?? ''
    const dtCheck = fieldValues.travelDateTo?.trim().slice(0, 10) ?? ''
    const bookedMsg = assertDatesNotBooked(bookedDays, [dfCheck, dtCheck].filter((d) => d.length === 10))
    if (bookedMsg) {
      setErrorMessage(bookedMsg)
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorCode(null)
    try {
      if (isTestimonialForm) {
        const quoteText = fieldValues.notes?.trim() ?? ''
        if (quoteText.length < 20) {
          setErrorMessage('Please write at least a few sentences for your review (20 characters minimum).')
          setStatus('error')
          return
        }
        const result = await postWebsiteTestimonial({
          fullName: name,
          email: mail,
          phoneWhatsApp: phone,
          tripType: fieldValues.tripType?.trim() ?? '',
          travelMonth: fieldValues.travelMonth?.trim(),
          quoteText,
          rating: testimonialRating,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : routeLabel
        })
        if (!result.ok) {
          setStatus('error')
          setErrorMessage(result.message)
          return
        }
        setStatus('success')
        setErrorCode(null)
        setFullName('')
        setEmail('')
        setPhoneWhatsApp('')
        setTestimonialRating(5)
        setFieldValues(initialFieldValues)
        return
      }

      const interestLines = [
        interestPreset,
        `Page: ${routeLabel}`,
        ...formConfig.fields.map((field) => {
          const value = fieldValues[field.id]?.trim()
          return value ? `${field.label}: ${value}` : null
        })
      ].filter(Boolean)

      const formFields: Record<string, string> = {
        Page: routeLabel,
        Topic: interestPreset
      }
      for (const field of formConfig.fields) {
        const value = fieldValues[field.id]?.trim()
        if (value) {
          formFields[field.label] = value
        }
      }

      const tripTypeVal = fieldValues.tripType?.trim() ?? ''
      if (tripTypeVal.includes('Airport transfers only')) {
        formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent] = QUOTE_INTENTS.airportOnly
      }
      const gs = fieldValues.groupSize?.trim() ?? ''
      const paxMatch = gs.match(/^(\d+)/)
      if (paxMatch) {
        formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] = paxMatch[1] ?? ''
      }

      if (tripModeField) {
        const mode = fieldValues.tripArrivalMode?.trim() ?? ''
        const df = fieldValues.travelDateFrom?.trim() ?? ''
        const dt = fieldValues.travelDateTo?.trim() ?? ''
        formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp] =
          mode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? 'yes' : 'no'
        if (df) {
          formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] = df
        }
        if (dt) {
          formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] = dt
        }
      }

      const result = await postWebsiteEnquiry({
        fullName: name,
        email: mail,
        phoneWhatsApp: phone,
        interest: interestLines.join('\n'),
        bestTimeToCall: 'Any time',
        formPayload: {
          form: WEBSITE_ENQUIRY_FORM.contentQuickEnquiry,
          fields: formFields
        }
      })

      if (!result.ok) {
        setStatus('error')
        setErrorMessage(result.message)
        setErrorCode(result.code ?? null)
        return
      }

      setStatus('success')
      setErrorCode(null)
      setFullName('')
      setEmail('')
      setPhoneWhatsApp('')
      setFieldValues(initialFieldValues)
    } catch (error) {
      setStatus('error')
      setErrorCode(null)
      setErrorMessage(error instanceof Error ? error.message : 'Could not send your request right now.')
    }
  }

  const tripTimingSelectValue = fieldValues.tripArrivalMode?.trim() ?? ''
  const lockTravelDatesToToday = tripTimingSelectValue === TRIP_ARRIVAL_MODE.alreadyAtAgp
  const todayIsoQuickForm = getLocalDateIso()
  const plannedTravelDatePick = tripTimingSelectValue === TRIP_ARRIVAL_MODE.planned && !lockTravelDatesToToday
  const plannedStartMinQuick = plannedTravelDatePick ? travelStartMinIso() : undefined
  const plannedEndMinQuick = plannedTravelDatePick ? travelEndMinIso(fieldValues.travelDateFrom ?? '') : undefined

  return (
    <div
      id="ge-enquiry-form"
      className="rounded-[1.75rem] border border-gs-dark/10 bg-white p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6"
    >
      <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.14em] text-brand-700 sm:text-[0.95rem]">
        {formConfig.badge}
      </p>
      <h2 className="mt-3 font-ge text-[1.95rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green sm:text-[2.1rem]">
        {title}
      </h2>
      <p className="mt-3 font-ge text-[1.06rem] leading-8 text-ge-gray500 sm:text-[1.1rem]">{lead}</p>
      <p className="mt-3 text-[1rem] font-medium leading-7 text-gs-dark/72 sm:text-[1.02rem]">
        {isTestimonialForm
          ? 'Write it like a Tripadvisor review — we approve it before it appears on our homepage.'
          : 'We reply from Ireland by email, phone, or WhatsApp with a clear next step.'}
      </p>

      {status === 'success' ? (
        <div ref={confirmationRef} className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
          <p className="font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-gs-green sm:text-[0.96rem]">
            {formConfig.successTitle}
          </p>
          <p className="mt-2 font-ge text-[1.04rem] leading-8 text-gs-dark sm:text-[1.08rem]">
            {formConfig.successBody}
          </p>
          {isTestimonialForm ? (
            <GeButton href="/" variant="outline-gs-green" size="sm" className="mt-4">
              Back to homepage
            </GeButton>
          ) : (
            <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-4">
              Email us directly
            </GeButton>
          )}
        </div>
      ) : (
        <>
          <BookedDatesAvailabilityNotice
            bookedDays={bookedDays}
            className="mt-6"
            watchDates={[fieldValues.travelDateFrom, fieldValues.travelDateTo]}
          />
          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
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
              placeholder={contactInfo.phoneFieldPlaceholder}
            />
          </label>

          {isTestimonialForm ? (
            <div className="block">
              <span className={labelClass}>Overall rating</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Overall rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                    aria-pressed={testimonialRating === value}
                    onClick={() => setTestimonialRating(value)}
                    className={[
                      'inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border px-3 font-ge text-sm font-bold transition',
                      testimonialRating === value
                        ? 'border-brand-700 bg-brand-700/10 text-gs-dark'
                        : 'border-ge-gray200 bg-white text-ge-gray500 hover:border-brand-700/40'
                    ].join(' ')}
                  >
                    <Star
                      className={
                        value <= testimonialRating
                          ? 'h-4 w-4 fill-brand-600 text-brand-700'
                          : 'h-4 w-4 text-ge-gray300'
                      }
                      strokeWidth={0}
                      aria-hidden
                    />
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {formConfig.fields.map((field) => {
            const value = fieldValues[field.id] ?? ''

            if (field.type === 'date') {
              const agpTodayOnly =
                lockTravelDatesToToday && (field.id === 'travelDateFrom' || field.id === 'travelDateTo')
              const travelFrom = field.id === 'travelDateFrom'
              const travelTo = field.id === 'travelDateTo'
              const dateMin = agpTodayOnly
                ? todayIsoQuickForm
                : plannedTravelDatePick && travelFrom
                  ? plannedStartMinQuick
                  : plannedTravelDatePick && travelTo
                    ? plannedEndMinQuick
                    : undefined
              const dateMax = agpTodayOnly ? todayIsoQuickForm : undefined
              return (
                <label key={field.id} className="block">
                  <span className={labelClass}>{field.label}</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={value}
                    min={dateMin}
                    max={dateMax}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    required={field.required}
                  />
                </label>
              )
            }

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
            <div className="rounded-lg border border-brand-700/50 bg-orange-50 px-3 py-2.5 font-ge text-[1.02rem] leading-7 text-gs-dark sm:text-[1.04rem]">
              <p>{errorMessage}</p>
              {errorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                <p className="mt-3 text-[0.98rem] font-semibold text-gs-green">
                  <a className="underline decoration-gs-green/50 underline-offset-2" href="/dashboard/login">
                    Sign in to your trip desk
                  </a>{' '}
                  (same email you used before) — or contact us if you need help.
                </p>
              ) : null}
            </div>
          ) : null}

          <GeButton className="w-full" type="submit" variant="gs-green" size="lg" disabled={status === 'submitting'}>
            <Send className="h-4 w-4" aria-hidden />
            {status === 'submitting' ? 'Sending...' : formConfig.submitLabel}
          </GeButton>
        </form>
        </>
      )}
    </div>
  )
}
