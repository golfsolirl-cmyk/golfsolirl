import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, ChevronRight, Mail, MapPinned, PlaneLanding, Send, Users } from 'lucide-react'
import { usePageSeo } from '../lib/use-page-seo'
import { GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY } from './golf-experience/components/already-booked-flight-panel'
import { GeButton } from './golf-experience/components/ge-button'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'
import { contactInfo } from './golf-experience/data/copy'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

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
  const [hotelBase, setHotelBase] = useState('')
  const [tripDates, setTripDates] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [preferredCourses, setPreferredCourses] = useState('')
  const [transferPlan, setTransferPlan] = useState('Airport and golf-day transfers')
  const [clubRental, setClubRental] = useState('No club rental needed')
  const [tripNotes, setTripNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  usePageSeo({
    title: 'Continue your trip brief | Golf Sol Ireland',
    description:
      'Complete the second step of your Golf Sol Ireland trip brief with hotel base, dates, group size, preferred golf, and transfer needs.',
    canonicalPath: '/continue-trip',
    noIndex: true,
    ogImage: '/images/transport-moment-arrivals.jpg'
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)

    if (!snap) {
      setStatus('error')
      setErrorMessage('We could not find your arrival details. Please restart from the homepage.')
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanHotelBase = hotelBase.trim()
    const cleanTripDates = tripDates.trim()
    const cleanGroupSize = groupSize.trim()

    if (!cleanEmail || !cleanHotelBase || !cleanTripDates || !cleanGroupSize) {
      setStatus('error')
      setErrorMessage('Please add your email, hotel base, trip dates, and group size.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    const arrivalSummary =
      snap.travelMode === 'flight'
        ? `Arrival snapshot: flight ${snap.flightNo} landing ${snap.arrivalTime}`
        : `Arrival snapshot: already on the Sol, collection at ${snap.collectionTime}`

    const interestLines = [
      'CONTINUE TRIP — full trip brief',
      arrivalSummary,
      `Hotel / pickup base: ${cleanHotelBase}`,
      `Trip dates: ${cleanTripDates}`,
      `Group size: ${cleanGroupSize}`,
      `Transfer plan: ${transferPlan}`,
      `Club rental: ${clubRental}`,
      preferredCourses.trim() ? `Preferred courses / areas: ${preferredCourses.trim()}` : null,
      tripNotes.trim() ? `Notes: ${tripNotes.trim()}` : null
    ].filter(Boolean)

    setStatus('submitting')
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: snap.fullName,
          email: cleanEmail,
          phoneWhatsApp: snap.mobile,
          interest: interestLines.join('\n'),
          bestTimeToCall: 'Any time'
        })
      })

      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data.message ?? 'Could not send your full trip brief right now.')
      }

      setStatus('success')
      setHotelBase('')
      setTripDates('')
      setGroupSize('')
      setPreferredCourses('')
      setTransferPlan('Airport and golf-day transfers')
      setClubRental('No club rental needed')
      setTripNotes('')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not send your full trip brief right now.')
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
      <div className="ge-page min-h-screen overflow-x-hidden bg-white">
        <GeNavbar />
        <main>
          <section className="relative isolate overflow-hidden bg-gs-dark text-white">
            <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
            <div className="mx-auto max-w-[980px] px-5 pb-20 pt-12 sm:px-8">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-md">
                <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-gs-gold-light">Continue your trip</p>
                <h1 className="mt-4 font-ge text-[2rem] font-extrabold leading-tight text-white sm:text-[2.45rem]">
                  No arrival snapshot found
                </h1>
                <p className="mt-4 font-ge text-base leading-7 text-white/84">
                  Start from the homepage and use the <strong className="text-gs-gold-light">Hotel already booked?</strong>{' '}
                  card in the trip planner first. We carry those details here so your second-step form stays short and relevant.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <GeButton href="/" variant="gs-gold" size="lg">
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to homepage
                  </GeButton>
                  <GeButton href="/contact" variant="outline-gs-white" size="lg">
                    Get a quote directly
                  </GeButton>
                </div>
              </div>
            </div>
          </section>
        </main>
        <GeFooter />
        <WhatsappFab />
      </div>
    )
  }

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <GeNavbar />
      <main>
        <section className="relative isolate overflow-hidden bg-gs-dark text-white">
          <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
          <div className="relative">
            <img
              src="/images/transport-moment-arrivals.jpg"
              alt="GolfSol Ireland arrival planning support for golfers already travelling to the Costa del Sol."
              className="h-[40vh] min-h-[280px] w-full object-cover object-center md:h-[48vh] md:min-h-[380px]"
              width={2200}
              height={1100}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gs-dark/88 via-gs-dark/66 to-gs-dark/45" />
            <div className="absolute inset-0 z-10 flex items-end pb-16 sm:pb-20">
              <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="max-w-3xl"
                >
                  <p className="font-ge text-[0.8rem] font-bold uppercase tracking-[0.24em] text-gs-gold-light">
                    Step 2 of 2
                  </p>
                  <h1 className="mt-4 font-ge text-[2.2rem] font-extrabold leading-[1.03] text-white sm:text-[2.8rem] md:text-[3.2rem]">
                    Finish your Costa del Sol trip brief
                  </h1>
                  <p className="mt-4 max-w-2xl font-ge text-[1.02rem] leading-7 text-white/90 sm:text-[1.1rem] sm:leading-8">
                    We have your arrival snapshot already. Add the hotel base, dates, group size, and golf priorities here
                    and we come back with a cleaner, more joined-up plan.
                  </p>
                </motion.div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-20">
              <div
                aria-hidden
                className="h-[3px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.5) 12%, #FFC72C 28%, #FFE27A 50%, #FFC72C 72%, rgba(184,137,0,0.5) 88%, transparent 100%)'
                }}
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-ge-gray100 bg-ge-gray50 p-6 sm:p-7">
                <h2 className="flex items-center gap-2 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-gs-green">
                  <CheckCircle2 className="h-5 w-5 text-gs-gold" aria-hidden />
                  Carried from the last screen
                </h2>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Name</dt>
                    <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.fullName}</dd>
                  </div>
                  <div>
                    <dt className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Mobile</dt>
                    <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.mobile}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Arrival type</dt>
                    <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">
                      {snap.travelMode === 'flight' ? 'Inbound flight' : 'Already arrived on the Sol'}
                    </dd>
                  </div>
                  {snap.travelMode === 'flight' ? (
                    <>
                      <div>
                        <dt className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Flight</dt>
                        <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.flightNo}</dd>
                      </div>
                      <div>
                        <dt className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Landing (local)</dt>
                        <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.arrivalTime}</dd>
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2">
                      <dt className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ge-gray500">Collection time</dt>
                      <dd className="mt-1 font-ge text-base font-semibold text-gs-dark">{snap.collectionTime}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-2xl border border-ge-gray100 bg-white p-6 shadow-[0_10px_28px_rgba(6,59,42,0.06)] sm:p-7">
                <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-orange">What to add now</p>
                <ul className="mt-4 space-y-3">
                  {[
                    'The hotel or pickup base you are already using on the Costa del Sol',
                    'The dates and group size so we can shape the week properly',
                    'Any must-play courses, transfer help, or club-rental needs'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 font-ge text-base leading-7 text-gs-dark">
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gs-dark/10 bg-[linear-gradient(145deg,rgba(6,59,42,0.97),rgba(11,107,69,0.92),rgba(255,199,44,0.12))] p-[1px] shadow-[0_18px_40px_rgba(6,59,42,0.14)]">
                <div className="rounded-[1.05rem] bg-gs-dark px-6 py-7 text-white sm:px-7">
                  <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-gs-gold-light">
                    What happens next
                  </p>
                  <div className="mt-5 space-y-4">
                    {[
                      'We merge your arrival snapshot with this longer trip brief so you do not repeat yourself.',
                      'A planner replies with golf, transfer, and extras matched to the base you already have.',
                      'You stay in one joined-up conversation instead of jumping across multiple forms.'
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 font-ge text-base leading-7 text-white/86">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-36">
              <div className="rounded-2xl border border-gs-dark/10 bg-white p-6 shadow-[0_20px_50px_rgba(6,59,42,0.12)] sm:p-7">
                <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-orange">
                  Full trip brief
                </p>
                <h2 className="mt-3 font-ge text-[1.85rem] font-extrabold leading-tight text-gs-green sm:text-[2rem]">
                  Add the rest of the week
                </h2>
                <p className="mt-3 font-ge text-[1rem] leading-7 text-ge-gray500">
                  This form is built for the “hotel already booked” path, so it focuses on the golf, routing, and support
                  still to be planned.
                </p>

                {status === 'success' ? (
                  <div className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
                    <p className="font-ge text-[0.82rem] font-bold uppercase tracking-[0.14em] text-gs-green">
                      Trip brief received
                    </p>
                    <p className="mt-2 font-ge text-[1rem] leading-7 text-gs-dark">
                      Thanks — we now have the fuller picture and will reply shortly from Ireland.
                    </p>
                    <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-4">
                      Email us directly
                    </GeButton>
                  </div>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                    <label className="block">
                      <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                        Email
                      </span>
                      <input
                        className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                        Hotel or pickup base
                      </span>
                      <input
                        className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                        value={hotelBase}
                        onChange={(event) => setHotelBase(event.target.value)}
                        placeholder="e.g. Hotel Angela, Fuengirola"
                        required
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                          Trip dates
                        </span>
                        <input
                          className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                          value={tripDates}
                          onChange={(event) => setTripDates(event.target.value)}
                          placeholder="e.g. 15–19 Sept 2026"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                          Group size
                        </span>
                        <input
                          className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                          value={groupSize}
                          onChange={(event) => setGroupSize(event.target.value)}
                          placeholder="e.g. 8 golfers"
                          required
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                        Preferred courses or areas
                      </span>
                      <input
                        className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                        value={preferredCourses}
                        onChange={(event) => setPreferredCourses(event.target.value)}
                        placeholder="e.g. Marbella Golf Valley, La Cala, Sotogrande"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                          Transfer plan
                        </span>
                        <select
                          className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                          value={transferPlan}
                          onChange={(event) => setTransferPlan(event.target.value)}
                        >
                          <option>Airport and golf-day transfers</option>
                          <option>Golf-day transfers only</option>
                          <option>I already have transport sorted</option>
                          <option>Need advice on the full week</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                          Club rental
                        </span>
                        <select
                          className="h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                          value={clubRental}
                          onChange={(event) => setClubRental(event.target.value)}
                        >
                          <option>No club rental needed</option>
                          <option>A few players need rental clubs</option>
                          <option>Most of the group need rental clubs</option>
                          <option>Need advice on rental options</option>
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500">
                        Tee times, pacing, and notes
                      </span>
                      <textarea
                        className="min-h-[130px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
                        value={tripNotes}
                        onChange={(event) => setTripNotes(event.target.value)}
                        placeholder="Tell us the kind of week you want, any must-play rounds, buggy needs, or anything we should know."
                      />
                    </label>

                    {status === 'error' && errorMessage ? (
                      <p className="rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2 font-ge text-[1rem] text-gs-dark" role="alert">
                        {errorMessage}
                      </p>
                    ) : null}

                    <GeButton className="w-full" type="submit" variant="gs-gold" size="lg" disabled={status === 'submitting'}>
                      <Send className="h-4 w-4" aria-hidden />
                      {status === 'submitting' ? 'Sending full brief...' : 'Send full trip brief'}
                    </GeButton>
                  </form>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-ge-gray100 bg-white p-5 shadow-[0_8px_20px_rgba(6,59,42,0.06)]">
                <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-orange">Prefer to call?</p>
                <a
                  href={`tel:${contactInfo.phoneTel}`}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-gs-green px-4 py-2.5 font-ge text-base font-bold uppercase tracking-[0.12em] text-gs-green transition-colors hover:bg-gs-green hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden />
                  {contactInfo.phoneDisplay}
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-ge-gray50 py-14 sm:py-16">
          <div className="mx-auto grid max-w-[1180px] gap-5 px-5 sm:px-8 md:grid-cols-3">
            {[
              {
                title: 'Same Irish team',
                copy: 'The reply comes from the same GolfSol Ireland team that manages the rest of the trip.',
                icon: Mail
              },
              {
                title: 'Better routing context',
                copy: 'Because you already shared the arrival piece, we can focus here on the golf, hotel base, and transfer rhythm.',
                icon: MapPinned
              },
              {
                title: 'Built for groups',
                copy: 'This step helps captains and organisers explain the week clearly without long back-and-forth emails.',
                icon: Users
              }
            ].map(({ title, copy, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-ge-gray100 bg-white p-5 shadow-[0_10px_28px_rgba(6,59,42,0.05)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gs-dark text-gs-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="mt-4 font-ge text-[1.2rem] font-extrabold text-gs-green">{title}</h2>
                <p className="mt-2 font-ge text-base leading-7 text-ge-gray500">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <GeFooter />
      <WhatsappFab />
    </div>
  )
}
