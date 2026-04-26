import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY } from './golf-experience/components/already-booked-flight-panel'
import { PageIdentityBar } from '../components/page-identity-bar'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { GePaymentsIreland } from './golf-experience/sections/payments-ireland'
import { GeFinalCta } from './golf-experience/sections/final-cta'
import { GeServiceStyleHero } from './golf-experience/sections/ge-service-style-hero'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'
import { GeTransfersInsuranceBanner } from './golf-experience/components/ge-transfers-insurance-banner'
import { GeSection } from './golf-experience/components/ge-section'
import { contactInfo } from './golf-experience/data/copy'
import { formatTravelDateInput } from '../lib/format-travel-date'

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
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow placeholder:text-ge-gray300 focus:border-gs-gold focus:ring-2'

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
  const [travelDates, setTravelDates] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [hotelStatus, setHotelStatus] = useState('')
  const [roundCount, setRoundCount] = useState('')
  const [courseWishlist, setCourseWishlist] = useState('')
  const [notes, setNotes] = useState('')
  const [bestTimeToCall, setBestTimeToCall] = useState('Any time')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)

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
    const dates = travelDates.trim()
    const size = groupSize.trim()
    const hotel = hotelStatus.trim()
    const rounds = roundCount.trim()

    if (!mail || !dates || !size || !hotel || !rounds) {
      setSubmitStatus('error')
      setSubmitError('Please complete email, dates, group size, hotel status and number of rounds.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setSubmitStatus('error')
      setSubmitError('Please enter a valid email address.')
      return
    }

    const interest = [
      'CONTINUE TRIP — completed itinerary brief',
      ...formatSnapForInterest(snap),
      `Email: ${mail}`,
      `Travel dates: ${dates}`,
      `Group size: ${size}`,
      `Hotel / accommodation status: ${hotel}`,
      `Preferred number of rounds: ${rounds}`,
      courseWishlist.trim() ? `Course wishlist: ${courseWishlist.trim()}` : null,
      notes.trim() ? `Extra notes: ${notes.trim()}` : null
    ].filter(Boolean)

    setSubmitStatus('submitting')
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: snap.fullName,
          email: mail,
          phoneWhatsApp: snap.mobile,
          interest: interest.join('\n'),
          bestTimeToCall: bestTimeToCall.trim() || 'Any time'
        })
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data.message ?? 'Could not send your trip brief right now.')
      }

      setSubmitStatus('success')
      try {
        sessionStorage.removeItem(GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY)
      } catch {
        // Ignore browser storage failures after a successful API submission.
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitError(error instanceof Error ? error.message : 'Could not send your trip brief right now.')
    }
  }

  if (snap === undefined) {
    return (
      <div className="ge-page min-h-screen overflow-x-hidden bg-white">
        <GeNavbar />
        <PageIdentityBar
          compact
          label="Continue your trip"
          description="Pick up your saved arrival details and move into the next planning step."
          offsetHeader
        />
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
        >
          Skip to content
        </a>
        <GeNavbar />
        <main id="main">
          <PageIdentityBar
            compact
            label="Continue your trip"
            description="No saved arrival details yet, so the fastest route is back through the homepage trip planner."
            offsetHeader
          />
          <GeServiceStyleHero
            srTitle="Continue your trip"
            eyebrow="Trip planner"
            title="No flight details found yet"
            subtitle="Start from the homepage — use the Hotel already booked card under Design Your Costa del Sol Golf Trip, then submit the quick form."
            image="/images/transport-moment-arrivals.jpg"
            imageAlt="Málaga airport arrivals — start your trip brief from the homepage."
            primaryCta={{ label: 'Back to homepage', href: '/' }}
            showPhoneCta={false}
            nextSectionId="#continue-help"
            mobileHighlights={[
              { label: 'Save your flight or arrival time first' },
              { label: 'We pre-fill the next step for you' },
              { label: 'Irish team replies fast' }
            ]}
          />
          <GeSection id="continue-help" background="white" innerClassName="py-14 sm:py-16">
            <div className="mx-auto max-w-lg px-5 text-center sm:px-8">
              <a
                href="/"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-gs-gold/60 bg-gs-gold px-6 py-3 font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-gs-dark transition-colors hover:bg-gs-gold-light"
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <PageIdentityBar
          compact
          label="Continue your trip"
          description="Your saved arrival snapshot is ready, so you can move straight into the next planning step."
          offsetHeader
        />
        <GeServiceStyleHero
          srTitle="Finish your trip brief"
          eyebrow="Step 2 of 2"
          title="Finish your trip brief"
          subtitle="We have your arrival snapshot. Add the pieces below (or WhatsApp your enquiry) — a planner will reply with tee times, transfers and extras matched to your hotel."
          image="/images/transport-hero-coastal-drive.jpg"
          imageAlt="Black Mercedes V-Class on the AP-7 coastal motorway — Golf Sol Ireland transfer planning."
          primaryCta={{ label: 'WhatsApp us', href: whatsappHref }}
          showNavbarSpacer={false}
          nextSectionId="#continue-carried"
          mobileHighlights={[
            { label: 'Arrival details carried forward' },
            { label: 'One Irish coordinator end-to-end' },
            { label: 'Clear next steps in plain English' }
          ]}
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
              className="inline-flex items-center gap-2 font-ge text-sm font-semibold text-gs-green transition-colors hover:text-gs-gold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to GolfSol Ireland
            </a>

            <section id="continue-carried" className="mt-10 scroll-mt-28 rounded-2xl border border-ge-gray100 bg-ge-gray50/50 p-6 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-8">
              <h2 className="flex items-center gap-2 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">
                <CheckCircle2 className="h-5 w-5 text-gs-gold" aria-hidden />
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

                  <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleContinueSubmit} noValidate>
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
                    <label className="block">
                      <span className={continueLabelClass}>Travel dates</span>
                      <input
                        value={travelDates}
                        onChange={(event) => setTravelDates(formatTravelDateInput(event.target.value))}
                        required
                        placeholder="e.g. 15-19 Sept 2026"
                        className={continueInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={continueLabelClass}>Group size</span>
                      <select value={groupSize} onChange={(event) => setGroupSize(event.target.value)} required className={continueInputClass}>
                        <option value="">Select group size</option>
                        <option value="2 golfers">2 golfers</option>
                        <option value="4 golfers">4 golfers</option>
                        <option value="8 golfers">8 golfers</option>
                        <option value="12+ golfers">12+ golfers</option>
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
                        className="w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-sm leading-7 text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow placeholder:text-ge-gray300 focus:border-gs-gold focus:ring-2"
                      />
                    </label>

                    {submitStatus === 'error' && submitError ? (
                      <p className="rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2.5 font-ge text-sm leading-6 text-gs-dark sm:col-span-2">
                        {submitError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={submitStatus === 'submitting'}
                      className="group relative min-h-[52px] overflow-hidden rounded-full bg-gradient-to-r from-gs-gold via-[#f4b41a] to-gs-gold-light px-6 font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-gs-dark shadow-gs-gold transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
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
