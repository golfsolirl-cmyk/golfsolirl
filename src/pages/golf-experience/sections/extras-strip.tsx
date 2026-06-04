import { m, type Variants } from 'framer-motion'
import { Bus, CalendarDays, ShieldCheck, Sparkles, ArrowRight, type LucideIcon } from 'lucide-react'
import { GeButton } from '../components/ge-button'
import { GsolGoldCornerAccents } from '../../../components/gsol-gold-corner-accents'
import { GeSection } from '../components/ge-section'
import { extrasCopy } from '../data/copy'

interface Extra {
  readonly title: string
  readonly icon: LucideIcon
  readonly detail: string
  readonly note: string
}

const extras: readonly Extra[] = [
  {
    title: extrasCopy.teeTimesStripTitle,
    icon: CalendarDays,
    detail: extrasCopy.teeTimesStripBody,
    note: extrasCopy.teeTimesStripBadge
  },
  {
    title: extrasCopy.transfersCapacityTitle,
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

const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } }
}

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: 'easeOut' } }
}

function TitleWithAccent() {
  const segments = extrasCopy.title.split('Costa del Sol')
  const baseClasses =
    'mx-auto max-w-[20ch] text-balance font-ge text-[2rem] font-extrabold leading-[1.06] tracking-[-0.01em] text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.32)] sm:max-w-3xl sm:text-[2.7rem] lg:text-[3.15rem]'

  if (segments.length !== 2) {
    return <h2 className={baseClasses}>{extrasCopy.title}</h2>
  }

  return (
    <h2 className={baseClasses}>
      <span className="text-white">{segments[0]}</span>
      <span className="relative inline-block px-1 sm:px-1.5">
        <span className="bg-gradient-to-r from-[#e7d399] via-[#d9be7a] to-[#b89a5a] bg-clip-text text-transparent">
          Costa del Sol
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent sm:-bottom-1.5 sm:h-1"
        />
      </span>
      <span className="text-white">{segments[1]}</span>
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
      <GsolGoldCornerAccents preset="hero" />
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% -8%, rgba(19,96,71,0.40), transparent 36%), radial-gradient(circle at 88% 8%, rgba(217,190,122,0.16), transparent 30%), linear-gradient(180deg, rgba(8,30,22,0.55) 0%, transparent 35%, rgba(0,0,0,0.45) 100%)'
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-gs-green/22 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-[#d9be7a]/12 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent"
      />

      <m.div
        className="relative z-[1] mx-auto max-w-[860px] text-center"
        variants={heroContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <m.span
          variants={heroItemVariants}
          className="extras-kicker inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-[#0a1f14]/70 px-4 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_24px_rgba(217,190,122,0.18)] sm:text-[0.74rem]"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {extrasCopy.eyebrow}
        </m.span>

        <m.div
          aria-hidden="true"
          variants={heroItemVariants}
          className="mx-auto mt-5 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
        />

        <m.div variants={heroItemVariants} className="mt-6">
          <TitleWithAccent />
        </m.div>

        <m.p
          variants={heroItemVariants}
          className="mx-auto mt-6 max-w-2xl text-balance font-ge text-[0.92rem] font-semibold uppercase tracking-[0.2em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-[1rem]"
        >
          {extrasCopy.lead}
        </m.p>

        <m.p
          variants={heroItemVariants}
          className="mx-auto mt-4 max-w-2xl font-ge text-[1.04rem] leading-[1.75] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-[1.1rem] sm:leading-8"
        >
          {extrasCopy.body}
        </m.p>

        <m.p
          variants={heroItemVariants}
          className="mt-7 inline-flex items-center gap-3 font-ge text-[0.82rem] font-extrabold uppercase tracking-[0.2em] text-white sm:text-[0.88rem]"
        >
          <span aria-hidden data-keep-color className="h-px w-7 bg-[#d9be7a]/65" />
          {extrasCopy.subtitle}
          <span aria-hidden data-keep-color className="h-px w-7 bg-[#d9be7a]/65" />
        </m.p>
      </m.div>

      <div className="relative z-[1] mx-auto mt-12 grid max-w-[1080px] grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {extras.map(({ title, icon: Icon, detail, note }, index) => (
          <m.article
            key={title}
            className="group relative flex flex-col items-center overflow-hidden rounded-[1.65rem] border border-white/14 bg-gradient-to-br from-[#0f3a2a] via-[#0c2e21] to-[#0a1f14] px-6 py-9 text-center shadow-[0_24px_56px_rgba(0,0,0,0.36)] ring-1 ring-chrome-300/15 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-[#d9be7a]/30 hover:shadow-[0_30px_70px_rgba(0,0,0,0.45)] sm:px-6 sm:py-10"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.06 * (index + 1) }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d9be7a]/65 to-transparent"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-px rounded-[1.65rem] bg-[radial-gradient(circle_at_50%_-10%,rgba(217,190,122,0.18),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <span
              data-keep-color
              className="relative inline-flex h-[4.65rem] w-[4.65rem] items-center justify-center rounded-2xl border-2 border-[#f4dfa6]/70 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] text-white shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_28px_rgba(217,190,122,0.32)] ring-2 ring-white/20 transition-transform duration-500 group-hover:scale-[1.05]"
            >
              <Icon
                className="h-[1.85rem] w-[1.85rem] drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                strokeWidth={2.4}
                aria-hidden="true"
              />
            </span>

            <h3 className="mt-6 font-ge text-[1.08rem] font-extrabold uppercase tracking-[0.08em] text-white sm:text-[1.12rem]">
              {title}
            </h3>

            <p className="mt-3 max-w-[18rem] font-ge text-[0.95rem] leading-[1.6] tracking-[0.01em] text-white sm:text-[0.98rem]">
              {detail}
            </p>

            <span className="extras-badge mt-5 inline-flex items-center rounded-full border border-[#f4dfa6]/60 bg-[#0a1f14]/85 px-3.5 py-1.5 font-ge text-[0.74rem] font-extrabold uppercase tracking-[0.16em] shadow-[0_0_22px_rgba(217,190,122,0.22)]">
              {note}
            </span>

            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#136047] via-[#d9be7a] to-[#136047] transition-transform duration-500 group-hover:scale-x-100"
            />
          </m.article>
        ))}
      </div>

      <m.div
        {...fadeUp}
        className="relative z-[1] mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 overflow-hidden rounded-[1.5rem] border border-white/12 bg-forest-950 px-6 py-7 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:px-9"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[18%] top-0 flex justify-center"
        >
          <div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" />
        </span>
        <p className="font-ge text-[1.12rem] font-extrabold uppercase tracking-[0.08em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] sm:text-[1.24rem]">
          {extrasCopy.closerTitle}
        </p>
        <p className="max-w-2xl font-ge text-[1rem] leading-[1.7] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] sm:text-[1.04rem]">
          {extrasCopy.closerBody}
        </p>
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <GeButton href="/contact" variant="gs-green" size="md" className="w-full sm:w-auto">
            {extrasCopy.primaryCta}
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </GeButton>
          <GeButton
            href="/#design-package"
            variant="outline-gs-white"
            size="md"
            className="w-full sm:w-auto"
          >
            {extrasCopy.secondaryCta}
          </GeButton>
        </div>
      </m.div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.35) 18%, #136047 40%, #d9be7a 50%, #136047 60%, rgba(217,190,122,0.35) 82%, transparent 100%)'
        }}
      />
    </GeSection>
  )
}
