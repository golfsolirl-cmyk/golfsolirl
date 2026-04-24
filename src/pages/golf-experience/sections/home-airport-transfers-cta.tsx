import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Clock3, MapPin, Phone, PlaneLanding, ShieldCheck } from 'lucide-react'
import { contactInfo } from '../data/copy'

const transferSignals = [
  {
    icon: PlaneLanding,
    title: 'AGP arrivals tracked',
    detail: 'Flight-aware collection window'
  },
  {
    icon: MapPin,
    title: 'Direct to resort',
    detail: 'No taxi-rank scramble'
  },
  {
    icon: ShieldCheck,
    title: 'Golf bags welcome',
    detail: 'Driver + luggage-ready vehicles'
  }
] as const

export function HomeAirportTransfersCta() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="home-airport-transfers"
      aria-labelledby="home-airport-transfers-title"
      className="relative isolate overflow-hidden bg-[#f4efe3] text-gs-dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 0%, rgba(255,199,44,0.2), transparent 28%), radial-gradient(circle at 88% 18%, rgba(6,59,42,0.14), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(244,239,227,0.98) 45%, rgba(236,228,209,0.98) 100%)'
        }}
      />

      <div className="relative mx-auto max-w-[1180px] px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] border border-[#d7c8a4] bg-[linear-gradient(180deg,rgba(255,252,245,0.98)_0%,rgba(248,241,225,0.96)_100%)] p-4 shadow-[0_32px_80px_rgba(69,53,24,0.16)] sm:p-6 lg:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,199,44,0.18), transparent 24%), radial-gradient(circle at 82% 18%, rgba(6,59,42,0.08), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(248,241,225,0.2) 100%)'
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,199,44,0.12) 10%, #FFC72C 30%, #FFE27A 50%, #FFC72C 70%, rgba(255,199,44,0.12) 90%, transparent 100%)'
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gs-gold/[0.25] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gs-gold/[0.2] to-transparent"
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-4 left-[-22%] w-[38%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.35)_45%,transparent_100%)] blur-md"
            animate={reduceMotion ? undefined : { x: ['0%', '320%'] }}
            transition={reduceMotion ? undefined : { duration: 4.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
          />

          <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-gs-gold/40 bg-white/85 px-3.5 py-1.5 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-gs-dark shadow-[0_8px_20px_rgba(69,53,24,0.08)] backdrop-blur-sm">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-gs-electric shadow-[0_0_14px_rgba(30,215,96,0.95)]" />
                  Airport transfer desk
                </span>
                <span className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[#e4d6b6] bg-[#fffaf0] px-3.5 py-1.5 font-ge text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gs-dark/80 shadow-[0_8px_20px_rgba(69,53,24,0.05)]">
                  AGP arrivals
                  <span aria-hidden className="text-gs-gold">/</span>
                  Costa del Sol
                </span>
              </div>

              <h2
                id="home-airport-transfers-title"
                className="mt-4 max-w-2xl text-balance font-ge text-[2.32rem] font-extrabold leading-[1.02] text-gs-dark sm:text-[2.8rem] lg:text-[3.1rem]"
              >
                Land in Malaga.
                <span className="block text-gs-gold">Ride out like VIP departures.</span>
              </h2>

              <p className="mt-4 max-w-2xl font-ge text-[1.14rem] leading-8 text-gs-dark/82 sm:text-[1.14rem] sm:leading-8">
                Meet and greet with all groups at the airport, live flight awareness, luggage space for clubs, then on to your hotel of choice.
              </p>

              <motion.div
                className="relative mt-6 overflow-hidden rounded-[1.7rem] border border-[#dbcda9] bg-white shadow-[0_24px_60px_rgba(69,53,24,0.12)]"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
              >
                <div className="relative aspect-[16/10] min-h-[250px] sm:aspect-[21/10] sm:min-h-0">
                  <img
                    src="/images/transport-fleet-lineup.jpg"
                    alt="Mercedes E-Class, V-Class and Sprinter parked together on a Costa del Sol forecourt with mountains behind."
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={1800}
                    height={1010}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/18 via-transparent to-transparent"
                  />
                  <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-gs-dark/72 px-4 py-2.5 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:px-3.5 sm:py-2 sm:text-[0.72rem]">
                      Fleet ready for golf bags
                    </span>
                  </div>
                </div>
                <div className="border-t border-[#ece1c5] bg-[#fffaf2] px-4 py-4 sm:px-5 sm:py-4">
                  <p className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-gs-green sm:text-[0.7rem]">Mercedes fleet</p>
                  <p className="mt-1.5 font-ge text-[1.04rem] font-semibold leading-7 text-gs-dark/82 sm:mt-1 sm:text-[0.96rem] sm:leading-6">
                    E-Class, V-Class and Sprinter options matched to the group and the bag count.
                  </p>
                </div>
              </motion.div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {transferSignals.map(({ icon: Icon, title, detail }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 + index * 0.08 }}
                    className="rounded-[1.35rem] border border-[#e4d6b6] bg-white/86 px-4 py-4 shadow-[0_16px_30px_rgba(69,53,24,0.08)] backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gs-gold to-gs-gold-light text-gs-dark shadow-[0_8px_18px_rgba(255,199,44,0.22)] sm:h-10 sm:w-10">
                        <Icon className="h-5.5 w-5.5 sm:h-5 sm:w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-ge text-[0.98rem] font-extrabold uppercase tracking-[0.12em] text-gs-dark sm:text-[0.92rem]">{title}</p>
                        <p className="mt-1 font-ge text-[0.96rem] leading-6 text-gs-dark/72 sm:text-[0.9rem]">{detail}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-[24rem] self-stretch">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#d9c99e] bg-white/92 p-4.5 shadow-[0_24px_60px_rgba(69,53,24,0.12)] backdrop-blur-sm sm:p-5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-5 top-[4.75rem] h-px bg-gradient-to-r from-transparent via-gs-gold/75 to-transparent"
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-ge text-[0.8rem] font-bold uppercase tracking-[0.22em] text-gs-green sm:text-[0.72rem]">Now boarding</p>
                    <p className="mt-2 font-ge text-[1.62rem] font-extrabold leading-tight text-gs-dark sm:text-[1.48rem]">Airport transfers</p>
                  </div>
                  <div className="rounded-full border border-gs-gold/30 bg-gs-gold/10 px-3 py-1.5 font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-gs-gold sm:py-1 sm:text-[0.68rem]">
                    LIVE
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[auto,1fr] gap-x-3 gap-y-2.5 text-gs-dark/[0.88]">
                  <span className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gs-dark/[0.54] sm:text-[0.72rem]">Route</span>
                  <span className="font-ge text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-gs-dark/[0.92] sm:text-[0.92rem]">Malaga Airport to your resort</span>
                  <span className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gs-dark/[0.54] sm:text-[0.72rem]">Status</span>
                  <span className="inline-flex items-center gap-2 font-ge text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-gs-dark/[0.92] sm:text-[0.92rem]">
                    <Clock3 className="h-4 w-4 text-gs-gold" aria-hidden />
                    Ready on landing
                  </span>
                  <span className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gs-dark/[0.54] sm:text-[0.72rem]">Desk</span>
                  <span className="font-ge text-[0.98rem] font-semibold uppercase tracking-[0.12em] text-gs-dark/[0.92] sm:text-[0.92rem]">Irish support line active</span>
                </div>

                <div className="mt-6">
                  <motion.a
                    href="/services/transport"
                    className="group relative inline-flex min-h-[66px] w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-[#fff4c6]/20 bg-[linear-gradient(135deg,#FFE27A_0%,#FFC72C_38%,#f4b41a_100%)] px-6 py-4 text-center font-ge text-[1.04rem] font-extrabold uppercase tracking-[0.16em] text-gs-dark shadow-[0_18px_40px_rgba(255,199,44,0.3)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(255,199,44,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gs-dark sm:min-h-[62px] sm:text-[0.98rem]"
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            boxShadow: [
                              '0 18px 40px rgba(255,199,44,0.26)',
                              '0 24px 54px rgba(255,199,44,0.44)',
                              '0 18px 40px rgba(255,199,44,0.26)'
                            ]
                          }
                    }
                    transition={reduceMotion ? undefined : { duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
                  >
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-1 left-[-35%] w-[38%] rounded-full bg-white/30 blur-md"
                      animate={reduceMotion ? undefined : { x: ['0%', '300%'] }}
                      transition={reduceMotion ? undefined : { duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
                    />
                    <span className="relative inline-flex items-center gap-3">
                      <PlaneLanding className="h-5 w-5" aria-hidden />
                      Explore airport transfers
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </motion.a>
                </div>

                <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-[16rem] font-ge text-[0.88rem] font-semibold uppercase tracking-[0.16em] text-gs-dark/[0.68] sm:text-[0.82rem]">
                    Meet & greet · Resort drop-off · Golf bag friendly
                  </p>
                  <a
                    href={`tel:${contactInfo.phoneTel}`}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#ddd0b0] bg-[#fffaf0] px-4 py-2 font-ge text-[0.88rem] font-extrabold uppercase tracking-[0.14em] text-gs-dark transition-colors hover:border-gs-gold/[0.45] hover:text-gs-green sm:min-h-[46px] sm:text-[0.82rem]"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    {contactInfo.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
