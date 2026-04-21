import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY } from './golf-experience/components/already-booked-flight-panel'
import { usePageSeo } from '../lib/seo'
import { contactInfo } from './golf-experience/data/copy'
import { GeButton } from './golf-experience/components/ge-button'
import { cx } from '../lib/utils'

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

export function ContinueTripPage() {
  const [snap, setSnap] = useState<SnapState>(undefined)
  const [email, setEmail] = useState('')
  const [tripDates, setTripDates] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [courseWishList, setCourseWishList] = useState('')
  const [transferNotes, setTransferNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  usePageSeo({
    title: 'Continue your golf trip brief | GolfSol Ireland',
    description:
      'Finish your Costa del Sol golf trip brief with hotel, dates, course preferences, and transfer notes so GolfSol Ireland can tailor the next step.',
    path: '/continue-trip',
    image: '/images/transport-moment-arrivals.jpg'
  })

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

  const carriedArrivalLine =
    snap?.travelMode === 'flight'
      ? `Arrival snapshot: Flight ${snap.flightNo} landing ${snap.arrivalTime}`
      : snap?.travelMode === 'arrived'
        ? `Arrival snapshot: Already arrived, collection time ${snap.collectionTime}`
        : ''

  const enquirySummary = useMemo(
    () =>
      [
        'CONTINUE TRIP PAGE — hotel already booked follow-up',
        carriedArrivalLine || null,
        tripDates.trim() ? `Trip dates: ${tripDates.trim()}` : 'Trip dates: not supplied yet',
        groupSize.trim() ? `Group size: ${groupSize.trim()}` : 'Group size: not supplied yet',
        hotelName.trim() ? `Hotel already booked: ${hotelName.trim()}` : 'Hotel already booked: not supplied yet',
        courseWishList.trim() ? `Course wish list: ${courseWishList.trim()}` : null,
        transferNotes.trim() ? `Transfer notes: ${transferNotes.trim()}` : null
      ]
        .filter(Boolean)
        .join('\n'),
    [carriedArrivalLine, courseWishList, groupSize, hotelName, transferNotes, tripDates]
  )

  if (snap === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ge-gray50 font-ge text-ge-gray500">
        Loading…
      </div>
    )
  }

  if (!snap) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gs-dark to-gs-green px-5 py-16 text-white">
        <div className="mx-auto max-w-lg rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-md">
          <p className="font-ge text-lg font-bold">No flight details found</p>
          <p className="mt-3 font-ge text-sm leading-relaxed text-white/80">
            Start from the homepage — use the &ldquo;Hotel already booked?&rdquo; card under{' '}
            <strong className="text-gs-gold-light">Design Your Costa del Sol Golf Trip</strong>, then submit the quick
            form.
          </p>
          <a
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-gs-gold/60 bg-gs-gold px-5 py-2.5 font-ge text-sm font-extrabold uppercase tracking-[0.14em] text-gs-dark transition-colors hover:bg-gs-gold-light"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to homepage
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)

    if (!email.trim() || !tripDates.trim() || !groupSize.trim() || !hotelName.trim()) {
      setErrorMessage('Please add your email, trip dates, group size, and hotel name so we can tailor the next step.')
      setStatus('error')
      return
    }

    const normalisedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: snap.fullName.trim(),
          email: normalisedEmail,
          phoneWhatsApp: snap.mobile.trim(),
          interest: enquirySummary,
          bestTimeToCall: snap.travelMode === 'flight' ? snap.arrivalTime : snap.collectionTime
        })
      })

      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data.message ?? 'Could not send your trip brief right now.')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not send your trip brief right now.')
    }
  }

  return (
    <div className="min-h-screen bg-ge-gray50 pb-16 pt-8 font-ge text-gs-dark sm:pt-12">
      <div className="mx-auto max-w-5xl px-5">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gs-green transition-colors hover:text-gs-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to GolfSol Ireland
        </a>

        <header className="mt-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ge-orange">Step 2 of 2</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-gs-dark sm:text-4xl">
            Finish your trip brief
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ge-gray500">
            We have your arrival snapshot. Add the pieces below (or jump straight to a full quote) — a planner will
            reply with tee times, transfers and extras matched to your hotel.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-2xl border border-ge-gray200 bg-white p-6 shadow-soft sm:p-8">
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
                    <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Landing (local)</dt>
                    <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.arrivalTime}</dd>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <dt className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Collection time</dt>
                  <dd className="mt-1 text-base font-semibold text-gs-dark">{snap.collectionTime}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8 rounded-2xl border border-dashed border-gs-green/35 bg-ge-gray50 p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green/80">What to add now</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ge-gray500">
                {[
                  'Trip dates and number of golfers',
                  'The hotel or villa you already booked',
                  'Courses you want to play or areas you prefer',
                  'Extra transfer notes for airport, hotel, or golf days'
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-ge-gray200 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green/80">Step 2 — finish the brief</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-gs-dark sm:text-3xl">
              Add the hotel, dates, golf wishlist, and transfer notes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ge-gray500">
              This form is for travellers who already have the stay booked and want GolfSol Ireland to build the golf and transport around it.
            </p>

            {status === 'success' ? (
              <div className="mt-6 rounded-2xl border border-gs-green/25 bg-gs-green/5 p-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green">Trip brief sent</p>
                <p className="mt-2 text-sm leading-relaxed text-ge-gray500">
                  Thanks — we now have your hotel-booked brief and will reply with a tailored next step.
                </p>
                <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-4">
                  Email us directly
                </GeButton>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">Email</span>
                  <input
                    className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">Trip dates</span>
                  <input
                    className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    value={tripDates}
                    onChange={(event) => setTripDates(event.target.value)}
                    placeholder="e.g. 15–19 September 2026"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">Group size</span>
                  <input
                    className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    value={groupSize}
                    onChange={(event) => setGroupSize(event.target.value)}
                    placeholder="e.g. 8 golfers"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">Booked hotel or villa</span>
                  <input
                    className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    value={hotelName}
                    onChange={(event) => setHotelName(event.target.value)}
                    placeholder="e.g. Hotel Angela, Fuengirola"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">Course wish list</span>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    value={courseWishList}
                    onChange={(event) => setCourseWishList(event.target.value)}
                    placeholder="Tell us the courses, areas, or style of golf you want."
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">Transfer notes</span>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                    value={transferNotes}
                    onChange={(event) => setTransferNotes(event.target.value)}
                    placeholder="Airport arrival, golf-day movements, or anything else we should know."
                  />
                </label>

                {status === 'error' && errorMessage ? (
                  <p
                    className={cx('rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2 text-[1rem] text-gs-dark')}
                    role="alert"
                  >
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
    </div>
  )
}
