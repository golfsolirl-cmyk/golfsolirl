import { m  } from 'framer-motion'
import { ArrowRight, Briefcase, Users } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GeTransfersInsuranceBanner } from '../components/ge-transfers-insurance-banner'
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
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <m.div
            className="relative isolate aspect-[16/9] min-h-[220px] w-full overflow-hidden rounded-[2rem] border border-[#d9d9d9] bg-gs-dark shadow-[0_26px_70px_rgba(6,59,42,0.18)] sm:aspect-[16/10] sm:min-h-[260px] lg:min-h-[300px]"
            {...fadeUp}
          >
            <img
              src="/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png"
              alt="GolfSol Ireland Mercedes V-Class, E-Class and Sprinter lined up on a Costa del Sol fairway with La Concha mountain in the background."
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              width={1800}
              height={1010}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/25 via-transparent to-transparent"
            />
          </m.div>

          <GeTransfersInsuranceBanner
            variant="featured"
            motionTransition={{ ...fadeUp.transition, delay: 0.06 }}
          />
        </div>

        <m.div
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_24px_55px_rgba(6,32,22,0.1)] ring-1 ring-[#d9d9d9] backdrop-blur-sm sm:p-8"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-brand-700/90 to-transparent"
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
                className="flex items-start gap-3 rounded-[1.35rem] border border-chrome-300 bg-chrome-50 px-4 py-3.5 shadow-[0_12px_30px_rgba(6,32,22,0.06)] sm:items-center sm:gap-4"
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

          <div className="relative z-[1] mt-8 overflow-hidden rounded-[1.4rem] border border-chrome-300 bg-chrome-50 shadow-[0_12px_32px_rgba(6,32,22,0.08)]">
            <div className="p-4 sm:p-5">
              <GeButton
                href="/transport"
                variant="gs-green"
                size="md"
                className="w-full justify-center px-4 text-[0.78rem] tracking-[0.1em] sm:text-[0.9rem] sm:tracking-[0.14em]"
              >
                See the fleet
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </GeButton>
            </div>
            <div className="border-t border-brand-700/35 bg-gs-dark px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-center font-ge text-[0.8rem] font-extrabold uppercase leading-snug tracking-[0.14em] text-silver-200 sm:text-[0.88rem] sm:tracking-[0.16em]">
                <span className="text-white">1 to 8 max</span>
                <span className="mx-2 text-brand-700 sm:mx-2.5" aria-hidden="true">
                  ·
                </span>
                <span className="text-white">Golf-bag friendly</span>
              </p>
            </div>
          </div>
        </m.div>
      </div>
    </GeSection>
  )
}
