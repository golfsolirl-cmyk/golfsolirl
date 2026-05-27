import { m, type Variants } from 'framer-motion'
import { ArrowRight, Clock3, Headset, MapPin, PlaneLanding, ShieldCheck } from 'lucide-react'
import { GeDualPhoneAirportTransferCalls } from '../components/ge-dual-phone-contact'
import { homeAirportTransferSignals, homeAirportTransfersCopy } from '../data/copy'

const signalIcons = [PlaneLanding, MapPin, ShieldCheck] as const

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const headlineContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const headlineItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
}

export function HomeAirportTransfersCta() {
  const copy = homeAirportTransfersCopy

  return (
    <section
      id="home-airport-transfers"
      aria-labelledby="home-airport-transfers-title"
      className="relative isolate overflow-hidden border-y border-chrome-300/70 bg-white text-gs-dark"
    >
      <div className="relative mx-auto max-w-[1180px] px-4 py-10 sm:px-8 sm:py-12 lg:py-14">
        <m.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[1.75rem] border border-chrome-300 bg-white px-4 pb-5 pt-8 shadow-[0_20px_50px_rgba(6,32,22,0.08)] sm:px-7 sm:pb-7 sm:pt-11 lg:px-9 lg:pb-9 lg:pt-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,#136047_22%,#d9be7a_50%,#136047_78%,transparent_100%)]"
          />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-start lg:gap-x-10 lg:gap-y-6">
            <m.div
              className="max-w-3xl min-w-0"
              variants={headlineContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <m.div
                variants={headlineItem}
                className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                <span className="inline-flex min-h-[44px] w-fit max-w-full items-center gap-2 rounded-full border border-brand-700/40 bg-white px-4 py-2.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-gs-dark shadow-[0_10px_24px_rgba(6,32,22,0.08)] sm:tracking-[0.18em]">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full bg-gs-electric shadow-[0_0_14px_rgba(30,215,96,0.9)]"
                  />
                  {copy.eyebrow}
                </span>
                <span className="inline-flex min-h-[44px] w-full min-w-0 items-center justify-center rounded-full border border-chrome-300 bg-cream/90 px-3 py-2.5 text-center font-ge text-[0.62rem] font-bold uppercase leading-snug tracking-[0.06em] text-gs-dark shadow-[0_8px_22px_rgba(6,32,22,0.06)] sm:w-auto sm:max-w-full sm:px-5 sm:text-[0.72rem] sm:tracking-[0.08em]">
                  <span className="text-balance">{copy.regionBadge}</span>
                </span>
              </m.div>

              <m.h2
                id="home-airport-transfers-title"
                variants={headlineItem}
                className="mt-5 max-w-[14ch] font-ge text-[2rem] font-extrabold leading-[1.02] tracking-[-0.02em] text-gs-dark sm:max-w-2xl sm:text-[2.75rem] lg:text-[3.05rem]"
              >
                {copy.titleLine1}
                <span className="relative mt-1 block text-brand-700">
                  {copy.titleLine2}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-brand-800/15 via-brand-700 to-brand-800/15 sm:-bottom-1.5 sm:h-1"
                  />
                </span>
              </m.h2>

              <m.p
                variants={headlineItem}
                className="mt-4 max-w-2xl font-ge text-[1rem] leading-7 text-gs-dark/84 sm:text-[1.12rem] sm:leading-8"
              >
                {copy.body}
              </m.p>

              <m.div
                variants={headlineItem}
                className="relative mt-7 overflow-hidden rounded-[1.75rem] border border-chrome-300 bg-white shadow-[0_26px_64px_rgba(6,32,22,0.12)]"
              >
                <div className="relative aspect-[16/10] min-h-[200px] overflow-hidden sm:aspect-[21/10] sm:min-h-0">
                  <img
                    src={copy.fleetImageSrc}
                    alt={copy.fleetImageAlt}
                    className="absolute inset-x-0 top-4 h-[112%] w-full object-cover object-[center_78%] sm:top-5 sm:object-[center_74%]"
                    loading="lazy"
                    decoding="async"
                    width={1800}
                    height={1010}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/22 via-transparent to-transparent"
                  />
                  <div className="absolute left-3 top-3 sm:left-5 sm:top-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-700/40 bg-white px-3.5 py-2 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-gs-dark shadow-[0_10px_24px_rgba(6,32,22,0.12)] sm:text-[0.72rem]">
                      {copy.fleetImageBadge}
                    </span>
                  </div>
                </div>
                <div className="border-t border-[#e3ebe6] bg-[#fffaf2] px-4 py-4 sm:px-5">
                  <p className="font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-gs-green">
                    {copy.fleetCardLabel}
                  </p>
                  <p className="mt-1.5 font-ge text-[0.92rem] font-semibold leading-6 text-gs-dark/85 sm:text-[0.98rem]">
                    {copy.fleetCardBody}
                  </p>
                </div>
              </m.div>
            </m.div>

            <m.div
              className="w-full max-w-full self-stretch lg:max-w-[24.5rem] lg:justify-self-end"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
            >
              <div className="ge-on-dark relative flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-[#d9be7a]/35 bg-[linear-gradient(165deg,#0d3a2a_0%,#0a2d20_55%,#08231a_100%)] p-4 shadow-[0_28px_68px_rgba(6,32,22,0.28)] ring-1 ring-white/10 sm:rounded-[1.85rem] sm:p-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,#d9be7a_35%,#136047_65%,transparent_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-[4.85rem] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-ge text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#f4dfa6]">
                      {copy.boardingEyebrow}
                    </p>
                    <p className="mt-2 font-ge text-[1.28rem] font-extrabold leading-tight text-white sm:text-[1.5rem]">
                      {copy.boardingTitle}
                    </p>
                  </div>
                  <div className="rounded-full border border-[#f4dfa6]/45 bg-forest-900 px-3 py-1.5 font-ge text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-[#fbe8b5]">
                    {copy.boardingLive}
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-[auto,1fr] gap-x-3 gap-y-3">
                  <dt className="font-ge text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/80 sm:tracking-[0.18em]">
                    {copy.boardingRouteLabel}
                  </dt>
                  <dd className="font-ge text-[0.84rem] font-semibold text-white sm:text-[0.92rem]">
                    {copy.boardingRouteValue}
                  </dd>
                  <dt className="font-ge text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/80 sm:tracking-[0.18em]">
                    {copy.boardingStatusLabel}
                  </dt>
                  <dd className="inline-flex items-center gap-2 font-ge text-[0.84rem] font-semibold text-white sm:text-[0.92rem]">
                    <Clock3 className="h-4 w-4 shrink-0 text-white" aria-hidden />
                    {copy.boardingStatusValue}
                  </dd>
                  <dt className="font-ge text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/80 sm:tracking-[0.18em]">
                    {copy.boardingDeskLabel}
                  </dt>
                  <dd className="inline-flex items-center gap-2 font-ge text-[0.84rem] font-semibold text-white sm:text-[0.92rem]">
                    <Headset className="h-4 w-4 shrink-0 text-white" aria-hidden />
                    {copy.boardingDeskValue}
                  </dd>
                </dl>

                <div className="mt-6">
                  <m.a
                    href="/services/transport"
                    className="group relative inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-[linear-gradient(135deg,#136047_0%,#0f4f3c_55%,#0a2d20_100%)] px-5 py-3.5 text-center font-ge text-[0.9rem] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-0.5 hover:border-[#d9be7a]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4dfa6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2d20] sm:min-h-[60px] sm:text-[0.96rem]"
                  >
                    <span className="inline-flex items-center gap-3">
                      <PlaneLanding className="h-5 w-5 shrink-0 text-white" aria-hidden />
                      {copy.ctaLabel}
                      <ArrowRight className="h-4 w-4 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </m.a>
                </div>

                <GeDualPhoneAirportTransferCalls onDark />
              </div>
            </m.div>

            <div className="relative z-10 col-span-full mt-6 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              {homeAirportTransferSignals.map(({ title, detail }, index) => {
                const Icon = signalIcons[index] ?? PlaneLanding
                return (
                  <m.div
                    key={title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 + index * 0.07 }}
                    className="min-w-0 w-full rounded-[1.25rem] border border-chrome-300/90 bg-white px-4 py-4 shadow-[0_18px_36px_rgba(6,32,22,0.08)] sm:rounded-[1.35rem] sm:px-5 sm:py-4"
                  >
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-600 text-white shadow-[0_10px_22px_rgba(19,96,71,0.22)]">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-balance font-ge text-[0.88rem] font-extrabold leading-snug text-gs-dark sm:text-[0.94rem]">
                          {title}
                        </p>
                        <p className="mt-1.5 text-pretty font-ge text-[0.84rem] leading-6 text-gs-dark/72 sm:text-[0.9rem]">
                          {detail}
                        </p>
                      </div>
                    </div>
                  </m.div>
                )
              })}
            </div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
