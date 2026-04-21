import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY } from './golf-experience/components/already-booked-flight-panel'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'
import { applySeo } from '../lib/seo'

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

  useEffect(() => {
    applySeo({
      title: 'Continue Trip Planner | GolfSol Ireland',
      description:
        'Continue your Costa del Sol golf trip planning with your saved arrival details and complete the remaining itinerary brief.',
      path: '/continue-trip',
      imagePath: '/images/hero-malaga-transfers-1600.jpg',
      noindex: true
    })
  }, [])

  if (snap === undefined) {
    return (
      <div className="ge-page min-h-screen overflow-x-hidden bg-white">
        <GeNavbar />
        <div className="flex min-h-screen items-center justify-center bg-ge-gray50 font-ge text-ge-gray500">Loading…</div>
        <GeFooter />
        <WhatsappFab />
      </div>
    )
  }

  if (!snap) {
    return (
      <div className="ge-page min-h-screen overflow-x-hidden bg-white">
        <GeNavbar />
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
        <GeFooter />
        <WhatsappFab />
      </div>
    )
  }

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <GeNavbar />
      <div className="min-h-screen bg-ge-gray50 pb-16 pt-36 font-ge text-gs-dark sm:pt-40">
        <div className="mx-auto max-w-2xl px-5">
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

          <section className="mt-10 rounded-2xl border border-ge-gray200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">
              <CheckCircle2 className="h-5 w-5 text-gs-gold" aria-hidden />
              Carried from last screen
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
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
          </section>

          <section className="mt-8 rounded-2xl border border-dashed border-gs-green/35 bg-white/80 p-6 sm:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green/80">Next — full itinerary</p>
            <p className="mt-2 text-sm leading-relaxed text-ge-gray500">
              This section is ready for your longer form: hotel confirmation, dates, party size, handicap spread, course
              wish-list and transfer notes. Wire it to your CRM or enquiry API when you are ready.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="/#enquire"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-br from-gs-gold to-[#f4b41a] px-6 font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-gs-dark shadow-gs-gold transition-transform hover:scale-[1.02]"
              >
                Open full quote form
              </a>
              <button
                type="button"
                disabled
                className="inline-flex min-h-[48px] cursor-not-allowed items-center justify-center rounded-full border-2 border-ge-gray200 px-6 font-ge text-sm font-bold uppercase tracking-[0.1em] text-ge-gray300"
              >
                Save draft (soon)
              </button>
            </div>
          </section>
        </div>
      </div>
      <GeFooter />
      <WhatsappFab />
    </div>
  )
}
