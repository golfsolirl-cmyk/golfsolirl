import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  BUNDLE_TIERS,
  resolveBundleFromSlug,
  type BundleTierId
} from '../../../data/golf-holiday-bundles'
import { BookedDatesAvailabilityNotice } from '../../../components/booked-dates-availability-notice'
import {
  EnquirySpamGuardFields,
  useEnquirySpamGuardState
} from '../../../components/enquiry-spam-guard-fields'
import { RECAPTCHA_ACTIONS } from '../../../lib/enquiry-spam-guard'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  PICKUP_DROPOFF_TYPES,
  WEBSITE_ENQUIRY_FORM
} from '../../../lib/enquiry-form-registry'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../../../lib/post-enquiry-client'
import { validateMobilePhoneInput } from '../../../lib/phone-mobile'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { assertDatesNotBooked, loadBookedServiceDayIsoSet } from '../../../lib/booked-service-days'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../../../lib/terms-acceptance'
import { travelEndMinIso, travelStartMinIso } from '../../../lib/travel-date-bounds'
import {
  atLeastOneTripService,
  emptyTripServices,
  tripServicesFromFlags,
  TRIP_SERVICE_LABELS,
  TRIP_SERVICE_ORDER,
  type TripQuotePreset,
  type TripServiceId,
  type TripServiceSelection
} from '../../../lib/trip-quote-services'
import { golferGroupSizeSelectOptions, passengerCountSelectOptions } from '../data/form-people-options'
import { GeButton } from './ge-button'
import { GeTermsAcceptanceField } from './ge-terms-acceptance-field'

const labelClass =
  'mb-1.5 block font-ge text-[0.82rem] font-bold uppercase tracking-[0.12em] text-forest-800'
const inputClass =
  'min-h-[52px] h-13 w-full rounded-xl border border-ge-gray200 bg-white px-4 font-ge text-[1.06rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

type SmartTripQuoteFormProps = {
  readonly preset?: TripQuotePreset
  readonly title?: string
  readonly lead?: string
  readonly formId?: string
}

function toggleService(prev: TripServiceSelection, id: TripServiceId): TripServiceSelection {
  return { ...prev, [id]: !prev[id] }
}

/**
 * Shared trip-builder quote form — service chips first, then only relevant fields.
 */
export function SmartTripQuoteForm({
  preset,
  title = 'Build your quote',
  lead = 'Pick what you need. We only ask for the details that matter.',
  formId = 'quote-form'
}: SmartTripQuoteFormProps) {
  const bundle = useMemo(
    () => resolveBundleFromSlug(preset?.bundleSlug ?? null),
    [preset?.bundleSlug]
  )

  const initialServices = useMemo(() => {
    if (preset?.services) return tripServicesFromFlags(preset.services)
    if (bundle) return { transfers: true, accommodation: true, golf_courses: true }
    return emptyTripServices()
  }, [preset?.services, bundle])

  const [services, setServices] = useState<TripServiceSelection>(initialServices)
  const [tier, setTier] = useState<BundleTierId>(
    (preset?.tier as BundleTierId) === 'value' ||
      (preset?.tier as BundleTierId) === 'premium' ||
      (preset?.tier as BundleTierId) === 'classic'
      ? (preset?.tier as BundleTierId)
      : 'classic'
  )
  const [travelDateFrom, setTravelDateFrom] = useState('')
  const [travelDateTo, setTravelDateTo] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [passengers, setPassengers] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [flightNo, setFlightNo] = useState('')
  const [destination, setDestination] = useState('')
  const [golfBags, setGolfBags] = useState('0')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const hotelsSeed = useMemo(() => {
    const list = [...(preset?.hotels ?? []), ...(preset?.hotel ? [preset.hotel] : [])].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    )
    return list
  }, [preset?.hotels, preset?.hotel])
  const coursesSeed = preset?.courses ?? []
  const notesSeed = useMemo(() => {
    const bits: string[] = []
    if (coursesSeed.length) bits.push(`Courses: ${coursesSeed.join(', ')}`)
    if (hotelsSeed.length) bits.push(`Hotel: ${hotelsSeed.join(', ')}`)
    return bits.join('\n')
  }, [coursesSeed, hotelsSeed])
  const [notes, setNotes] = useState(notesSeed)
  const [hotelPreference, setHotelPreference] = useState(hotelsSeed.join(', '))
  const [coursePreference, setCoursePreference] = useState(coursesSeed.join(', '))
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { spamGuard, fieldsProps: spamFieldsProps } = useEnquirySpamGuardState(
    RECAPTCHA_ACTIONS.tripQuote
  )
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [bookedDays, setBookedDays] = useState<Set<string>>(() => new Set())
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  useEffect(() => {
    if (notesSeed) setNotes((prev) => (prev.trim() ? prev : notesSeed))
    if (hotelsSeed.length) setHotelPreference((prev) => (prev.trim() ? prev : hotelsSeed.join(', ')))
    if (coursesSeed.length) setCoursePreference((prev) => (prev.trim() ? prev : coursesSeed.join(', ')))
  }, [notesSeed, hotelsSeed, coursesSeed])

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

  const tierMeta = BUNDLE_TIERS.find((t) => t.id === tier) ?? BUNDLE_TIERS[1]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setErrorCode(null)

    if (!atLeastOneTripService(services)) {
      setErrorMessage('Select at least one: transfers, accommodation, or golf courses.')
      setStatus('error')
      return
    }

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
    if (!termsAccepted) {
      setErrorMessage(TERMS_ACCEPTANCE_ERROR)
      setStatus('error')
      return
    }

    if (services.golf_courses && !groupSize) {
      setErrorMessage('Select how many golfers.')
      setStatus('error')
      return
    }
    if (services.transfers && !passengers && !groupSize) {
      setErrorMessage('Select passengers for transfers.')
      setStatus('error')
      return
    }
    if (services.transfers && !destination.trim() && !hotelPreference.trim()) {
      setErrorMessage('Add a destination hotel or area for transfers.')
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

    const serviceLabels = TRIP_SERVICE_ORDER.filter((id) => services[id]).map((id) => TRIP_SERVICE_LABELS[id])
    const interestLines = [
      `Trip builder: ${serviceLabels.join(' · ')}`,
      bundle ? `Bundle: ${bundle.packageName} · ${bundle.nights}n · ${bundle.rounds}r · ${tierMeta.label}` : null,
      notes.trim() || null
    ].filter(Boolean)

    const formFields: Record<string, string> = {
      Page: preset?.pageLabel || '/quote',
      Topic: interestLines[0] ?? 'Trip quote',
      Services: serviceLabels.join(', '),
      [ENQUIRY_STRUCTURED_FIELD_KEYS.serviceStages]: JSON.stringify(services),
      [ENQUIRY_STRUCTURED_FIELD_KEYS.servicePrimary]: services.transfers
        ? 'transfer'
        : services.golf_courses
          ? 'golf'
          : 'accommodation',
      [ENQUIRY_STRUCTURED_FIELD_KEYS.addTransfers]: services.transfers ? 'yes' : 'no'
    }

    if (bundle) {
      formFields.Bundle = bundle.packageName
      formFields.Nights = String(bundle.nights)
      formFields.Rounds = String(bundle.rounds)
      formFields['Price level'] = tierMeta.label
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleSlug] = bundle.slug
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleName] = bundle.packageName
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleNights] = String(bundle.nights)
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleRounds] = String(bundle.rounds)
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.bundleTier] = tier
    }

    if (travelDateFrom) {
      formFields['Start date'] = travelDateFrom
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] = travelDateFrom
    }
    if (travelDateTo) {
      formFields['End date'] = travelDateTo
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] = travelDateTo
    }

    if (services.golf_courses) {
      if (groupSize) formFields.Golfers = groupSize
      if (coursePreference.trim()) formFields.Courses = coursePreference.trim()
      const paxMatch = groupSize.match(/^(\d+)/)
      if (paxMatch) formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] = paxMatch[1] ?? ''
    }

    if (services.accommodation) {
      if (hotelPreference.trim()) formFields.Hotel = hotelPreference.trim()
      if (tierMeta) formFields['Hotel level'] = tierMeta.label
    }

    if (services.transfers) {
      const dest = destination.trim() || hotelPreference.trim()
      const pickup = `Málaga Airport (AGP)${flightNo.trim() ? ` · Flight ${flightNo.trim()}` : ''}${
        arrivalTime ? ` · ${arrivalTime}` : ''
      }`
      formFields.Destination = dest
      if (arrivalTime) formFields['Arrival time'] = arrivalTime
      if (flightNo.trim()) formFields['Flight number'] = flightNo.trim()
      if (passengers) formFields.Passengers = passengers
      formFields['Golf bags'] = golfBags
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType] = PICKUP_DROPOFF_TYPES.malagaAirport
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel] = pickup
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType] = PICKUP_DROPOFF_TYPES.hotel
      formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel] = dest
      const paxMatch = (passengers || groupSize).match(/^(\d+)/)
      if (paxMatch) formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] = paxMatch[1] ?? ''
    }

    if (notes.trim()) formFields.Notes = notes.trim()

    const result = await postWebsiteEnquiry({
      fullName: name,
      email: mail,
      phoneWhatsApp: phone,
      interest: interestLines.join('\n'),
      bestTimeToCall: 'Any time',
      requestedServices: services,
      spamGuard: await spamGuard(),
      formPayload: {
        form: preset?.formKey || WEBSITE_ENQUIRY_FORM.bundleQuote,
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
    setPassengers('')
    setTermsAccepted(false)
  }

  const startMin = travelStartMinIso()
  const endMin = travelEndMinIso(travelDateFrom)

  return (
    <div
      id={formId}
      className="relative rounded-[1.75rem] border border-gs-dark/10 bg-white p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6"
    >
      <p className="font-ge text-[0.85rem] font-bold uppercase tracking-[0.14em] text-brand-700">Trip builder</p>
      <h2 className="mt-2.5 font-ge text-[1.7rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green sm:text-[1.9rem]">
        {title}
      </h2>
      <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray500">{lead}</p>

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
          <p className="font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-gs-green">Request received</p>
          <p className="mt-2 font-ge text-[1.04rem] leading-7 text-gs-dark">
            Thanks — we will reply from Ireland with clear options for your trip.
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
              <legend className={labelClass}>What do you need?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TRIP_SERVICE_ORDER.map((id) => {
                  const on = services[id]
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setServices((prev) => toggleService(prev, id))}
                      className={
                        on
                          ? 'rounded-full bg-gs-dark px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-white'
                          : 'rounded-full border border-chrome-300 bg-white px-4 py-2.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-gs-dark'
                      }
                    >
                      {TRIP_SERVICE_LABELS[id]}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {(bundle || services.accommodation) && (
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
                          ? 'rounded-full bg-gs-green px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-white'
                          : 'rounded-full border border-chrome-300 bg-white px-4 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-gs-dark'
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 font-ge text-sm text-ge-gray500">{tierMeta.blurb}</p>
              </fieldset>
            )}

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

            {services.golf_courses ? (
              <>
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
                  <span className={labelClass}>Courses</span>
                  <input
                    className={inputClass}
                    placeholder="Course names (optional)"
                    value={coursePreference}
                    onChange={(e) => setCoursePreference(e.target.value)}
                  />
                </label>
              </>
            ) : null}

            {services.accommodation ? (
              <label className="block">
                <span className={labelClass}>Hotel / area</span>
                <input
                  className={inputClass}
                  placeholder="Hotel name or area"
                  value={hotelPreference}
                  onChange={(e) => setHotelPreference(e.target.value)}
                />
              </label>
            ) : null}

            {services.transfers ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelClass}>Arrival time</span>
                    <input
                      className={inputClass}
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Flight number</span>
                    <input
                      className={inputClass}
                      placeholder="e.g. EI582"
                      value={flightNo}
                      onChange={(e) => setFlightNo(e.target.value)}
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelClass}>Passengers</span>
                    <select
                      className={inputClass}
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                    >
                      <option value="">Select</option>
                      {passengerCountSelectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClass}>Golf bags</span>
                    <select className={inputClass} value={golfBags} onChange={(e) => setGolfBags(e.target.value)}>
                      {['0', '1', '2', '3', '4', '5', '6', '7', '8'].map((n) => (
                        <option key={n} value={n}>
                          {n === '0' ? '0 golf bags' : n === '1' ? '1 golf bag' : `${n} golf bags`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className={labelClass}>Destination hotel / area</span>
                  <input
                    className={inputClass}
                    placeholder="Hotel or area near AGP"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </label>
              </>
            ) : null}

            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                className={inputClass}
                autoComplete="name"
                required
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Mobile / WhatsApp</span>
              <input
                className={inputClass}
                type="tel"
                autoComplete="tel"
                required
                value={phoneWhatsApp}
                onChange={(e) => setPhoneWhatsApp(e.target.value)}
              />
            </label>

            <EnquirySpamGuardFields {...spamFieldsProps} />

            <label className="block">
              <span className={labelClass}>Notes</span>
              <textarea
                className={`${inputClass} min-h-[100px] py-3`}
                rows={3}
                placeholder="Anything else we should know…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <GeTermsAcceptanceField checked={termsAccepted} onChange={setTermsAccepted} id={`${formId}-terms`} />

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
