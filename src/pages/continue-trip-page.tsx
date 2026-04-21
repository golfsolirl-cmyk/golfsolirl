import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY } from './golf-experience/components/already-booked-flight-panel'
import { PublicSiteShell } from '../components/public/public-site-shell'
import { usePageMetadata } from '../lib/page-metadata'
import { GeButton } from './golf-experience/components/ge-button'
import { contactInfo } from './golf-experience/data/copy'

type TravelMode = 'flight' | 'arrived'

type FlightSnap = {
  fullName: string
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

const labelClass =
  'mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500'

const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

export function ContinueTripPage() {
  const [snap, setSnap] = useState<SnapState>(undefined)
  const [email, setEmail] = useState('')
  const [tripDates, setTripDates] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [handicapRange, setHandicapRange] = useState('')
  const [courseWishList, setCourseWishList] = useState('')
  const [transferNotes, setTransferNotes] = useState('')
  const [bestTimeToCall, setBestTimeToCall] = useState('Any time')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY)
      if (!raw) {
        setSnap(null)
        return
      }
      const parsed = parseFlightSnap(raw)
      setSnap(parsed)
    } catch {
      setSnap(null)
    }
  }, [])

  usePageMetadata({
    title: 'Finish your trip brief',
    description:
      'Complete your Costa del Sol golf trip brief with hotel details, group size, courses, and transfer notes after sharing your arrival snapshot.',
    canonicalPath: '/continue-trip',
    keywords: ['GolfSol Ireland continue trip', 'Costa del Sol golf brief', 'arrival snapshot follow-up'],
    noindex: true
  })

  const arrivalSummary = useMemo(() => {
    if (!snap) {
      return ''
    }

    const arrivalLine =
      snap.travelMode === 'flight'
        ? `Flight ${snap.flightNo} landing at ${snap.arrivalTime}`
        : `Already arrived, collection at ${snap.collectionTime}`

    return `${arrivalLine} · Contact ${snap.mobile}`
  }, [snap])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)

    if (!snap) {
      setStatus('error')
      setErrorMessage('Your arrival snapshot is missing. Please go back and re-enter it.')
      return
    }

    if (!email.trim() || !tripDates.trim() || !groupSize.trim() || !hotelName.trim() || !courseWishList.trim()) {
      setStatus('error')
      setErrorMessage('Please add your email, trip dates, group size, hotel, and preferred courses.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address so we can reply with your itinerary options.')
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: snap.fullName,
          email: email.trim().toLowerCase(),
          phoneWhatsApp: snap.mobile,
          bestTimeToCall,
          interest: [
            'Continue trip brief',
            `Arrival summary: ${arrivalSummary}`,
            `Trip dates: ${tripDates.trim()}`,
            `Group size: ${groupSize.trim()}`,
            `Hotel already booked: ${hotelName.trim()}`,
            handicapRange.trim() ? `Handicap spread: ${handicapRange.trim()}` : null,
            `Course wish-list: ${courseWishList.trim()}`,
            transferNotes.trim() ? `Transfer notes: ${transferNotes.trim()}` : null
          ]
            .filter(Boolean)
            .join('\n')
        })
      })

      const result = (await response.json().catch(() => ({}))) as { message?: string }

      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to send your trip brief right now.')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send your trip brief right now.')
    }
  }

  if (snap === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ge-gray50 font-ge text-ge-gray500">
        Loading…
      </div>
    )
  }

  if (!snap) {
    return (
      <PublicSiteShell withFooter={false} withWhatsApp={false} withTopSpacer>
        <main id="main" className="min-h-[70vh] bg-[linear-gradient(180deg,#F4F7F5_0%,#FFFFFF_100%)] px-5 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-gs-dark/10 bg-white p-8 shadow-[0_24px_60px_rgba(6,59,42,0.12)]">
            <p className="font-ge text-lg font-bold text-gs-dark">No arrival snapshot found</p>
            <p className="mt-3 font-ge text-sm leading-relaxed text-ge-gray500">
              Start from the homepage — use the &ldquo;Hotel already booked?&rdquo; card under{' '}
              <strong className="text-gs-green">Design Your Costa del Sol Golf Trip</strong>, then submit the quick
              arrival form.
            </p>
            <a
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-gs-green px-5 py-2.5 font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-gs-green transition-colors hover:bg-gs-green hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to homepage
            </a>
          </div>
        </main>
      </PublicSiteShell>
    )
  }

  return (
    <PublicSiteShell withFooter={false} withTopSpacer>
      <main
        id="main"
        className="min-h-[70vh] bg-[linear-gradient(180deg,#F4F7F5_0%,#FFFFFF_100%)] pb-16 pt-8 font-ge text-gs-dark sm:pt-12"
      >
        <div className="mx-auto max-w-5xl px-5">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gs-green transition-colors hover:text-gs-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to GolfSol Ireland
          </a>

          <header className="mt-8 max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ge-orange">Step 2 of 2</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-gs-dark sm:text-4xl">
              Finish your trip brief
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ge-gray500">
              We already have your arrival snapshot. Add your hotel, dates, course priorities, and transfer notes here
              so we can reply with a joined-up Costa del Sol plan rather than a generic quote.
            </p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-2xl border border-ge-gray200 bg-white p-6 shadow-[0_18px_45px_rgba(6,59,42,0.08)] sm:p-8">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">
                <CheckCircle2 className="h-5 w-5 text-gs-gold" aria-hidden />
                Carried from last screen
              </h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Name</dt>
                  <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.fullName}</dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Mobile</dt>
                  <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.mobile}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Arrival type</dt>
                  <dd className="mt-1 text-base font-semibold text-gs-dark">
                    {snap.travelMode === 'flight' ? 'Inbound flight' : 'Already arrived — collection'}
                  </dd>
                </div>
                {snap.travelMode === 'flight' ? (
                  <>
                    <div>
                      <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Flight</dt>
                      <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.flightNo}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">
                        Landing (local)
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.arrivalTime}</dd>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">
                      Collection time
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.collectionTime}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-8 rounded-2xl border border-gs-dark/10 bg-ge-gray50 p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-ge-orange">What to add now</p>
                <ul className="mt-4 space-y-3">
                  {[
                    'Hotel or resort already booked',
                    'Travel dates and group size',
                    'Course wish-list or routing preferences',
                    'Transfer details, baggage, or special requests'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gs-dark">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-gs-dark/10 bg-white p-6 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-8">
              <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-orange">
                Trip brief
              </p>
              <h2 className="mt-3 text-[1.9rem] font-extrabold leading-tight text-gs-green sm:text-[2.2rem]">
                Tell us how the week should run
              </h2>
              <p className="mt-3 text-base leading-7 text-ge-gray500">
                This form is tailored for golfers who already have a hotel booked. We use it to line up tee times,
                transfers, and the wider trip around that base.
              </p>

              {status === 'success' ? (
                <div className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
                  <p className="font-ge text-[0.82rem] font-bold uppercase tracking-[0.14em] text-gs-green">
                    Trip brief sent
                  </p>
                  <p className="mt-2 font-ge text-[1rem] leading-7 text-gs-dark">
                    Thanks — we now have your arrival and trip-planning details and will reply shortly from Ireland.
                  </p>
                  <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-4">
                    Email us directly
                  </GeButton>
                </div>
              ) : (
                <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
                  <label className="block">
                    <span className={labelClass}>Email address</span>
                    <input
                      className={inputClass}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Trip dates</span>
                    <input
                      className={inputClass}
                      value={tripDates}
                      onChange={(event) => setTripDates(event.target.value)}
                      placeholder="e.g. 15–19 Sept 2026"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Group size</span>
                    <input
                      className={inputClass}
                      value={groupSize}
                      onChange={(event) => setGroupSize(event.target.value)}
                      placeholder="e.g. 8 golfers"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Booked hotel or resort</span>
                    <input
                      className={inputClass}
                      value={hotelName}
                      onChange={(event) => setHotelName(event.target.value)}
                      placeholder="e.g. Hotel Angela, Fuengirola"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Handicap spread (optional)</span>
                    <input
                      className={inputClass}
                      value={handicapRange}
                      onChange={(event) => setHandicapRange(event.target.value)}
                      placeholder="e.g. 8 to 24"
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Course wish-list</span>
                    <textarea
                      className="min-h-[120px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                      value={courseWishList}
                      onChange={(event) => setCourseWishList(event.target.value)}
                      placeholder="Tell us which courses, areas, or style of golf you want across the trip."
                      required
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Transfer notes (optional)</span>
                    <textarea
                      className="min-h-[110px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                      value={transferNotes}
                      onChange={(event) => setTransferNotes(event.target.value)}
                      placeholder="Add golf bag counts, dinner transfers, child seats, or anything else we should plan around."
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Preferred reply window</span>
                    <select
                      className={inputClass}
                      value={bestTimeToCall}
                      onChange={(event) => setBestTimeToCall(event.target.value)}
                    >
                      <option>Any time</option>
                      <option>Morning call</option>
                      <option>Afternoon call</option>
                      <option>Evening call</option>
                      <option>Email only</option>
                      <option>WhatsApp reply</option>
                    </select>
                  </label>

                  {status === 'error' && errorMessage ? (
                    <p className="rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2 font-ge text-[1rem] text-gs-dark">
                      {errorMessage}
                    </p>
                  ) : null}

                  <GeButton className="w-full" type="submit" variant="gs-gold" size="lg" disabled={status === 'submitting'}>
                    <Send className="h-4 w-4" aria-hidden />
                    {status === 'submitting' ? 'Sending...' : 'Send trip brief'}
                  </GeButton>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
    </PublicSiteShell>
  )
}
