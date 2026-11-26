import { m, type Variants } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { IrelandPaymentsTrust } from '../../../components/ireland-payments-trust'
import { WhatsAppPill } from '../../../components/whatsapp/WhatsAppPill'
import { GeDualPhoneEnquiryCallRow } from '../components/ge-dual-phone-contact'
import { GeQuickEnquiryForm } from '../components/ge-quick-enquiry-form'
import { GeSection } from '../components/ge-section'
import { leanEnquiryFormConfig } from '../data/lean-enquiry-fields'

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

const homeQuoteFormConfig = leanEnquiryFormConfig({
  badge: 'Get a quote',
  submitLabel: 'Send enquiry',
  successTitle: 'Enquiry received',
  successBody: 'Thanks — we will reply from Ireland with the next clear step for your Costa del Sol golf trip.',
  includeBundle: true,
  notesPlaceholder: 'Anything else — courses, hotel style, flights…'
})

const reassuranceLines = [
  'Tee times, transfers and routing handled by one Irish team',
  'Irish & Spanish phone lines — WhatsApp for quick questions',
  'Quote inside 24 hours · No booking fee, no obligation'
] as const

export function GeHomeEnquiry() {

  return (
    <GeSection
      id="enquire"
      background="white"
      innerClassName="relative !pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_62%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-gs-green/[0.07] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-700/[0.1] blur-[90px]"
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
        <m.div
          variants={heroContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <m.span
            variants={heroItemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-brand-700/35 bg-white px-4 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] text-gs-green shadow-[0_8px_22px_rgba(6,59,42,0.08)] sm:text-[0.74rem]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
            Get a quote
          </m.span>

          <m.span
            aria-hidden="true"
            variants={heroItemVariants}
            className="mt-5 mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
          />

          <m.h2
            variants={heroItemVariants}
            className="mt-5 max-w-[20ch] font-ge text-[2.15rem] font-extrabold leading-[1.04] tracking-[-0.005em] text-gs-dark sm:max-w-3xl sm:text-[2.85rem] lg:text-[3.05rem]"
          >
            <span className="text-gs-dark">Send the trip shape.</span>{' '}
            <span className="text-gs-green">We&apos;ll build the clean route.</span>
          </m.h2>

          <m.p
            variants={heroItemVariants}
            className="mt-5 max-w-2xl font-ge text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-gs-green sm:text-[0.98rem]"
          >
            Name · Dates · Golfers · Bundle
          </m.p>

          <m.p
            variants={heroItemVariants}
            className="mt-4 max-w-2xl font-ge text-[1.06rem] leading-[1.7] text-gs-dark/85 sm:text-[1.12rem] sm:leading-8"
          >
            Essentials only. Your enquiry goes straight to the GolfSol crew — back with prices and a clean next step, usually inside 24 hours.
          </m.p>

          <m.div variants={heroItemVariants} className="mt-7 flex flex-col gap-3">
            <GeDualPhoneEnquiryCallRow />
            <WhatsAppPill
              context={{ sourcePage: '/', componentVariant: 'contact', enquiryType: 'quote' }}
              fullWidth
              message="Hi GolfSol Ireland — I would like help planning a Costa del Sol golf trip."
              tone="light"
            />
            <IrelandPaymentsTrust tone="muted" />
          </m.div>

          <m.div variants={heroItemVariants} className="relative mt-9">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-px flex justify-center"
            ><div className="mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent" /></span>
            <ul className="space-y-3 pt-7">
              {reassuranceLines.map((line) => (
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

        <m.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-[2.15rem] bg-gradient-to-br from-brand-700/10 via-transparent to-[#d9be7a]/10"
          />
          <div className="relative">
            <GeQuickEnquiryForm
              title="Get your Costa del Sol quote"
              lead="Name, contact, dates, golfers — that is enough to start."
              interestPreset="HOMEPAGE — Costa del Sol golf trip quote"
              routeLabel="Homepage"
              formConfig={homeQuoteFormConfig}
            />
          </div>
        </m.div>
      </div>
    </GeSection>
  )
}
