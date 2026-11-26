import { m } from 'framer-motion'
import { IrelandPaymentsTrust } from '../../../components/ireland-payments-trust'
import { GeSection } from '../components/ge-section'
import { NewsletterSubscribeForm } from '../../../components/newsletter-subscribe-form'
import { WEBSITE_ENQUIRY_FORM } from '../../../lib/enquiry-form-registry'
import { GeQuickEnquiryForm } from '../components/ge-quick-enquiry-form'
import { SmartTripQuoteForm } from '../components/smart-trip-quote-form'
import type { ContentFormConfig } from '../content-page-context'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export type GeContentEnquireBlockProps = {
  readonly eyebrow: string
  readonly title: string
  readonly body: string
  readonly reassurances?: readonly string[]
  readonly formTitle: string
  readonly formLead: string
  readonly interestPreset: string
  readonly routeLabel: string
  readonly formConfig: ContentFormConfig
  readonly variant?: 'enquiry' | 'newsletter'
}

/** Lean enquire block — one headline, short lead, one form. WhatsApp lives in the site banner. */
export function GeContentEnquireBlock({
  eyebrow,
  title,
  body,
  formTitle,
  formLead,
  interestPreset,
  routeLabel,
  formConfig,
  variant = 'enquiry'
}: GeContentEnquireBlockProps) {
  const isNewsletter = variant === 'newsletter'

  return (
    <GeSection
      id="ge-content-enquire"
      background="white"
      innerClassName="relative !pt-14 pb-16 sm:!pt-16 sm:pb-20 scroll-mt-28"
      className="relative isolate overflow-hidden bg-slate-50"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
        <m.div {...fadeUp}>
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-gs-green">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em] text-gs-dark sm:text-[2rem]">
            {title}
          </h2>
          <p className="mt-3 max-w-md font-ge text-[1.02rem] leading-7 text-ge-gray600">{body}</p>
          {isNewsletter ? null : <IrelandPaymentsTrust className="mt-6" tone="muted" />}
        </m.div>

        <m.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
          {isNewsletter ? (
            <NewsletterSubscribeForm title={formTitle} lead={formLead} />
          ) : formConfig.submissionKind === 'testimonial' ? (
            <GeQuickEnquiryForm
              title={formTitle}
              lead={formLead}
              interestPreset={interestPreset}
              routeLabel={routeLabel}
              formConfig={formConfig}
            />
          ) : (
            <SmartTripQuoteForm
              formId={`content-enquire-${routeLabel.replace(/\W+/g, '-').toLowerCase()}`}
              lead={formLead || 'What do you need? Only those fields appear next.'}
              preset={{
                pageLabel: routeLabel,
                formKey: WEBSITE_ENQUIRY_FORM.contentQuickEnquiry
              }}
              title={formTitle}
            />
          )}
        </m.div>
      </div>
    </GeSection>
  )
}
