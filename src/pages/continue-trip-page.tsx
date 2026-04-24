import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
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
    document.title = 'Continue your trip | GolfSol Ireland'
  }, [])

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
          subtitle="We have your arrival snapshot. Add the pieces below (or jump straight to a full quote) — a planner will reply with tee times, transfers and extras matched to your hotel."
          image="/images/transport-hero-coastal-drive.jpg"
          imageAlt="Black Mercedes V-Class on the AP-7 coastal motorway — Golf Sol Ireland transfer planning."
          primaryCta={{ label: 'Open full quote form', href: '/#enquire' }}
          nextSectionId="#continue-carried"
          mobileHighlights={[
            { label: 'Arrival details carried forward' },
            { label: 'One Irish coordinator end-to-end' },
            { label: 'Clear next steps in plain English' }
          ]}
        />

        <GePaymentsIreland />

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

            <section className="mt-8 rounded-2xl border border-dashed border-gs-green/35 bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_70%)] p-6 sm:p-8">
              <p className="font-ge text-sm font-extrabold uppercase tracking-[0.18em] text-gs-green/90">Next — full itinerary</p>
              <p className="mt-2 font-ge text-sm leading-relaxed text-ge-gray500">
                This section is ready for your longer form: hotel confirmation, dates, party size, handicap spread, course wish-list and transfer
                notes. Wire it to your CRM or enquiry API when you are ready.
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
        </GeSection>

        <GeFinalCta />
      </main>

      <GeFooter />

      <WhatsappFab />
    </div>
  )
}
