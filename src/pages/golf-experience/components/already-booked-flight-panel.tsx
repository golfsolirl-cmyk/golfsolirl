import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Hotel, MapPin, PlaneLanding, Sparkles, X } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { alreadyBookedHotelCopy } from '../data/copy'

type TravelMode = 'flight' | 'arrived'

const STORAGE_KEY = 'golfSolTripFlightPrefill'

export function GeAlreadyBookedFlightPanel() {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [travelMode, setTravelMode] = useState<TravelMode | null>(null)
  const [flightNo, setFlightNo] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [collectionTime, setCollectionTime] = useState('')
  const [error, setError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const flightFieldRef = useRef<HTMLInputElement>(null)
  const collectionFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 280)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (travelMode === 'flight') {
      const t = window.setTimeout(() => flightFieldRef.current?.focus(), 80)
      return () => window.clearTimeout(t)
    }
    if (travelMode === 'arrived') {
      const t = window.setTimeout(() => collectionFieldRef.current?.focus(), 80)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [travelMode])

  const setMode = (mode: TravelMode) => {
    setError(null)
    setTravelMode(mode)
    if (mode === 'flight') {
      setCollectionTime('')
    } else {
      setFlightNo('')
      setArrivalTime('')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fullName.trim() || !mobile.trim()) {
      setError('Please add your name and mobile so we can reach you.')
      return
    }
    if (!travelMode) {
      setError(alreadyBookedHotelCopy.modeRequiredError)
      return
    }
    if (travelMode === 'flight') {
      if (!flightNo.trim() || !arrivalTime.trim()) {
        setError('Add your flight number and expected landing time (local).')
        return
      }
    } else if (!collectionTime.trim()) {
      setError('Choose when you would like to be collected.')
      return
    }
    setError(null)
    try {
      const base = {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        travelMode,
        savedAt: new Date().toISOString()
      }
      const payload =
        travelMode === 'flight'
          ? { ...base, flightNo: flightNo.trim(), arrivalTime: arrivalTime.trim(), collectionTime: '' }
          : { ...base, flightNo: '', arrivalTime: '', collectionTime: collectionTime.trim() }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      setError('Could not save your details in this browser. Try again or call us directly.')
      return
    }
    window.location.assign('/continue-trip')
  }

  return (
    <div id="already-booked-hotel" className="mt-10 w-full scroll-mt-28 lg:mt-12">
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="already-booked-cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 lg:max-w-2xl"
          >
            <p className="text-center font-ge text-sm leading-relaxed text-white/75 sm:text-[0.95rem]">
              {alreadyBookedHotelCopy.toggleSub}
            </p>
            <button
              type="button"
              aria-expanded={false}
              aria-controls="already-booked-flight-panel"
              onClick={() => setOpen(true)}
              className="group flex w-full max-w-md items-center justify-center gap-3 rounded-full border-2 border-gs-gold/70 bg-gs-dark/40 px-5 py-3.5 font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-gs-gold-light shadow-[0_0_0_1px_rgba(255,199,44,0.15)] transition-all hover:border-gs-gold hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold focus-visible:ring-offset-2 focus-visible:ring-offset-gs-green sm:px-8 sm:py-4 sm:text-[0.8rem]"
            >
              <Hotel className="h-5 w-5 shrink-0 text-gs-gold transition-transform group-hover:scale-110" aria-hidden />
              <span className="text-balance">{alreadyBookedHotelCopy.toggleCta}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="already-booked-panel"
            id="already-booked-flight-panel"
            role="region"
            aria-labelledby="already-booked-flight-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.36, ease: 'easeOut' }}
            className="relative mx-auto w-full"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -left-6 top-1/2 hidden h-[118%] w-24 -translate-y-1/2 rotate-[-8deg] rounded-full bg-gradient-to-b from-gs-gold/25 via-transparent to-ge-orange/20 blur-2xl md:block"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/[0.09] p-6 pt-14 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-8 sm:pt-14 lg:p-10 lg:pt-16">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-gs-dark/40 text-white/90 transition-colors hover:border-gs-gold/60 hover:bg-white/10 hover:text-gs-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold sm:right-4 sm:top-4"
              >
                <span className="sr-only">{alreadyBookedHotelCopy.closeForm}</span>
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full border border-gs-gold/30"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-[120%] -translate-x-1/2 bg-gradient-to-t from-gs-dark/40 to-transparent"
              />

              <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-14">
                <div className="min-w-0 lg:col-span-5 xl:col-span-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gs-gold/45 bg-gs-dark/35 px-3 py-1.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-gs-gold-light shadow-[0_0_24px_rgba(255,199,44,0.18)]">
              <Hotel className="h-3.5 w-3.5 text-gs-gold" aria-hidden />
              {alreadyBookedHotelCopy.badge}
            </div>
            <h3
              id="already-booked-flight-heading"
              className="mt-4 font-ge text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-[1.65rem] lg:leading-snug"
            >
              {alreadyBookedHotelCopy.title}
            </h3>
            <p className="mt-3 max-w-prose font-ge text-sm leading-relaxed text-white/82 sm:text-[0.95rem]">
              {alreadyBookedHotelCopy.subtitle}
            </p>
            <p className="mt-5 flex items-start gap-2 font-ge text-xs font-semibold uppercase leading-relaxed tracking-[0.18em] text-white/55">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gs-gold" aria-hidden />
              {alreadyBookedHotelCopy.footnote}
            </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="relative min-w-0 space-y-5 rounded-2xl border border-white/15 bg-gs-dark/25 p-5 shadow-inner sm:p-6 lg:col-span-7 lg:p-8 xl:col-span-8"
                  noValidate
                >
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-ge text-xs font-bold uppercase tracking-[0.2em] text-gs-gold-light/90">
                    <PlaneLanding className="h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                    Arrival snapshot
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:gap-x-5">
                    <label className="block min-w-0 lg:col-span-6">
                      <span className="mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/70">
                        {alreadyBookedHotelCopy.nameLabel}
                      </span>
                      <input
                        ref={firstFieldRef}
                        name="fullName"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/20 bg-white/95 px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow placeholder:text-ge-gray300 focus:border-gs-gold focus:ring-2"
                        placeholder="Pádraig Murphy"
                      />
                    </label>
                    <label className="block min-w-0 lg:col-span-6">
                      <span className="mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/70">
                        {alreadyBookedHotelCopy.mobileLabel}
                      </span>
                      <input
                        name="mobile"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/20 bg-white/95 px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow placeholder:text-ge-gray300 focus:border-gs-gold focus:ring-2"
                        placeholder="+353 87 000 0000"
                      />
                      <span className="mt-1.5 block max-w-xl font-ge text-[0.68rem] leading-snug text-white/50">
                        {alreadyBookedHotelCopy.mobileHint}
                      </span>
                    </label>

                    <div className="space-y-3 lg:col-span-6">
                      <p className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/70">
                        {alreadyBookedHotelCopy.travelModePrompt}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setMode('flight')}
                          className={cx(
                            'flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] transition-all',
                            travelMode === 'flight'
                              ? 'border-gs-gold bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,199,44,0.35)]'
                              : 'border-white/20 bg-white/[0.04] text-white/85 hover:border-gs-gold/50 hover:bg-white/[0.08]'
                          )}
                        >
                          <PlaneLanding className="h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                          {alreadyBookedHotelCopy.modeFlight}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('arrived')}
                          className={cx(
                            'flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.12em] transition-all',
                            travelMode === 'arrived'
                              ? 'border-gs-gold bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,199,44,0.35)]'
                              : 'border-white/20 bg-white/[0.04] text-white/85 hover:border-gs-gold/50 hover:bg-white/[0.08]'
                          )}
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                          {alreadyBookedHotelCopy.modeArrived}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false} mode="wait">
                    {travelMode === 'flight' ? (
                      <motion.div
                        key="mode-flight"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-6 lg:gap-x-5"
                      >
                        <label className="block min-w-0 sm:col-span-1 lg:col-span-3">
                          <span className="mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/70">
                            {alreadyBookedHotelCopy.flightLabel}
                          </span>
                          <input
                            ref={flightFieldRef}
                            name="flightNo"
                            autoComplete="off"
                            value={flightNo}
                            onChange={(e) => setFlightNo(e.target.value)}
                            className="h-11 w-full rounded-xl border border-white/20 bg-white/95 px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow placeholder:text-ge-gray300 focus:border-gs-gold focus:ring-2"
                            placeholder={alreadyBookedHotelCopy.flightPlaceholder}
                          />
                        </label>
                        <label className="block min-w-0 sm:col-span-1 lg:col-span-3">
                          <span className="mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/70">
                            {alreadyBookedHotelCopy.arrivalLabel}
                          </span>
                          <input
                            name="arrivalTime"
                            type="time"
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                            className="h-11 w-full min-w-0 rounded-xl border border-white/20 bg-white/95 px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow focus:border-gs-gold focus:ring-2"
                          />
                        </label>
                      </motion.div>
                    ) : null}
                    {travelMode === 'arrived' ? (
                      <motion.div
                        key="mode-arrived"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="space-y-2"
                      >
                        <label className="block min-w-0 max-w-md">
                          <span className="mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/70">
                            {alreadyBookedHotelCopy.collectionTimeLabel}
                          </span>
                          <input
                            ref={collectionFieldRef}
                            name="collectionTime"
                            type="time"
                            value={collectionTime}
                            onChange={(e) => setCollectionTime(e.target.value)}
                            className="h-11 w-full min-w-0 rounded-xl border border-white/20 bg-white/95 px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-gs-gold/40 transition-shadow focus:border-gs-gold focus:ring-2"
                          />
                          <span className="mt-1.5 block font-ge text-[0.68rem] leading-snug text-white/50">
                            {alreadyBookedHotelCopy.collectionTimeHint}
                          </span>
                        </label>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {error ? (
                    <p
                      className="rounded-lg border border-ge-orange/40 bg-ge-orange/15 px-3 py-2 font-ge text-sm text-white"
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-gs-gold via-[#f4b41a] to-gs-gold-light py-3.5 font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-gs-dark shadow-[0_10px_28px_rgba(255,199,44,0.35)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
                  >
                    <span className="relative z-[1]">{alreadyBookedHotelCopy.submit}</span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-white/25 transition-transform duration-500 group-hover:translate-x-0"
                    />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { STORAGE_KEY as GOLF_SOL_TRIP_FLIGHT_PREFILL_KEY }
