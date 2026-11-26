import { useEffect, useRef, useState, type FormEvent } from 'react'
import { m  } from 'framer-motion'
import { Send } from 'lucide-react'
import { BookedDatesAvailabilityNotice } from '../../../components/booked-dates-availability-notice'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'
import { transportEnquiryFormCopy } from '../data/transport-service'
import { TransferCollectionPointField } from '../../../components/transfer-collection-point-field'
import { TransferPlaceTypeahead } from '../../../components/transfer-place-typeahead'
import { COURSES } from '../../../data/coastal-golf-data'
import { isMalagaAirportCollectionPoint } from '../../../lib/malaga-airport-pickup'
import { assertDatesNotBooked, loadBookedServiceDayIsoSet } from '../../../lib/booked-service-days'
import { getLocalDateIso } from '../../../lib/local-date-iso'
import { plannedTravelDatesErrorMessage, travelEndMinIso, travelStartMinIso } from '../../../lib/travel-date-bounds'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  PICKUP_DROPOFF_TYPES,
  TRIP_ARRIVAL_MODE,
  WEBSITE_ENQUIRY_FORM
} from '../../../lib/enquiry-form-registry'
import { getSupabaseBrowserClient } from '../../../lib/supabase-client'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../../../lib/post-enquiry-client'
import { validateMobilePhoneInput } from '../../../lib/phone-mobile'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../../../lib/terms-acceptance'
import {
  EnquirySpamGuardFields,
  useEnquirySpamGuardState
} from '../../../components/enquiry-spam-guard-fields'
import { RECAPTCHA_ACTIONS } from '../../../lib/enquiry-spam-guard'
import { GeTermsAcceptanceField } from './ge-terms-acceptance-field'
import { MAX_ENQUIRY_PEOPLE } from '../data/form-people-options'

const labelClass =
  'mb-1.5 block font-ge text-[0.82rem] font-bold uppercase tracking-[0.12em] text-forest-800'

const inputClass =
  'min-h-[52px] w-full rounded-xl border border-ge-gray200 bg-white px-4 font-ge text-[1.06rem] text-gs-dark shadow-sm outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

function buildMailtoFallback(body: Record<string, string>) {
  const lines = Object.entries(body).map(([k, v]) => `${k}: ${v}`)
  const subject = encodeURIComponent('GolfSol Ireland — transport request')
  const mailBody = encodeURIComponent(lines.join('\n'))
  return `mailto:${contactInfo.email}?subject=${subject}&body=${mailBody}`
}

/**
 * Solid light enquiry card — sits inside {@link TransportEnquireBlock} at the
 * bottom of the transport service page. Posts to the same /api/enquiry route
 * as the homepage form.
 */
export function TransportHeroEnquiryForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const [passengers, setPassengers] = useState(4)
  const [collectionPoint, setCollectionPoint] = useState('')
  const [inboundFlightNumber, setInboundFlightNumber] = useState('')
  const [destination, setDestination] = useState('')
  const [collectionTime, setCollectionTime] = useState('')
  const [asap, setAsap] = useState(false)
  const [tripArrivalMode, setTripArrivalMode] = useState<(typeof TRIP_ARRIVAL_MODE)[keyof typeof TRIP_ARRIVAL_MODE]>(TRIP_ARRIVAL_MODE.planned)
  const [travelDateFrom, setTravelDateFrom] = useState('')
  const [travelDateTo, setTravelDateTo] = useState('')
  const [bookedDays, setBookedDays] = useState<Set<string>>(() => new Set())
  const [hideCollectionByAdmin, setHideCollectionByAdmin] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { spamGuard, fieldsProps: spamFieldsProps } = useEnquirySpamGuardState(
    RECAPTCHA_ACTIONS.transportEnquiry
  )
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = getSupabaseBrowserClient()
      const booked = await loadBookedServiceDayIsoSet(supabase)
      if (!cancelled) {
        setBookedDays(booked)
      }
      if (!supabase || cancelled) {
        return
      }
      const { data } = await supabase.from('transport_form_public_flags').select('hide_collection_datetime').eq('id', 1).maybeSingle()
      if (!cancelled) {
        setHideCollectionByAdmin(Boolean(data?.hide_collection_datetime))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (tripArrivalMode !== TRIP_ARRIVAL_MODE.alreadyAtAgp || asap) {
      return
    }
    const iso = getLocalDateIso()
    setTravelDateFrom(iso)
    setTravelDateTo(iso)
    if (!hideCollectionByAdmin) {
      setCollectionTime((prev) => {
        const t = prev.trim()
        if (t.length >= 16 && t.slice(0, 10) === iso) {
          return prev
        }
        return `${iso}T12:00`
      })
    }
  }, [tripArrivalMode, asap, hideCollectionByAdmin])

  useEffect(() => {
    if (asap || hideCollectionByAdmin || !travelDateFrom) {
      return
    }
    const ct = collectionTime.trim()
    if (!ct || ct.length < 16) {
      return
    }
    const day = ct.slice(0, 10)
    const anchor =
      tripArrivalMode === TRIP_ARRIVAL_MODE.planned
        ? travelDateFrom.slice(0, 10)
        : tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
          ? getLocalDateIso()
          : ''
    if (anchor.length === 10 && day !== anchor) {
      setCollectionTime(`${anchor}T12:00`)
    }
  }, [travelDateFrom, tripArrivalMode, asap, hideCollectionByAdmin, collectionTime])

  useEffect(() => {
    if (tripArrivalMode !== TRIP_ARRIVAL_MODE.planned || asap) {
      return
    }
    const t = travelStartMinIso()
    const df = travelDateFrom.trim().slice(0, 10)
    const dt = travelDateTo.trim().slice(0, 10)
    if (df.length === 10 && df < t) {
      setTravelDateFrom(t)
      return
    }
    if (df.length === 10 && dt.length === 10) {
      const endMin = travelEndMinIso(df)
      if (dt < endMin) {
        setTravelDateTo(endMin)
      }
    }
  }, [tripArrivalMode, asap, travelDateFrom, travelDateTo])

  useEffect(() => {
    if (status === 'success') {
      confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [status])

  const resetIdle = () => {
    setStatus('idle')
    setErrorMessage(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetIdle()

    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    const phone = phoneWhatsApp.trim()
    const from = collectionPoint.trim()
    const to = destination.trim()

    if (!name || !mail || !phone || !from || !to) {
      setErrorMessage(transportEnquiryFormCopy.validationRequired)
      setStatus('error')
      return
    }
    if (isMalagaAirportCollectionPoint(from) && !inboundFlightNumber.trim()) {
      setErrorMessage('Add your inbound flight number for airport pickup (e.g. FR 7044).')
      setStatus('error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErrorMessage(transportEnquiryFormCopy.validationEmail)
      setStatus('error')
      return
    }
    const phoneCheck = validateMobilePhoneInput(phone)
    if (!phoneCheck.ok) {
      setErrorMessage(phoneCheck.message)
      setStatus('error')
      return
    }
    if (passengers < 1 || passengers > MAX_ENQUIRY_PEOPLE) {
      setErrorMessage(transportEnquiryFormCopy.validationPassengers)
      setStatus('error')
      return
    }

    const relaxCollection = asap || hideCollectionByAdmin
    if (!relaxCollection && !collectionTime.trim()) {
      setErrorMessage(transportEnquiryFormCopy.validationTime)
      setStatus('error')
      return
    }

    const df = travelDateFrom.trim()
    const dt = travelDateTo.trim()
    const todayIso = getLocalDateIso()

    if (tripArrivalMode === TRIP_ARRIVAL_MODE.planned && !asap) {
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

    if (tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp && !asap) {
      if (df !== todayIso || dt !== todayIso) {
        setErrorMessage('When you are already here, travel dates must be set to today only.')
        setStatus('error')
        return
      }
    }

    if (!relaxCollection) {
      const raw = collectionTime.trim()
      const cday = raw.slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cday)) {
        setErrorMessage('Please choose a valid collection date and time.')
        setStatus('error')
        return
      }
      if (tripArrivalMode === TRIP_ARRIVAL_MODE.planned && !asap && cday !== df) {
        setErrorMessage('Collection must be on the same calendar day as your travel start date.')
        setStatus('error')
        return
      }
      if (tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp && !asap && cday !== todayIso) {
        setErrorMessage('Collection must be today — same day you are already in the area.')
        setStatus('error')
        return
      }
    }

    const bookedCheckDates: string[] = []
    if (!asap && tripArrivalMode === TRIP_ARRIVAL_MODE.planned) {
      bookedCheckDates.push(df, dt)
    }
    if (!asap && tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
      bookedCheckDates.push(todayIso)
    }
    if (!relaxCollection) {
      bookedCheckDates.push(collectionTime.trim().slice(0, 10))
    }
    const bookedMsg = assertDatesNotBooked(bookedDays, bookedCheckDates)
    if (bookedMsg) {
      setErrorMessage(bookedMsg)
      setStatus('error')
      return
    }

    if (!termsAccepted) {
      setErrorMessage(TERMS_ACCEPTANCE_ERROR)
      setStatus('error')
      return
    }

    const timing = relaxCollection
      ? hideCollectionByAdmin
        ? 'Collection time — to be confirmed with GolfSol (busy period)'
        : 'ASAP (first available driver)'
      : collectionTime.trim()
    const tripTimingLine =
      asap && tripArrivalMode === TRIP_ARRIVAL_MODE.planned
        ? 'Trip timing: Planned trip — first available driver (dates to confirm with you)'
        : tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
          ? `Trip timing: Already at Málaga (AGP)${!asap ? ` (${todayIso})` : ''}`
          : `Trip timing: ${df} → ${dt}`
    const interest = [
      'TRANSPORT PAGE — transfer request',
      tripTimingLine,
      `Passengers: ${passengers}`,
      `Collection point: ${from}`,
      `Destination: ${to}`,
      `Collection timing: ${timing}`
    ].join('\n')

    const bestTimeToCall = relaxCollection
      ? hideCollectionByAdmin
        ? 'Collection time to be confirmed'
        : 'ASAP — transfer'
      : `Collection: ${collectionTime.trim()}`

    const courseDest = COURSES.find(
      (c) =>
        to.length >= 4 &&
        (to.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(to.toLowerCase().slice(0, 8)))
    )
    let dropoffType: (typeof PICKUP_DROPOFF_TYPES)[keyof typeof PICKUP_DROPOFF_TYPES] = PICKUP_DROPOFF_TYPES.freeText
    if (courseDest) {
      dropoffType = PICKUP_DROPOFF_TYPES.golfCourse
    } else if (isMalagaAirportCollectionPoint(to)) {
      dropoffType = PICKUP_DROPOFF_TYPES.malagaAirport
    }

    const formFields: Record<string, string> = {
      'Trip timing':
        tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
          ? 'Already at Málaga (AGP) — need transfers now'
          : asap
            ? 'Planned trip — first available driver'
            : 'Planned trip — dated',
      [ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]:
        tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? 'yes' : 'no',
      ...(!asap && df ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]: df, 'Travel start date': df } : {}),
      ...(!asap && dt ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]: dt, 'Travel end date': dt } : {}),
      ...(tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp && !asap
        ? { 'Service date (already here)': todayIso }
        : {}),
      Passengers: String(passengers),
      'Collection point': from,
      Destination: to,
      'Collection timing': timing,
      ASAP: asap ? 'yes' : 'no',
      ...(hideCollectionByAdmin ? { 'Public form': 'Collection date/time hidden (admin busy mode)' } : {}),
      [ENQUIRY_STRUCTURED_FIELD_KEYS.pax]: String(passengers),
      [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType]: isMalagaAirportCollectionPoint(from)
        ? PICKUP_DROPOFF_TYPES.malagaAirport
        : PICKUP_DROPOFF_TYPES.freeText,
      ...(isMalagaAirportCollectionPoint(from) && inboundFlightNumber.trim()
        ? { 'Flight number': inboundFlightNumber.trim() }
        : {}),
      [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel]: from,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType]: dropoffType,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]: to,
      ...(courseDest ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffId]: courseDest.id } : {})
    }

    setStatus('submitting')
    setErrorCode(null)
    try {
      const result = await postWebsiteEnquiry({
        fullName: name,
        email: mail,
        phoneWhatsApp: phone,
        interest,
        bestTimeToCall,
        spamGuard: await spamGuard(),
        formPayload: {
          form: WEBSITE_ENQUIRY_FORM.transportServicePage,
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
      setTermsAccepted(false)
    } catch (e) {
      setStatus('error')
      setErrorCode(null)
      setErrorMessage(e instanceof Error ? e.message : transportEnquiryFormCopy.errorBody)
    }
  }

  const relaxCollectionMailto = asap || hideCollectionByAdmin
  const mailtoHref = buildMailtoFallback({
    Name: fullName.trim(),
    Email: email.trim(),
    Phone: phoneWhatsApp.trim(),
    Passengers: String(passengers),
    'Collection point': collectionPoint.trim(),
    Destination: destination.trim(),
    'Collection time / ASAP': relaxCollectionMailto
      ? hideCollectionByAdmin
        ? 'To be confirmed (busy period)'
        : 'ASAP'
      : collectionTime.trim()
  })

  const todayIsoForPicker = getLocalDateIso()
  const plannedStartMin = travelStartMinIso()
  const plannedEndMin = travelEndMinIso(travelDateFrom)
  const transportWatchDates = [
    ...(tripArrivalMode === TRIP_ARRIVAL_MODE.planned && !asap ? [travelDateFrom, travelDateTo] : []),
    ...(tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp && !asap ? [todayIsoForPicker] : []),
    ...(!asap && !hideCollectionByAdmin && collectionTime.trim().length >= 10 ? [collectionTime.trim().slice(0, 10)] : [])
  ]
  const collectionDayMinMax =
    !asap && !hideCollectionByAdmin
      ? tripArrivalMode === TRIP_ARRIVAL_MODE.planned && travelDateFrom.trim().length === 10
        ? {
            min: `${travelDateFrom.trim()}T00:00`,
            max: `${travelDateFrom.trim()}T23:59`
          }
        : tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
          ? {
              min: `${todayIsoForPicker}T00:00`,
              max: `${todayIsoForPicker}T23:59`
            }
          : null
      : null

  return (
    <m.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
      className="w-full shrink-0 lg:max-w-none"
    >
      <div
        id="transport-enquiry"
        className="relative rounded-2xl border-2 border-gs-dark/10 bg-white shadow-[0_20px_50px_rgba(6,59,42,0.12)]"
      >
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700" aria-hidden />

        {status === 'success' ? (
          <div ref={confirmationRef} className="px-5 py-8 text-center sm:px-7 sm:py-9">
            <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-gs-green sm:text-[0.85rem]">
              {transportEnquiryFormCopy.successTitle}
            </p>
            <p className="mt-3 font-ge text-base leading-7 text-ge-gray500 sm:text-[1rem]">{transportEnquiryFormCopy.successBody}</p>
            <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-6">
              Email us directly
            </GeButton>
          </div>
        ) : (
          <>
            <BookedDatesAvailabilityNotice bookedDays={bookedDays} className="px-5 pt-5 sm:px-6 sm:pt-6" watchDates={transportWatchDates} />
            <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4 px-5 pb-6 pt-2 sm:px-6 sm:pb-7 sm:pt-3" noValidate>
            <header className="border-b border-ge-gray100 pb-4">
              <p className="font-ge text-[0.85rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                {transportEnquiryFormCopy.sheetEyebrow}
              </p>
              <h2 className="mt-2.5 font-ge text-[1.7rem] font-extrabold leading-tight tracking-[0.02em] text-gs-green sm:text-[1.9rem]">
                {transportEnquiryFormCopy.title}
              </h2>
              <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray500">
                Name, contact, dates, passengers, and route — that is enough.
              </p>
            </header>

            <label className="block min-w-0">
              <span className={labelClass}>Name</span>
              <input
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
                required
              />
            </label>

            <label className="block min-w-0">
              <span className={labelClass}>Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block min-w-0">
              <span className={labelClass}>Phone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phoneWhatsApp}
                onChange={(e) => setPhoneWhatsApp(e.target.value)}
                className={inputClass}
                placeholder={contactInfo.phoneFieldPlaceholder}
                required
              />
            </label>

            <label className="block min-w-0">
              <span className={labelClass}>Passengers</span>
              <select
                name="passengers"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className={inputClass}
              >
                {Array.from({ length: MAX_ENQUIRY_PEOPLE }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </label>

            <label className="block min-w-0">
              <span className={labelClass}>Start date</span>
              <input
                name="travelDateFrom"
                type="date"
                value={travelDateFrom}
                min={plannedStartMin}
                onChange={(e) => {
                  setTripArrivalMode(TRIP_ARRIVAL_MODE.planned)
                  setAsap(false)
                  setTravelDateFrom(e.target.value)
                }}
                className={inputClass}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>End date</span>
              <input
                name="travelDateTo"
                type="date"
                value={travelDateTo}
                min={plannedEndMin}
                onChange={(e) => {
                  setTripArrivalMode(TRIP_ARRIVAL_MODE.planned)
                  setAsap(false)
                  setTravelDateTo(e.target.value)
                }}
                className={inputClass}
              />
            </label>

            <div className="block min-w-0">
              <TransferCollectionPointField
                flightNumber={inboundFlightNumber}
                hint=""
                inputClassName={inputClass}
                inputId="transport-collection-point"
                label="Pickup"
                labelClassName={labelClass}
                onChangeValue={setCollectionPoint}
                onFlightNumberChange={setInboundFlightNumber}
                placeholder="Hotel, golf course, or Málaga Airport"
                value={collectionPoint}
              />
            </div>

            <label className="block min-w-0">
              <span className={labelClass}>Drop-off</span>
              <TransferPlaceTypeahead
                inputClassName={inputClass}
                inputId="transport-destination"
                onChangeValue={setDestination}
                placeholder="Hotel, golf course, or resort"
                value={destination}
              />
            </label>

            <details className="rounded-xl border border-ge-gray200 bg-ge-gray50/60 px-3.5 py-2.5">
              <summary className="cursor-pointer list-none font-ge text-[0.9rem] font-semibold text-ge-gray600 marker:content-none [&::-webkit-details-marker]:hidden">
                Optional: pickup time / already at airport
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                <label className="block min-w-0">
                  <span className={labelClass}>Timing</span>
                  <select
                    name="tripArrivalMode"
                    value={tripArrivalMode}
                    onChange={(e) => {
                      const next =
                        e.target.value === TRIP_ARRIVAL_MODE.alreadyAtAgp
                          ? TRIP_ARRIVAL_MODE.alreadyAtAgp
                          : TRIP_ARRIVAL_MODE.planned
                      setTripArrivalMode(next)
                      if (next === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
                        setAsap(false)
                        const t = getLocalDateIso()
                        setTravelDateFrom(t)
                        setTravelDateTo(t)
                      }
                    }}
                    className={inputClass}
                  >
                    <option value={TRIP_ARRIVAL_MODE.planned}>I have travel dates</option>
                    <option value={TRIP_ARRIVAL_MODE.alreadyAtAgp}>Already at Málaga (AGP)</option>
                  </select>
                </label>
                {hideCollectionByAdmin ? (
                  <p className="font-ge text-[0.95rem] leading-snug text-ge-gray600">
                    Pickup time is confirmed with you for this period.
                  </p>
                ) : (
                  <>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ge-gray200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        checked={asap}
                        onChange={(e) => {
                          const on = e.target.checked
                          setAsap(on)
                          if (on) {
                            setCollectionTime('')
                            setTravelDateFrom('')
                            setTravelDateTo('')
                          }
                        }}
                        className="mt-1 h-5 w-5 shrink-0 rounded border-ge-gray300 text-gs-green focus:ring-gs-green"
                      />
                      <span className="font-ge text-[1.02rem] font-semibold text-gs-dark">
                        {transportEnquiryFormCopy.asapLabel}
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      name="collectionTime"
                      value={collectionTime}
                      onChange={(e) => setCollectionTime(e.target.value)}
                      disabled={asap}
                      min={collectionDayMinMax?.min}
                      max={collectionDayMinMax?.max}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-ge-gray100 disabled:text-ge-gray400`}
                    />
                  </>
                )}
              </div>
            </details>

            {status === 'error' && errorMessage ? (
              <div
                className="rounded-lg border border-brand-700/50 bg-orange-50 px-3 py-2 font-ge text-base text-gs-dark"
                role="alert"
              >
                <p>
                  {errorMessage}{' '}
                  <a href={mailtoHref} className="font-bold text-gs-green underline underline-offset-2 hover:text-gs-electric">
                    Open email draft
                  </a>
                </p>
                {errorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                  <p className="mt-2 text-sm font-semibold text-gs-green">
                    <a className="underline underline-offset-2" href="/portal">
                      Sign in to your trip desk
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}

            <EnquirySpamGuardFields {...spamFieldsProps} />
            <GeTermsAcceptanceField
              checked={termsAccepted}
              onChange={setTermsAccepted}
              id="terms-transport-hero"
            />

            <GeButton type="submit" variant="gs-green" size="md" className="w-full" disabled={status === 'submitting' || !termsAccepted}>
              <Send className="h-4 w-4" aria-hidden />
              {status === 'submitting' ? transportEnquiryFormCopy.sending : transportEnquiryFormCopy.submit}
            </GeButton>
          </form>
          </>
        )}
      </div>
    </m.div>
  )
}
