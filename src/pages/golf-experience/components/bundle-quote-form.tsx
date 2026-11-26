import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  BUNDLE_TIERS,
  type BundleTierId,
  type ResolvedBundleQuote
} from '../../../data/golf-holiday-bundles'
import { BookedDatesAvailabilityNotice } from '../../../components/booked-dates-availability-notice'
import { EnquiryContactVerifyFields } from '../../../components/enquiry-contact-verify-fields'
import { assertDatesNotBooked, loadBookedServiceDayIsoSet } from '../../../lib/booked-service-days'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  WEBSITE_ENQUIRY_FORM
} from '../../../lib/enquiry-form-registry'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../../../lib/post-enquiry-client'
import { validateMobilePhoneInput } from '../../../lib/phone-mobile'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../../../lib/terms-acceptance'
import { travelEndMinIso, travelStartMinIso } from '../../../lib/travel-date-bounds'
import { golferGroupSizeSelectOptions } from '../data/form-people-options'
import { GeButton } from './ge-button'
import { GeTermsAcceptanceField } from './ge-terms-acceptance-field'

const labelClass =
  'mb-1.5 block font-ge text-[0.82rem] font-bold uppercase tracking-[0.12em] text-forest-800'
const inputClass =
  'min-h-[52px] h-13 w-full rounded-xl border border-ge-gray200 bg-white px-4 font-ge text-[1.06rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

type BundleQuoteFormProps = {
  readonly bundle: ResolvedBundleQuote | null
  readonly initialTier?: BundleTierId
  readonly presetCourses?: readonly string[]
  readonly presetHotel?: string | null
  readonly presetHotels?: readonly string[]
  readonly presetAddTransfers?: boolean
}

export function BundleQuoteForm({
  bundle,
  initialTier = 'classic',
  presetCourses = [],
  presetHotel = null,
  presetHotels = [],
  presetAddTransfers = false
}: BundleQuoteFormProps) {
  const [tier, setTier] = useState<BundleTierId>(initialTier)
  const [travelDateFrom, setTravelDateFrom] = useState('')
  const [travelDateTo, setTravelDateTo] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const tripNotesSeed = useMemo(() => {
    const bits: string[] = []
    if (presetCourses.length) bits.push(`Courses: ${presetCourses.join(', ')}`)
    const hotels = [...presetHotels, ...(presetHotel ? [presetHotel] : [])].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    )
    if (hotels.length) bits.push(`Hotel: ${hotels.join(', ')}`)
    return bits.join('\n')
  }, [presetCourses, presetHotel, presetHotels])
  const [notes, setNotes] = useState(tripNotesSeed)
  const [addTransfers, setAddTransfers] = useState(presetAddTransfers)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [contactVerifyToken, setContactVerifyToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [bookedDays, setBookedDays] = useState<Set<string>>(() => new Set())
  const confirmationRef = useRef<HTMLDivElement>(null)

  const tierMeta = useMemo(() => BUNDLE_TIERS.find((t) => t.id === tier) ?? BUNDLE_TIERS[1], [tier])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const booked = await loadBookedServiceDayIsoSet(getSupabaseBrowserClient())
      if (!cancelled) setBookedDays(booked)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setTier(initialTier)
  }, [initialTier])

  useEffect(() => {
    setAddTransfers(presetAddTransfers)
  }, [presetAddTransfers])

  useEffect(() => {
    if (tripNotesSeed) setNotes((prev) => (prev.trim() ? prev : tripNotesSeed))
  }, [tripNotesSeed])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setErrorCode(null)

    const name = fullName.trim()
    const mail = email.trim()
    const phone = phoneWhatsApp.trim()
    if (!name || !mail || !phone) {
      setErrorMessage('Name, email and mobile are required.')
      setStatus('error')
      return
    }
    const phoneCheck = validateMobilePhoneInput(phone)
    if (!phoneCheck.ok) {
      setErrorMessage(phoneCheck.message)
      setStatus('error')
      return
    }
    if (!groupSize) {
      setErrorMessage('Select how many golfers.')
      setStatus('error')
      return
    }
    if (!termsAccepted) {
      setErrorMessage(TERMS_ACCEPTANCE_ERROR)
      setStatus('error')
      return
    }

    const bookedMsg = assertDatesNotBooked(
      bookedDays,
      [travelDateFrom, travelDateTo].filter((d) => d.length === 10)
    )
    if (bookedMsg) {
      setErrorMessage(bookedMsg)
      setStatus('error')
      return
    }

    setStatus('submitting')
    const bundleLabel = bundle
      ? `${bundle.packageName} · ${bundle.nights} nights · ${bundle.rounds} rounds · ${tierMeta.label}`
      : 'Custom golf holiday quote'

    const formFields: Record<string, string> = {
      Page: '/quote',
      Topic: bundleLabel,
      'Price level': tierMeta.label,
      Golfers: groupSize
    }
    if (bundle) {
      formFields.Bundle = bundle.packageName
      formFields.Nights = String(bundle.nights)
      formFields.Rounds = String(bundle.rounds)
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleSlug] = bundle.slug
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleName] = bundle.packageName
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleNights] = String(bundle.nights)
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleRounds] = String(bundle.rounds)
    }
    formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleTier] = tier
    if (travelDateFrom) {
      formFields['Start date'] = travelDateFrom
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] = travelDateFrom
    }
    if (travelDateTo) {
      formFields['End date'] = travelDateTo
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] = travelDateTo
    }
    if (notes.trim()) formFields.Notes = notes.trim()
    if (presetCourses.length) formFields.Courses = presetCourses.join(', ')
    const hotels = [...presetHotels, ...(presetHotel ? [presetHotel] : [])].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    )
    if (hotels.length) formFields.Hotel = hotels.join(', ')
    formFields['Add airport & hotel transfers'] = addTransfers ? 'Yes' : 'No'
    formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.addTransfers] = addTransfers ? 'yes' : 'no'
    const paxMatch = groupSize.match(/^(\d+)/)
    if (paxMatch) formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] = paxMatch[1] ?? ''

    const result = await postWebsiteEnquiry({
      fullName: name,
      email: mail,
      phoneWhatsApp: phone,
      interest: [`Bundle quote: ${bundleLabel}`, notes.trim() || null].filter(Boolean).join('\n'),
      bestTimeToCall: 'Any time',
      ...(contactVerifyToken ? { contactVerifyToken } : {}),
      formPayload: {
        form: WEBSITE_ENQUIRY_FORM.bundleQuote,
        fields: { ...formFields, ...termsAcceptanceFormFields() }
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
    setNotes('')
    setGroupSize('')
    setTravelDateFrom('')
    setTravelDateTo('')
    setAddTransfers(false)
    setTermsAccepted(false)
    setContactVerifyToken(null)
  }

  const startMin = travelStartMinIso()
  const endMin = travelEndMinIso(travelDateFrom)

  return (
    <div
      id="quote-form"
      className="rounded-[1.75rem] border border-gs-dark/10 bg-white p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6"
    >
      <p className="font-ge text-[0.85rem] font-bold uppercase tracking-[0.14em] text-brand-700">Get a quote</p>
      <h2 className="mt-2.5 font-ge text-[1.7rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green sm:text-[1.9rem]">
        {bundle ? bundle.packageName : 'Your golf holiday'}
      </h2>
      <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray500">
        {bundle
          ? 'Bundle details are locked below. Choose hotel level, dates and golfers — we reply from Ireland.'
          : 'Tell us dates and golfers. Prefer a named bundle? Pick one from Our golf holiday bundles.'}
      </p>

      {bundle ? (
        <div className="mt-5 rounded-2xl border border-chrome-200 bg-cream/80 px-4 py-3.5">
          <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ge-gray500">
            Selected bundle
          </p>
          <p className="mt-1 font-ge text-[1.05rem] font-extrabold text-gs-dark">{bundle.packageName}</p>
          <p className="mt-0.5 font-ge text-sm text-ge-gray600">
            {bundle.nights} nights · {bundle.rounds} rounds · {bundle.durationTitle}
          </p>
        </div>
      ) : null}

      {status === 'success' ? (
        <div ref={confirmationRef} className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
          <p className="font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-gs-green">Quote request received</p>
          <p className="mt-2 font-ge text-[1.04rem] leading-7 text-gs-dark">
            Thanks — we will reply from Ireland with clear options for this bundle.
          </p>
          <GeButton href="/bundles" variant="outline-gs-green" size="sm" className="mt-4">
            Back to bundles
          </GeButton>
        </div>
      ) : (
        <>
          <BookedDatesAvailabilityNotice
            bookedDays={bookedDays}
            className="mt-5"
            watchDates={[travelDateFrom, travelDateTo]}
          />
          <form className="mt-4 flex max-w-xl flex-col gap-4" noValidate onSubmit={(e) => void handleSubmit(e)}>
            <fieldset>
              <legend className={labelClass}>Price level</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {BUNDLE_TIERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={
                      t.id === tier
                        ? 'rounded-full bg-gs-dark px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-white'
                        : 'rounded-full border border-chrome-300 bg-white px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-gs-dark'
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 font-ge text-sm text-ge-gray500">{tierMeta.blurb}</p>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Start date</span>
                <input
                  className={inputClass}
                  type="date"
                  min={startMin}
                  value={travelDateFrom}
                  onChange={(e) => setTravelDateFrom(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelClass}>End date</span>
                <input
                  className={inputClass}
                  type="date"
                  min={endMin || startMin}
                  value={travelDateTo}
                  onChange={(e) => setTravelDateTo(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Golfers</span>
              <select
                className={inputClass}
                required
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
              >
                <option value="">Select golfers</option>
                {golferGroupSizeSelectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                className={inputClass}
                autoComplete="name"
                required
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setContactVerifyToken(null)
                }}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Mobile / WhatsApp</span>
              <input
                className={inputClass}
                type="tel"
                autoComplete="tel"
                required
                placeholder="+353…"
                value={phoneWhatsApp}
                onChange={(e) => {
                  setPhoneWhatsApp(e.target.value)
                  setContactVerifyToken(null)
                }}
              />
            </label>

            <EnquiryContactVerifyFields
              contactVerifyToken={contactVerifyToken}
              email={email}
              labelClassName={labelClass}
              inputClassName={inputClass}
              onTokenCleared={() => setContactVerifyToken(null)}
              onVerified={(token) => setContactVerifyToken(token)}
              phoneWhatsApp={phoneWhatsApp}
            />

            <label className="block">
              <span className={labelClass}>Notes</span>
              <textarea
                className={`${inputClass} min-h-[110px] py-3`}
                rows={4}
                placeholder="Courses, hotel style, flights…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-chrome-200 bg-cream/50 px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-chrome-300 text-gs-green focus:ring-gs-green/30"
                checked={addTransfers}
                onChange={(e) => setAddTransfers(e.target.checked)}
              />
              <span>
                <span className="block font-ge text-[0.95rem] font-bold text-gs-dark">
                  Add airport & hotel transfers
                </span>
                <span className="mt-0.5 block font-ge text-sm text-ge-gray600">
                  Optional — Málaga Airport and hotel runs with your quote.
                </span>
              </span>
            </label>

            <GeTermsAcceptanceField checked={termsAccepted} onChange={setTermsAccepted} id="bundle-quote-terms" />

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-ge text-sm text-red-800">
                <p>{errorMessage}</p>
                {errorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                  <a className="mt-2 inline-block font-bold underline" href="/login">
                    Sign in to continue
                  </a>
                ) : null}
              </div>
            ) : null}

            <GeButton type="submit" variant="gs-green" size="lg" className="w-full" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Send quote request'}
            </GeButton>
          </form>
        </>
      )}
    </div>
  )
}
