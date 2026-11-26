import { m } from 'framer-motion'
import { IrelandPaymentsTrust } from '../../../components/ireland-payments-trust'
import { WEBSITE_ENQUIRY_FORM } from '../../../lib/enquiry-form-registry'
import { SmartTripQuoteForm } from '../components/smart-trip-quote-form'
import { GeSection } from '../components/ge-section'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

/** Lean homepage enquire — one headline, short lead, one form. WhatsApp lives in the site banner. */
export function GeHomeEnquiry() {
  return (
    <GeSection
      id="enquire"
      background="white"
      innerClassName="relative !pt-14 pb-16 sm:!pt-16 sm:pb-20 scroll-mt-28"
      className="relative isolate overflow-hidden bg-slate-50"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
        <m.div {...fadeUp}>
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-gs-green">
            Get a quote
          </p>
          <h2 className="mt-3 font-ge text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em] text-gs-dark sm:text-[2rem]">
            Send the trip shape. We&apos;ll build the clean route.
          </h2>
          <p className="mt-3 max-w-md font-ge text-[1.02rem] leading-7 text-ge-gray600">
            Choose transfers, hotels, and golf — we reply from Ireland with clear options, usually inside 24 hours.
          </p>
          <IrelandPaymentsTrust className="mt-6" tone="muted" />
        </m.div>

        <m.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
          <SmartTripQuoteForm
            formId="home-enquire-form"
            lead="What do you need? Only those fields appear next."
            preset={{
              pageLabel: '/',
              formKey: WEBSITE_ENQUIRY_FORM.contentQuickEnquiry
            }}
            title="Get your Costa del Sol quote"
          />
        </m.div>
      </div>
    </GeSection>
  )
}
