import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY } from './golf-experience/components/already-booked-flight-panel'
import { BookedDatesAvailabilityNotice } from '../components/booked-dates-availability-notice'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { GePaymentsIreland } from './golf-experience/sections/payments-ireland'
import { GeFinalCta } from './golf-experience/sections/final-cta'
import { PremiumPageHero } from '../components/home/premium-page-hero'
import { heroImageSetFromRegistry, NAMED_HERO_IMAGE_SETS } from '../lib/page-hero-images'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'
import { GeTransfersInsuranceBanner } from './golf-experience/components/ge-transfers-insurance-banner'
import { GeSection } from './golf-experience/components/ge-section'
import { contactInfo } from './golf-experience/data/copy'
import { golferGroupSizeSelectOptions } from './golf-experience/data/form-people-options'
import { assertDatesNotBooked, loadBookedServiceDayIsoSet } from '../lib/booked-service-days'
import { getLocalDateIso } from '../lib/local-date-iso'
import { plannedTravelDatesErrorMessage, travelEndMinIso, travelStartMinIso } from '../lib/travel-date-bounds'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  TRIP_ARRIVAL_MODE,
  WEBSITE_ENQUIRY_FORM
} from '../lib/enquiry-form-registry'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../lib/post-enquiry-client'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../lib/terms-acceptance'
import { GeTermsAcceptanceField } from './golf-experience/components/ge-terms-acceptance-field'

type TravelMode = 'flight' | 'arrived'

type FlightSnap = {
  fullName: string
  email?: string
  mobile: string
  travelMode: TravelMode
  flightNo: string
  arrivalTime: string
  collectionTime: string
  savedAt?: string
}

function parseFlightSnap(raw: string): FlightSnap | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed.fullName !== 'string' || typeof parsed.mobile !== 'string') return null

    let travelMode: TravelMode | null = null
    if (parsed.travelMode === 'arrived') travelMode = 'arrived'
    else if (parsed.travelMode === 'flight') travelMode = 'flight'
    else if (
      typeof parsed.flightNo === 'string' &&
      parsed.flightNo.trim() !== '' &&
      typeof parsed.arrivalTime === 'string' &&
      parsed.arrivalTime.trim() !== ''
    ) {
      travelMode = 'flight'
    }

    if (!travelMode) return null

    const flightNo = typeof parsed.flightNo === 'string' ? parsed.flightNo : ''
    const arrivalTime = typeof parsed.arrivalTime === 'string' ? parsed.arrivalTime : ''
    const collectionTime = typeof parsed.collectionTime === 'string' ? parsed.collectionTime : ''

    if (travelMode === 'flight') {
      if (!flightNo.trim() || !arrivalTime.trim()) return null
    } else if (!collectionTime.trim()) {
      return null
    }

    return {
      fullName: parsed.fullName,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      mobile: parsed.mobile,
      travelMode,
      flightNo,
      arrivalTime,
      collectionTime,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : undefined
    }
  } catch {
    return null
  }
}

type SnapState = FlightSnap | null | undefined

const continueLabelClass = 'mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gs-dark/72'
const continueInputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-brand-700/40 transition-shadow placeholder:text-ge-gray300 focus:border-brand-700 focus:ring-2'

function formatSnapForInterest(snap: FlightSnap) {
  const arrival =
    snap.travelMode === 'flight'
      ? [`Arrival type: Inbound flight`, `Flight number: ${snap.flightNo}`, `Landing time: ${snap.arrivalTime}`]
      : [`Arrival type: Already arrived / collection`, `Collection time: ${snap.collectionTime}`]

  return [`Carried from homepage`, `Name: ${snap.fullName}`, `Mobile: ${snap.mobile}`, ...arrival]
}

export function ContinueTripPage() {
  const [snap, setSnap] = useState<SnapState>(undefined)
  const [email, setEmail] = useState('')
  const [tripArrivalMode, setTripArrivalMode] = useState<(typeof TRIP_ARRIVAL_MODE)[keyof typeof TRIP_ARRIVAL_MODE]>(
    TRIP_ARRIVAL_MODE.planned
  )
  const [travelDateFrom, setTravelDateFrom] = useState('')
  const [travelDateTo, setTravelDateTo] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [hotelStatus, setHotelStatus] = useState('')
  const [roundCount, setRoundCount] = useState('')
  const [roundTiming, setRoundTiming] = useState('')
  const [courseWishlist, setCourseWishlist] = useState('')
  const [notes, setNotes] = useState('')
  const [bestTimeToCall, setBestTimeToCall] = useState('Any time')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitErrorCode, setSubmitErrorCode] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [bookedDays, setBookedDays] = useState<Set<string>>(() => new Set())
  const confirmationRef = useRef<HTMLDivElement>(null)

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
    if (tripArrivalMode !== TRIP_ARRIVAL_MODE.alreadyAtAgp) {
      return
    }
    const iso = getLocalDateIso()
    setTravelDateFrom(iso)
    setTravelDateTo(iso)
  }, [tripArrivalMode])

  useEffect(() => {
    if (tripArrivalMode !== TRIP_ARRIVAL_MODE.planned) {
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
  }, [tripArrivalMode, travelDateFrom, travelDateTo])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY)
      if (!raw) {
        setSnap(null)
        return
      }
      const parsed = parseFlightSnap(raw)
      setSnap(parsed)
      if (parsed?.email) {
        setEmail(parsed.email)
      }
    } catch {
      setSnap(null)
    }
  }, [])

  useEffect(() => {
    document.title = 'Continue your trip | GolfSol Ireland'
  }, [])

  useEffect(() => {
    if (submitStatus === 'success') {
      confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [submitStatus])

  const whatsappHref = `https://wa.me/${contactInfo.phoneTel.replace('+', '')}?text=${encodeURIComponent(
    'Hi GolfSol Ireland — I have started my trip brief and would like to WhatsApp my enquiry.'
  )}`

  const continueAgpToday = getLocalDateIso()
  const continuePlannedStartMin = tripArrivalMode === TRIP_ARRIVAL_MODE.planned ? travelStartMinIso() : undefined
  const continuePlannedEndMin = tripArrivalMode === TRIP_ARRIVAL_MODE.planned ? travelEndMinIso(travelDateFrom) : undefined

  const handleContinueSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitStatus('idle')
    setSubmitError(null)

    if (!snap) {
      setSubmitStatus('error')
      setSubmitError('Your saved arrival details are missing. Start again from the homepage.')
      return
    }

    const mail = email.trim().toLowerCase()
    const df = travelDateFrom.trim()
    const dt = travelDateTo.trim()
    const size = groupSize.trim()
    const hotel = hotelStatus.trim()
    const rounds = roundCount.trim()
    const timing = roundTiming.trim()

    if (!mail || !size || !hotel || !rounds || !timing) {
      setSubmitStatus('error')
      setSubmitError(
        'Please complete email, group size, hotel status, number of rounds, and tee-time preference (prime, twilight, mix, or not sure).'
      )
      return
    }
    if (tripArrivalMode === TRIP_ARRIVAL_MODE.planned && (!df || !dt)) {
      setSubmitStatus('error')
      setSubmitError('Add travel start and end dates, or choose “Already at Málaga (AGP)”.')
      return
    }
    if (tripArrivalMode === TRIP_ARRIVAL_MODE.planned && df > dt) {
      setSubmitStatus('error')
      setSubmitError('Travel end date must be on or after the start date.')
      return
    }
    if (tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
      const today = getLocalDateIso()
      if (df !== today || dt !== today) {
        setSubmitStatus('error')
        setSubmitError('When you are already here, both travel dates must be set to today only.')
        return
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setSubmitStatus('error')
      setSubmitError('Please enter a valid email address.')
      return
    }

    const bookedDates = tripArrivalMode === TRIP_ARRIVAL_MODE.planned ? [df, dt] : [df, dt]
    const bookedMsg = assertDatesNotBooked(bookedDays, bookedDates)
    if (bookedMsg) {
      setSubmitStatus('error')
      setSubmitError(bookedMsg)
      return
    }

    if (!termsAccepted) {
      setSubmitStatus('error')
      setSubmitError(TERMS_ACCEPTANCE_ERROR)
      return
    }

    const carried = formatSnapForInterest(snap)
    const datesSummary =
      tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
        ? `Trip timing: Already at Málaga (AGP)${df || dt ? ` (${[df, dt].filter(Boolean).join(' → ')})` : ''}`
        : `Trip timing: ${df} → ${dt}`

    const interest = [
      'CONTINUE TRIP — completed itinerary brief',
      ...carried,
      `Email: ${mail}`,
      datesSummary,
      `Group size: ${size}`,
      `Hotel / accommodation status: ${hotel}`,
      `Preferred number of rounds: ${rounds}`,
      `Tee-time preference: ${timing}`,
      courseWishlist.trim() ? `Course wishlist: ${courseWishlist.trim()}` : null,
      notes.trim() ? `Extra notes: ${notes.trim()}` : null
    ].filter(Boolean)
    const formFields: Record<string, string> = {
      Email: mail,
      'Trip timing':
        tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
          ? 'Already at Málaga (AGP) — need transfers now'
          : 'Planned trip — dated',
      [ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]:
        tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? 'yes' : 'no',
      ...(df ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]: df, 'Travel start date': df } : {}),
      ...(dt ? { [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]: dt, 'Travel end date': dt } : {}),
      'Group size': size,
      'Hotel / accommodation status': hotel,
      'Preferred number of rounds': rounds,
      'Tee-time preference': timing
    }
    if (courseWishlist.trim()) {
      formFields['Course wishlist'] = courseWishlist.trim()
    }
    if (notes.trim()) {
      formFields['Extra notes'] = notes.trim()
    }
    carried.forEach((line) => {
      const idx = line.indexOf(': ')
      if (idx > 0) {
        formFields[line.slice(0, idx)] = line.slice(idx + 2)
      }
    })

    setSubmitStatus('submitting')
    setSubmitErrorCode(null)
    try {
      const result = await postWebsiteEnquiry({
        fullName: snap.fullName,
        email: mail,
        phoneWhatsApp: snap.mobile,
        interest: interest.join('\n'),
        bestTimeToCall: bestTimeToCall.trim() || 'Any time',
        formPayload: {
          form: WEBSITE_ENQUIRY_FORM.continueTrip,
          fields: { ...formFields, ...termsAcceptanceFormFields() }
        }
      })

      if (!result.ok) {
        setSubmitStatus('error')
        setSubmitError(result.message)
        setSubmitErrorCode(result.code ?? null)
        return
      }

      setSubmitStatus('success')
      setSubmitErrorCode(null)
      try {
        sessionStorage.removeItem(GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY)
      } catch {
        // Ignore browser storage failures after a successful API submission.
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitErrorCode(null)
      setSubmitError(error instanceof Error ? error.message : 'Could not send your trip brief right now.')
    }
  }

  if (snap === undefined) {
    return (
      <div className="ge-page min-h-screen overflow-x-hidden bg-white">
        <GeNavbar />
        <main id="main" className="flex min-h-[50vh] items-center justify-center bg-ge-gray50 px-5 py-16 font-ge text-ge-gray500">
          Loading…
        </main>
        <GeFooter />
      </div>
    )
  }

  if (!snap) {
    return (
      <div className="ge-page min-h-screen overflow-x-hidden bg-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
        >
          Skip to content
        </a>
        <GeNavbar />
        <main id="main">
          <PremiumPageHero
            srTitle="Continue your trip"
            images={heroImageSetFromRegistry('continueTrip')}
            kicker="Trip planner"
            titleLine1="No flight details found yet"
            lead="Start from the homepage — use the Hotel already booked card under Design Your Costa del Sol Golf Trip, then submit the quick form."
            primaryCta={{ label: 'Back to homepage', href: '/', variant: 'gs-gold' }}
            trustBadges={[
              { icon: CheckCircle2, label: 'Save your flight or arrival time first' },
              { icon: CheckCircle2, label: 'We pre-fill the next step for you' },
              { icon: CheckCircle2, label: 'Irish team replies fast' }
            ]}
            trustSectionTitle="How to continue"
          />
          <GeSection id="continue-help" background="white" innerClassName="py-14 sm:py-16">
            <div className="mx-auto max-w-lg px-5 text-center sm:px-8">
              <a
                href="/"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-brand-700/60 bg-brand-700 px-6 py-3 font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand-600"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to homepage
              </a>
            </div>
          </GeSection>
          <GePaymentsIreland />
          <GeFinalCta />
        </main>
        <GeFooter />
        <WhatsappFab />
      </div>
    )
  }

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <PremiumPageHero
          srTitle="Finish your trip brief"
          images={NAMED_HERO_IMAGE_SETS.transportCoastal}
          kicker="Step 2 of 2"
          titleLine1="Finish your trip brief"
          lead="We have your arrival snapshot. Add the pieces below — including whether you want prime morning tee times, twilight rounds, or a mix — and a planner will reply with Costa del Sol course options, transfers and extras matched to your hotel."
          primaryCta={{ label: 'WhatsApp us', href: whatsappHref, variant: 'gs-gold' }}
          secondaryCta={{ label: 'Jump to the form', href: '#continue-trip-form', variant: 'outline-gs-green' }}
          trustBadges={[
            { icon: CheckCircle2, label: 'Arrival details carried forward' },
            { icon: CheckCircle2, label: 'One Irish coordinator end-to-end' },
            { icon: CheckCircle2, label: 'Clear next steps in plain English' }
          ]}
          trustSectionTitle="What happens next"
          formScrollTarget="#continue-trip-form"
          formScrollLabel="Complete your trip brief"
        />

        <div className="bg-white px-5 py-6 sm:px-8 sm:py-7">
          <div className="mx-auto max-w-[1180px]">
            <GeTransfersInsuranceBanner variant="inline" />
          </div>
        </div>

        <GeSection background="white" innerClassName="py-14 sm:py-16">
          <div className="mx-auto max-w-2xl px-5 sm:px-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 font-ge text-sm font-semibold text-gs-green transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to GolfSol Ireland
            </a>

            <section id="continue-carried" className="mt-10 scroll-mt-28 rounded-2xl border border-ge-gray100 bg-ge-gray50/50 p-6 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-8">
              <h2 className="flex items-center gap-2 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">
                <CheckCircle2 className="h-5 w-5 text-brand-700" aria-hidden />
                Carried from last screen
              </h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Name</dt>
                  <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.fullName}</dd>
                </div>
                <div>
                  <dt className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Mobile</dt>
                  <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.mobile}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Arrival type</dt>
                  <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">
                    {snap.travelMode === 'flight' ? 'Inbound flight' : 'Already arrived — collection'}
                  </dd>
                </div>
                {snap.travelMode === 'flight' ? (
                  <>
                    <div>
                      <dt className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Flight</dt>
                      <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.flightNo}</dd>
                    </div>
                    <div>
                      <dt className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Landing (local)</dt>
                      <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.arrivalTime}</dd>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <dt className="font-ge text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Collection time</dt>
                    <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.collectionTime}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section
              aria-labelledby="continue-booking-routes"
              className="mt-8 scroll-mt-28 rounded-2xl border border-ge-gray100 bg-white p-6 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-8"
            >
              <h2 id="continue-booking-routes" className="font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">
                Costa del Sol golf — tee times & twilight
              </h2>
              <p className="mt-3 font-ge text-sm leading-relaxed text-ge-gray500">
                Hotel is sorted and your arrival snapshot is saved. If you want dedicated pages for golf-only planning, jump in here — you
                can still send the full brief below and we merge everything for the Irish team.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href="/services/tee-time-bookings"
                  className="flex min-h-[52px] flex-col justify-center rounded-xl border border-gs-green/25 bg-ge-gray50/80 px-4 py-3 font-ge text-sm font-bold text-gs-dark transition-colors hover:border-brand-700 hover:bg-white"
                >
                  <span className="text-gs-green">Tee time bookings only</span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">Prime &amp; full-day sheets</span>
                </a>
                <a
                  href="/services/twilight-golf"
                  className="flex min-h-[52px] flex-col justify-center rounded-xl border border-gs-green/25 bg-ge-gray50/80 px-4 py-3 font-ge text-sm font-bold text-gs-dark transition-colors hover:border-brand-700 hover:bg-white"
                >
                  <span className="text-gs-green">Twilight golf</span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">Golden-hour rounds</span>
                </a>
              </div>
            </section>

            <section id="continue-trip-form" className="mt-8 scroll-mt-28 rounded-2xl border border-gs-green/20 bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_70%)] p-6 shadow-[0_18px_45px_rgba(6,59,42,0.08)] sm:p-8">
              {submitStatus === 'success' ? (
                <div ref={confirmationRef} className="rounded-2xl border border-gs-green/25 bg-gs-green/5 p-5 text-center sm:p-7">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-gs-green" aria-hidden />
                  <p className="mt-4 font-ge text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green/90">Trip brief sent</p>
                  <p className="mx-auto mt-3 max-w-xl font-ge text-sm leading-relaxed text-ge-gray500">
                    Thanks. Your arrival details and full itinerary brief have been sent to GolfSol Ireland. We will reply by email, phone or
                    WhatsApp with the next step.
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-ge text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green/90">Next — full itinerary</p>
                  <h2 className="mt-2 font-ge text-[1.8rem] font-extrabold leading-tight text-gs-dark sm:text-[2.2rem]">
                    Finish the quote request
                  </h2>
                  <p className="mt-3 font-ge text-sm leading-relaxed text-ge-gray500">
                    These details submit with the arrival snapshot above, so the team gets one clean enquiry instead of disconnected messages.
                  </p>

                  <BookedDatesAvailabilityNotice
                    bookedDays={bookedDays}
                    className="mt-6"
                    tone="forest"
                    watchDates={[travelDateFrom, travelDateTo]}
                  />

                  <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleContinueSubmit} noValidate>
                    <label className="block sm:col-span-2">
                      <span className={continueLabelClass}>Email</span>
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        className={continueInputClass}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={continueLabelClass}>Trip timing</span>
                      <select
                        value={tripArrivalMode}
                        onChange={(event) => {
                          const next =
                            event.target.value === TRIP_ARRIVAL_MODE.alreadyAtAgp
                              ? TRIP_ARRIVAL_MODE.alreadyAtAgp
                              : TRIP_ARRIVAL_MODE.planned
                          setTripArrivalMode(next)
                          if (next === TRIP_ARRIVAL_MODE.alreadyAtAgp) {
                            const t = getLocalDateIso()
                            setTravelDateFrom(t)
                            setTravelDateTo(t)
                          }
                        }}
                        className={continueInputClass}
                      >
                        <option value={TRIP_ARRIVAL_MODE.planned}>I have travel dates (arrival and departure)</option>
                        <option value={TRIP_ARRIVAL_MODE.alreadyAtAgp}>Already at Málaga (AGP) — need transfers now</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Travel start date</span>
                      <input
                        value={travelDateFrom}
                        onChange={(event) => setTravelDateFrom(event.target.value)}
                        type="date"
                        min={
                          tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
                            ? continueAgpToday
                            : tripArrivalMode === TRIP_ARRIVAL_MODE.planned
                              ? continuePlannedStartMin
                              : undefined
                        }
                        max={tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? continueAgpToday : undefined}
                        className={continueInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Travel end date</span>
                      <input
                        value={travelDateTo}
                        onChange={(event) => setTravelDateTo(event.target.value)}
                        type="date"
                        min={
                          tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp
                            ? continueAgpToday
                            : tripArrivalMode === TRIP_ARRIVAL_MODE.planned
                              ? continuePlannedEndMin
                              : undefined
                        }
                        max={tripArrivalMode === TRIP_ARRIVAL_MODE.alreadyAtAgp ? continueAgpToday : undefined}
                        className={continueInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Group size</span>
                      <select value={groupSize} onChange={(event) => setGroupSize(event.target.value)} required className={continueInputClass}>
                        <option value="">Select group size</option>
                        {golferGroupSizeSelectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Hotel / accommodation</span>
                      <select
                        value={hotelStatus}
                        onChange={(event) => setHotelStatus(event.target.value)}
                        required
                        className={continueInputClass}
                      >
                        <option value="">Select hotel status</option>
                        <option value="Hotel already booked">Hotel already booked</option>
                        <option value="Need hotel options">Need hotel options</option>
                        <option value="Villa / apartment booked">Villa / apartment booked</option>
                        <option value="Need advice">Need advice</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Preferred rounds</span>
                      <select value={roundCount} onChange={(event) => setRoundCount(event.target.value)} required className={continueInputClass}>
                        <option value="">Select rounds</option>
                        <option value="1 round">1 round</option>
                        <option value="2 rounds">2 rounds</option>
                        <option value="3 rounds">3 rounds</option>
                        <option value="4+ rounds">4+ rounds</option>
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={continueLabelClass}>Tee times — prime, twilight, or mix</span>
                      <select
                        value={roundTiming}
                        onChange={(event) => setRoundTiming(event.target.value)}
                        required
                        className={continueInputClass}
                      >
                        <option value="">Select preference</option>
                        <option value="Prime morning (≈08:00–10:30)">Prime morning (≈08:00–10:30)</option>
                        <option value="Twilight / late afternoon">Twilight / late afternoon</option>
                        <option value="Mix of prime morning and twilight">Mix of prime morning and twilight</option>
                        <option value="Not sure — recommend for our group">Not sure — recommend for our group</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Best time to call</span>
                      <input
                        value={bestTimeToCall}
                        onChange={(event) => setBestTimeToCall(event.target.value)}
                        placeholder="Any time"
                        className={continueInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Course wishlist</span>
                      <input
                        value={courseWishlist}
                        onChange={(event) => setCourseWishlist(event.target.value)}
                        placeholder="Optional: La Cala, Mijas, Santana..."
                        className={continueInputClass}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className={continueLabelClass}>Notes</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={5}
                        placeholder="Tell us anything useful: handicaps, rooming, luggage, preferred resort, transfer notes or budget."
                        className="w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-sm leading-7 text-gs-dark shadow-sm outline-none ring-brand-700/40 transition-shadow placeholder:text-ge-gray300 focus:border-brand-700 focus:ring-2"
                      />
                    </label>

                    {submitStatus === 'error' && submitError ? (
                      <div className="rounded-lg border border-brand-700/50 bg-orange-50 px-3 py-2.5 font-ge text-sm leading-6 text-gs-dark sm:col-span-2">
                        <p>{submitError}</p>
                        {submitErrorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                          <p className="mt-2 font-semibold text-gs-green">
                            <a className="underline underline-offset-2" href="/dashboard/login">
                              Sign in to your trip desk
                            </a>
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <GeTermsAcceptanceField
                      checked={termsAccepted}
                      onChange={setTermsAccepted}
                      id="terms-continue-trip"
                      className="sm:col-span-2"
                    />

                    <button
                      type="submit"
                      disabled={submitStatus === 'submitting' || !termsAccepted}
                      className="group relative min-h-[52px] overflow-hidden rounded-full bg-gradient-to-r from-brand-800 via-[#136047] to-brand-600 px-6 font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-white shadow-gs-green transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
                    >
                      <span className="relative z-[1] inline-flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" aria-hidden />
                        {submitStatus === 'submitting' ? 'Sending trip brief...' : 'Send full trip brief'}
                      </span>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-white/25 transition-transform duration-500 group-hover:translate-x-0"
                      />
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        </GeSection>

        <GePaymentsIreland />

        <GeFinalCta />
      </main>

      <GeFooter />

      <WhatsappFab />
    </div>
  )
}
