import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Users } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeSection } from '../components/ge-section'
import { transportFleetIntroCopy, transportFleetTiers } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export function GeHomeFleetHighlight() {
  const featuredTiers = transportFleetTiers.map((tier) => ({
    name: tier.name,
    seats: tier.seats,
    bagsLine: tier.bagsLine
  }))

  return (
    <GeSection background="cream" className="pt-20 pb-20 sm:pt-24 sm:pb-24">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-[#d6ccb8] bg-gs-dark shadow-[0_26px_70px_rgba(6,59,42,0.18)]"
          {...fadeUp}
        >
          <img
            src="/images/transport-fleet-lineup.jpg"
            alt="Mercedes E-Class, V-Class and Sprinter parked together on a Costa del Sol forecourt with mountains behind."
            className="block h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={1800}
            height={1010}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/78 via-gs-dark/14 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #B88900 15%, #FFC72C 35%, #FFE27A 50%, #FFC72C 65%, #B88900 85%, transparent 100%)'
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gs-gold/40 bg-gs-dark/55 px-3.5 py-2 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-gs-gold-light backdrop-blur-sm">
              Premium Mercedes only
            </div>
            <p className="mt-3 max-w-xl font-ge text-[1rem] leading-7 text-white/86 sm:text-[1.05rem]">
              Sized for the four-ball, society or family, with proper room for travel covers, trolleys and shoe bags.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_55px_rgba(69,53,24,0.1)] ring-1 ring-[#e5dcc8] backdrop-blur-sm sm:p-8"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-gs-gold/90 to-transparent"
          />
          <p className="relative z-[1] font-ge text-[0.78rem] font-bold uppercase tracking-[0.22em] text-gs-green sm:text-[0.82rem]">
            {transportFleetIntroCopy.eyebrow}
          </p>
          <h2 className="relative z-[1] mt-4 max-w-[14ch] font-ge text-[2.15rem] font-extrabold leading-[1.04] text-gs-dark sm:text-[2.55rem]">
            {transportFleetIntroCopy.title}
          </h2>
          <p className="relative z-[1] mt-5 max-w-2xl font-ge text-[1.02rem] leading-8 text-ge-gray500 sm:text-[1.06rem]">
            Premium Mercedes only, always matched to the group, with proper room for travel covers, trolleys and shoe bags.
          </p>

          <div className="relative z-[1] mt-8 space-y-3">
            {featuredTiers.map((tier, index) => (
              <div
                key={tier.name}
                className="flex items-start gap-3 rounded-[1.35rem] border border-[#e6dcc8] bg-[#fffcf6] px-4 py-3.5 shadow-[0_12px_30px_rgba(69,53,24,0.06)] sm:items-center sm:gap-4"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gs-dark text-white shadow-[0_10px_24px_rgba(6,59,42,0.18)]">
                  {index === 0 ? <Users className="h-4 w-4" aria-hidden /> : <Briefcase className="h-4 w-4" aria-hidden />}
                </span>
                <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-ge text-[0.98rem] font-extrabold leading-5 text-gs-dark sm:text-[1rem]">{tier.name}</p>
                    <p className="mt-1 font-ge text-[0.86rem] leading-6 text-ge-gray500">Premium Mercedes comfort for the Sol corridor.</p>
                  </div>
                  <div className="mt-2 min-w-0 sm:mt-0 sm:text-right">
                    <p className="font-ge text-[0.88rem] font-semibold leading-6 text-gs-dark">{tier.seats}</p>
                    <p className="font-ge text-[0.82rem] leading-6 text-ge-gray500">{tier.bagsLine}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-[1] mt-8 flex flex-col gap-4 rounded-[1.4rem] border border-[#e6dcc8] bg-[#fffcf6] p-4 sm:flex-row sm:items-center sm:justify-between">
            <GeButton href="/transport" variant="gs-gold" size="md" className="w-full sm:w-auto">
              See the fleet
              <ArrowRight className="h-4 w-4" aria-hidden />
            </GeButton>
            <p className="font-ge text-[0.74rem] font-bold uppercase tracking-[0.18em] text-gs-green/72 sm:text-right">
              1 to 16 passengers
              <span className="mx-2 hidden sm:inline text-gs-gold/80">·</span>
              <span className="block sm:inline">Golf-bag friendly</span>
            </p>
          </div>
        </motion.div>
      </div>
    </GeSection>
  )
}
