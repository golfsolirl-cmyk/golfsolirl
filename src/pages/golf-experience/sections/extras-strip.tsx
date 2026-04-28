import { motion } from 'framer-motion'
import { Bus, CalendarDays, ShieldCheck, type LucideIcon } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { extrasCopy } from '../data/copy'

interface Extra {
  readonly title: string
  readonly icon: LucideIcon
  readonly detail?: string
  readonly note?: string
}

const extras: readonly Extra[] = [
  {
    title: extrasCopy.teeTimesStripTitle,
    icon: CalendarDays,
    detail: extrasCopy.teeTimesStripBody,
    note: extrasCopy.teeTimesStripBadge
  },
  {
    title: 'Transfers',
    icon: Bus,
    detail: extrasCopy.transfersCapacityBody,
    note: extrasCopy.transfersCapacityBadge
  },
  {
    title: extrasCopy.transferInsuredTitle,
    icon: ShieldCheck,
    detail: extrasCopy.transferInsuredBody,
    note: extrasCopy.transferInsuredBadge
  }
]

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

function TitleWithAccent() {
  const segments = extrasCopy.title.split('Costa del Sol')
  const hasAccent = segments.length === 2

  if (!hasAccent) {
    return (
      <h2 className="font-ge text-[1.85rem] font-extrabold leading-[1.12] tracking-[0.02em] text-white sm:text-[2.35rem] md:text-[2.55rem]">
        {extrasCopy.title}
      </h2>
    )
  }

  return (
    <h2 className="font-ge text-[1.85rem] font-extrabold leading-[1.12] tracking-[0.02em] text-white sm:text-[2.35rem] md:text-[2.55rem]">
      <span className="text-white/95">{segments[0]}</span>
      <span className="relative inline-block px-1 text-gs-gold sm:px-1.5">
        Costa del Sol
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-gs-gold/20 via-gs-gold to-gs-gold/20 sm:-bottom-1.5 sm:h-1"
        />
      </span>
      <span className="text-white/95">{segments[1]}</span>
    </h2>
  )
}

export function GeExtrasStrip() {
  return (
    <GeSection
      background="brandDark"
      id="extras"
      className="relative isolate overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-28"
      innerClassName="!pt-12 !pb-14 sm:!pt-16 sm:!pb-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-gs-green/25 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-gs-gold/12 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"
      />

      <div className="relative z-[1] mx-auto max-w-[820px] text-center">
        <motion.div {...fadeUp}>
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-gs-gold-light/90 sm:text-[0.78rem]">
            {extrasCopy.eyebrow}
          </p>
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-gs-gold/80 to-transparent"
          />
          <div className="mt-8">
            <TitleWithAccent />
          </div>
          <p className="mt-6 font-ge text-[0.92rem] font-semibold uppercase tracking-[0.2em] text-white/58 sm:text-[0.95rem]">
            {extrasCopy.subtitle}
          </p>
        </motion.div>
      </div>

      <div className="relative z-[1] mx-auto mt-14 grid max-w-[1040px] grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {extras.map(({ title, icon: Icon, detail, note }, index) => (
          <motion.article
            key={title}
            className="group relative flex flex-col items-center rounded-[1.65rem] border border-white/12 bg-white/[0.06] px-6 py-8 text-center shadow-[0_22px_50px_rgba(0,0,0,0.22)] ring-1 ring-white/[0.04] backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-gs-gold/35 hover:shadow-[0_28px_60px_rgba(0,0,0,0.28)] sm:px-5 sm:py-9"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.06 * (index + 1) }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gs-gold/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative inline-flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl border border-gs-gold/25 bg-gradient-to-br from-gs-green/50 to-gs-dark text-gs-gold shadow-[0_14px_36px_rgba(0,0,0,0.35)] ring-2 ring-white/5 sm:h-[4.5rem] sm:w-[4.5rem]">
              <Icon className="h-[1.65rem] w-[1.65rem]" aria-hidden="true" />
            </span>
            <h3 className="mt-6 font-ge text-[1.05rem] font-extrabold uppercase tracking-[0.08em] text-white sm:text-[1.08rem]">
              {title}
            </h3>
            {detail ? (
              <p className="mt-3 max-w-[17.5rem] font-ge text-[0.88rem] font-semibold leading-snug tracking-[0.02em] text-white/82 sm:max-w-[19rem] sm:text-[0.92rem]">
                {detail}
              </p>
            ) : null}
            <div className="mt-3 flex min-h-[2.25rem] items-center justify-center">
              {note ? (
                <p className="inline-flex items-center rounded-full border border-gs-gold/25 bg-gs-gold/10 px-3 py-1 font-ge text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gs-gold-light">
                  {note}
                </p>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.35) 18%, #FFC72C 40%, #FFE27A 50%, #FFC72C 60%, rgba(184,137,0,0.35) 82%, transparent 100%)'
        }}
      />
    </GeSection>
  )
}
