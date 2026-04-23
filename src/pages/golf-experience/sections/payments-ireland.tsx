import { motion } from 'framer-motion'
import { Euro, Lock, MapPin, ShieldCheck } from 'lucide-react'

/**
 * Trust band that sits between the hero and the "Design Your Trip" step
 * cards. Bridges the dark hero into the green design section while
 * communicating the single most important reassurance for Irish golfers:
 * "Your money never leaves Ireland". Visually shares the gold/green
 * palette with the crest + hero so it feels native to the page.
 *
 * Built with:
 *  - Solid gs-dark backdrop with a soft top→bottom green→dark green vignette
 *  - Gold hairline rules top + bottom (echoes the hero's ribbon edges)
 *  - Irish flag chip (green / white / orange) as the pre-headline accent
 *  - Shield icon + bright gold headline anchored centre-left
 *  - Four trust pills: Irish IBAN · EUR pricing · SEPA · 256-bit SSL
 *  - Subtle animated reveals on scroll
 */

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

const trustPills: ReadonlyArray<{
  readonly icon: typeof ShieldCheck
  readonly title: string
  readonly subtitle: string
}> = [
  {
    icon: MapPin,
    title: 'Irish IBAN',
    subtitle: 'AIB / BOI account'
  },
  {
    icon: Euro,
    title: 'Priced in EUR',
    subtitle: 'No FX surprises'
  },
  {
    icon: ShieldCheck,
    title: 'SEPA Protected',
    subtitle: 'Standard EU bank transfer'
  },
  {
    icon: Lock,
    title: '256-bit SSL',
    subtitle: 'Encrypted card payments'
  }
]

/**
 * Minimal tricolour pill — green, white, orange vertical bars inside a
 * rounded capsule. Pure CSS, no SVG fetch, scales with the parent font-size.
 */
function IrishTricolour({ className }: { readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={
        'inline-flex h-4 w-6 overflow-hidden rounded-[3px] shadow-[0_1px_4px_rgba(0,0,0,0.4)] ring-1 ring-white/30 ' +
        (className ?? '')
      }
    >
      <span className="block h-full w-1/3 bg-[#169B62]" />
      <span className="block h-full w-1/3 bg-white" />
      <span className="block h-full w-1/3 bg-[#FF883E]" />
    </span>
  )
}

export function GePaymentsIreland() {
  return (
    <section
      id="payments-ireland"
      aria-labelledby="payments-ireland-title"
      className="relative isolate overflow-hidden bg-[#f5f1e6] text-gs-dark"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 18% 0%, rgba(255,199,44,0.26) 0%, rgba(255,199,44,0) 42%), radial-gradient(ellipse at 82% 20%, rgba(6,59,42,0.08) 0%, rgba(6,59,42,0) 38%), linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(245,241,230,0.96) 55%, rgba(238,230,212,0.94) 100%)'
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0px, transparent 14px, #FFC72C 14px, #FFC72C 15px)'
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #FFC72C 25%, #FFE27A 50%, #FFC72C 75%, transparent 100%)'
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #FFC72C 25%, #FFE27A 50%, #FFC72C 75%, transparent 100%)'
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-12 sm:px-8 sm:py-14 md:gap-10 md:py-16">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gs-dark px-6 py-8 text-white shadow-[0_26px_70px_rgba(6,59,42,0.22)] sm:px-8 sm:py-10"
          {...fadeUp}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,199,44,0.28),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_28%),linear-gradient(135deg,_rgba(6,59,42,0.96),_rgba(8,44,33,0.93)_48%,_rgba(10,30,22,0.96)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-gs-gold/90 to-transparent"
          />
          <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-gs-gold/45 bg-white/6 px-3 py-1.5 backdrop-blur-sm">
                <IrishTricolour />
                <span className="font-ge text-xs font-extrabold uppercase tracking-[0.2em] text-gs-gold sm:text-[0.78rem]">
                  Irish-owned · paid in Ireland
                </span>
              </span>

              <h2
                id="payments-ireland-title"
                className="mt-4 flex items-center gap-3 font-ge text-[1.7rem] font-extrabold leading-tight text-white sm:text-[1.95rem] md:text-[2.2rem]"
              >
                <ShieldCheck
                  className="h-7 w-7 shrink-0 text-gs-gold drop-shadow-[0_4px_10px_rgba(255,199,44,0.5)] sm:h-8 sm:w-8"
                  aria-hidden="true"
                  strokeWidth={2.4}
                />
                <span>
                  All payments handled <span className="text-gs-gold">in Ireland.</span>
                </span>
              </h2>

              <p className="mt-3 max-w-2xl font-ge text-base leading-7 text-white/86 sm:text-[1rem]">
                Your money goes straight into our Irish bank account — no card details ever leave the country. Priced in EUR,
                settled by SEPA, invoiced from Ireland. The way an Irish golf trip should be.
              </p>
            </div>

            <div className="w-full max-w-[18rem] rounded-[1.6rem] border border-white/12 bg-white/[0.08] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm">
              <p className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gs-gold/88">What this means</p>
              <p className="mt-2 font-ge text-[1rem] leading-7 text-white/84">
                Clear euro pricing, Irish banking, and one accountable team instead of fragmented supplier payments.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-[0.78fr_0.22fr] lg:items-start"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        >
          <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:gap-3.5">
            {trustPills.map(({ icon: Icon, title, subtitle }, idx) => (
              <motion.li
                key={title}
                className="group relative flex items-center gap-3 overflow-hidden rounded-[1.35rem] border border-[#e3d6b7] bg-white/88 px-4 py-3.5 shadow-[0_16px_40px_rgba(69,53,24,0.09)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gs-gold/60 hover:shadow-[0_20px_45px_rgba(69,53,24,0.14)]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.18 + idx * 0.06 }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gs-gold to-[#f4b41a] text-gs-dark shadow-[0_6px_14px_rgba(255,199,44,0.25)]"
                >
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="font-ge text-base font-extrabold text-gs-dark sm:text-[0.95rem]">{title}</p>
                  <p className="mt-0.5 font-ge text-sm text-ge-gray500 sm:text-[0.78rem]">{subtitle}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="rounded-[1.5rem] border border-[#e3d6b7] bg-white/78 p-5 shadow-[0_16px_40px_rgba(69,53,24,0.08)]">
            <p className="font-ge text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ge-gray500">Protected flow</p>
            <p className="mt-3 font-ge text-[1rem] leading-7 text-gs-dark">
              We keep the financial side calm and legible so organisers can focus on dates, golf, and the group.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
