import { m, type Variants } from 'framer-motion'
import { CheckCircle2, MessageCircle, Sparkles } from 'lucide-react'
import { GeDualPhoneEnquiryCallRow } from '../components/ge-dual-phone-contact'
import { GeSection } from '../components/ge-section'
import { TransportHeroEnquiryForm } from '../components/transport-hero-enquiry-form'
import { contactInfo } from '../data/copy'
import { transportEnquireBlockCopy } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const heroContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } }
}

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: 'easeOut' } }
}

/**
 * Bottom-of-page enquiry block — same editorial layout as the homepage
 * "Get a quote" section (kicker pill, accent bar, two-tone uppercase
 * headline, supporting kicker line, body, dual phone CTA, WhatsApp CTA,
 * gold-rim reassurance ticks). The form on the right keeps the existing
 * transport-specific fields (collection point, destination, ASAP, etc.)
 * but sits inside a softer cream→white cradle with a gradient halo so
 * the gold corners on the form card pop without competing with the dark
 * green journey section above it.
 */
export function TransportEnquireBlock() {
  const whatsappHref = `https://wa.me/${contactInfo.phoneTel.replace('+', '')}?text=${encodeURIComponent(
    'Hi GolfSol — looking for a Costa del Sol golf transfer.'
  )}`

  return (
    <GeSection
      id="transport-enquire"
      background="white"
      innerClassName="relative !pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_62%)]"
    >
      {/* Editorial halos & top hairline — matches home enquiry */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-gs-green/[0.07] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-700/[0.1] blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-700/35 to-transparent"
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
        {/* —— Left column: editorial header + CTAs + reassurances —— */}
        <m.div
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Kicker pill (was a flat eyebrow line) */}
          <m.span
            variants={heroItemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/35 bg-white/95 px-4 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] text-gs-green shadow-[0_8px_22px_rgba(6,59,42,0.08)] backdrop-blur-sm sm:text-[0.74rem]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
            {transportEnquireBlockCopy.eyebrow}
          </m.span>

          {/* Brand-green→gold accent bar */}
          <m.span
            aria-hidden="true"
            variants={heroItemVariants}
            className="mt-5 block h-[2px] w-20 origin-left rounded-full bg-gradient-to-r from-brand-800 via-brand-600 to-transparent"
          />

          {/* Two-tone uppercase headline */}
          <m.h2
            variants={heroItemVariants}
            className="mt-5 max-w-[20ch] font-ge text-[2.05rem] font-extrabold uppercase leading-[1.05] tracking-[0.005em] text-gs-dark sm:max-w-3xl sm:text-[2.7rem] lg:text-[2.95rem]"
          >
            <span className="text-gs-dark">Send the run.</span>{' '}
            <span className="text-gs-green">We come back with times and a clear price.</span>
          </m.h2>

          {/* Supporting uppercase kicker line */}
          <m.p
            variants={heroItemVariants}
            className="mt-5 max-w-2xl font-ge text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-gs-green sm:text-[0.98rem]"
          >
            Flight · Dates · Destination · How many in the group
          </m.p>

          {/* Body */}
          <m.p
            variants={heroItemVariants}
            className="mt-4 max-w-2xl font-ge text-[1.06rem] leading-[1.7] text-gs-dark/85 sm:text-[1.12rem] sm:leading-8"
          >
            {transportEnquireBlockCopy.body}
          </m.p>

          {/* Dual phone + WhatsApp CTA cluster — mirrors home enquiry */}
          <m.div variants={heroItemVariants} className="mt-7 flex flex-col gap-3">
            <GeDualPhoneEnquiryCallRow />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[#25D366]/70 bg-white px-5 font-ge text-[1rem] font-bold uppercase tracking-[0.11em] text-[#0f7a3a] shadow-[0_0_18px_rgba(37,211,102,0.18)] transition-all hover:bg-[#25D366] hover:text-white hover:shadow-[0_0_28px_rgba(37,211,102,0.3)] sm:text-[1rem]"
            >
              <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden />
              WhatsApp us (Irish number)
            </a>
          </m.div>

          {/* Gold-rim forest reassurance ticks (replaces flat green CheckCircle2 list) */}
          <m.div variants={heroItemVariants} className="relative mt-9">
            <span
              aria-hidden="true"
              className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-700/55 to-transparent"
            />
            <ul className="space-y-3 pt-7">
              {transportEnquireBlockCopy.reassurances.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 font-ge text-[1.04rem] leading-7 text-gs-dark sm:text-[1.06rem]"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#136047] to-[#0c3527] text-white shadow-[0_4px_10px_rgba(6,59,42,0.25)] ring-1 ring-[#f4dfa6]/40">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </m.div>
        </m.div>

        {/* —— Right column: existing transport form, in a brand→gold halo cradle —— */}
        <m.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.12 }}
          className="relative"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-[2.15rem] bg-gradient-to-br from-brand-700/10 via-transparent to-[#d9be7a]/10"
          />
          <div className="relative">
            <TransportHeroEnquiryForm />
          </div>
        </m.div>
      </div>
    </GeSection>
  )
}
