import { m, type Variants } from 'framer-motion'
import { GeGoldDividerLineAbsoluteTop } from '../../../components/ge-gold-divider-line'
import { Euro, Lock, MapPin, ShieldCheck } from 'lucide-react'

/**
 * Trust band — "All payments handled in Ireland."
 *
 * Premium pattern (matches homepage extras-strip / transport-route):
 *  - Cream-warm outer band with chrome hairlines and a soft Irish-green halo
 *  - Dark forest "Irish payments" panel inside, with:
 *      • Gold kicker pill ("Irish-owned · paid in Ireland") — tricolour + cream-gold text
 *      • Two-tone uppercase headline (white + gold-gradient text-clip on "in Ireland.")
 *      • Gold shield icon (was forest-on-forest = invisible)
 *      • Aside "What this means" panel with gold-cream kicker
 *  - Four trust pills on the cream surface — gold-rim forest icon tiles with white icons,
 *    chrome rings, hover lift, soft halos
 *  - Stagger reveals on scroll for the panel + each pill
 *
 * Fixes the dark-on-dark legibility issues that were making every
 * accent inside the dark panel disappear.
 */

const panelStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
  }
}

const panelItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }
  }
}

const pillStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.18 }
  }
}

const pillItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }
  }
}

const trustPills: ReadonlyArray<{
  readonly icon: typeof ShieldCheck
  readonly title: string
  readonly subtitle: string
}> = [
  { icon: MapPin, title: 'Irish IBAN', subtitle: 'AIB / BOI account' },
  { icon: Euro, title: 'Priced in EUR', subtitle: 'No FX surprises' },
  { icon: ShieldCheck, title: 'SEPA Protected', subtitle: 'Standard EU bank transfer' },
  { icon: Lock, title: '256-bit SSL', subtitle: 'Encrypted card payments' }
]

/**
 * Minimal vertical Irish tricolour — green / white / orange capsule.
 */
function IrishTricolour({ className }: { readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={
        'inline-flex h-4 w-6 overflow-hidden rounded-[3px] shadow-[0_1px_4px_rgba(0,0,0,0.4)] ring-1 ring-white/35 ' +
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
      className="payments-ireland relative isolate overflow-hidden bg-[#faf6ee] text-gs-dark"
    >
      {/* Top + bottom chrome-gold hairline rules */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #136047 22%, #d9be7a 50%, #136047 78%, transparent 100%)'
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #136047 22%, #d9be7a 50%, #136047 78%, transparent 100%)'
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1180px] flex-col gap-9 px-5 py-14 sm:px-8 sm:py-16 md:gap-11 md:py-20">
        {/* —— Dark forest payments panel —— */}
        <m.div
          className="ge-on-dark relative overflow-hidden rounded-[2rem] border border-[#d9be7a]/35 px-6 py-9 text-white shadow-[0_28px_70px_rgba(6,59,42,0.28),0_0_36px_rgba(217,190,122,0.12)] ring-1 ring-white/8 sm:px-9 sm:py-11"
          variants={panelStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          style={{
            background:
              'radial-gradient(circle at 14% 8%, rgba(19,96,71,0.40), transparent 36%), radial-gradient(circle at 88% 92%, rgba(217,190,122,0.16), transparent 38%), linear-gradient(135deg, #0d3a2a 0%, #0a2d20 50%, #08231a 100%)'
          }}
        >
          {/* Top + bottom inner gold hairlines */}
          <GeGoldDividerLineAbsoluteTop />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8%] bottom-0 h-px bg-gradient-to-r from-transparent via-[#f4dfa6]/35 to-transparent"
          />
          {/* Soft halos */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,190,122,0.18),transparent_70%)] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(11,107,69,0.34),transparent_72%)] blur-3xl"
          />

          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="max-w-3xl">
              {/* Gold kicker pill — tricolour + cream-gold text (was forest-on-forest = invisible) */}
              <m.span
                variants={panelItem}
                className="ge-on-dark-kicker inline-flex items-center gap-2 rounded-full border border-[#f4dfa6]/55 bg-forest-900 px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_22px_rgba(217,190,122,0.18)]"
                data-keep-color
                style={{ color: '#fbe8b5' }}
              >
                <IrishTricolour />
                <span
                  className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] sm:text-[0.74rem]"
                  data-keep-color
                  style={{ color: '#fbe8b5' }}
                >
                  Irish-owned · paid in Ireland
                </span>
              </m.span>

              {/* Accent bar */}
              <m.span
                aria-hidden="true"
                variants={panelItem}
                className="mt-5 h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
              />

              <m.h2
                id="payments-ireland-title"
                variants={panelItem}
                className="mt-5 flex items-center gap-3 font-ge text-[1.7rem] font-extrabold uppercase leading-[1.08] tracking-[0.01em] drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] sm:text-[2rem] md:text-[2.25rem]"
                style={{ color: '#ffffff' }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#f4dfa6]/55 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] shadow-[0_10px_22px_rgba(6,59,42,0.45),0_0_18px_rgba(217,190,122,0.22)] ring-1 ring-white/15 sm:h-12 sm:w-12"
                >
                  <ShieldCheck
                    className="h-5 w-5 sm:h-[1.45rem] sm:w-[1.45rem]"
                    aria-hidden="true"
                    strokeWidth={2.4}
                    style={{ color: '#fbe8b5' }}
                  />
                </span>
                <span>
                  <span style={{ color: '#ffffff' }}>All payments handled </span>
                  <span
                    className="bg-clip-text"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 45%, #d9be7a 100%)',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    in Ireland.
                  </span>
                </span>
              </m.h2>

              <m.p
                variants={panelItem}
                className="mt-5 max-w-2xl font-ge text-[1.02rem] leading-[1.72] sm:text-[1.06rem]"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                Your money goes straight into our Irish bank account &mdash; no
                card details ever leave the country. Priced in EUR, settled by
                SEPA, invoiced from Ireland. The way an Irish golf trip should
                be.
              </m.p>
            </div>

            {/* Aside — "What this means" — gold kicker + crisp body */}
            <m.div
              variants={panelItem}
              className="w-full max-w-[18rem] rounded-[1.6rem] border border-[#f4dfa6]/35 bg-forest-900 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] ring-1 ring-white/10"
            >
              <p
                className="ge-on-dark-kicker font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em]"
                data-keep-color
                style={{ color: '#fbe8b5' }}
              >
                What this means
              </p>
              <span
                aria-hidden="true"
                className="mt-3 block h-px w-10 bg-gradient-to-r from-[#f4dfa6]/80 to-transparent"
              />
              <p
                className="mt-3 font-ge text-[0.98rem] leading-[1.7]"
                style={{ color: 'rgba(255,255,255,0.94)' }}
              >
                Clear euro pricing, Irish banking, and one accountable team
                instead of fragmented supplier payments.
              </p>
            </m.div>
          </div>
        </m.div>

        {/* —— Trust pills + protected-flow card —— */}
        <m.div
          className="grid gap-6 lg:grid-cols-[0.78fr_0.22fr] lg:items-start"
          variants={pillStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <ul className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:gap-4">
            {trustPills.map(({ icon: Icon, title, subtitle }) => (
              <m.li
                key={title}
                variants={pillItem}
                className="group relative flex items-center gap-3.5 overflow-hidden rounded-[1.4rem] border border-gs-green/15 bg-white px-4 py-4 shadow-[0_14px_32px_rgba(6,32,22,0.08)] ring-1 ring-chrome-300/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9be7a]/55 hover:shadow-[0_20px_44px_rgba(6,32,22,0.14),0_0_22px_rgba(217,190,122,0.18)]"
              >
                {/* Top hairline */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
                ><div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" />
        </span>
                {/* Soft halo */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-brand-700/[0.06] blur-3xl"
                />

                {/* Icon tile — was charcoal-on-green (invisible) → now white-on-forest with gold rim */}
                <span
                  aria-hidden="true"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d9be7a]/55 bg-gradient-to-br from-[#1a7a59] via-[#136047] to-[#0c3527] shadow-[0_8px_18px_rgba(6,59,42,0.32),0_0_14px_rgba(217,190,122,0.22)] ring-1 ring-white/15"
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.4} aria-hidden />
                </span>

                <div className="min-w-0 leading-tight">
                  <p className="font-ge text-[0.98rem] font-extrabold uppercase tracking-[0.04em] text-gs-dark">
                    {title}
                  </p>
                  <p className="mt-1 font-ge text-[0.82rem] text-ge-gray500">
                    {subtitle}
                  </p>
                </div>

                {/* Bottom gold accent grows on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(217,190,122,0.55) 18%, #136047 38%, #f4dfa6 50%, #136047 62%, rgba(217,190,122,0.55) 82%, transparent 100%)'
                  }}
                />
              </m.li>
            ))}
          </ul>

          <m.div
            variants={pillItem}
            className="relative overflow-hidden rounded-[1.5rem] border border-gs-green/15 bg-white p-6 shadow-[0_14px_32px_rgba(6,32,22,0.08)] ring-1 ring-chrome-300/70"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
            ><div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" />
        </span>
            <p className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-gs-green">
              Protected flow
            </p>
            <span
              aria-hidden="true"
              className="mt-3 block h-px w-10 bg-gradient-to-r from-brand-700/55 to-transparent"
            />
            <p className="mt-3 font-ge text-[0.98rem] leading-[1.7] text-gs-dark/86">
              We keep the financial side calm and legible so organisers can
              focus on dates, golf, and the group.
            </p>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
