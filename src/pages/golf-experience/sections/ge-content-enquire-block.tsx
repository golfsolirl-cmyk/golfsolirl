import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { GeQuickEnquiryForm } from '../components/ge-quick-enquiry-form'
import { contactInfo } from '../data/copy'
import type { ContentFormConfig } from '../content-page-context'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const defaultReassurances = [
  'Replies from Ireland · not a call centre',
  'No pressure — we clarify before you commit',
  'Group bookings welcome — societies and corporates'
] as const

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
}

/**
 * Foot enquiry band — mirrors {@link TransportEnquireBlock} layout while
 * hosting the configurable {@link GeQuickEnquiryForm} used across routes.
 */
export function GeContentEnquireBlock({
  eyebrow,
  title,
  body,
  reassurances = defaultReassurances,
  formTitle,
  formLead,
  interestPreset,
  routeLabel,
  formConfig
}: GeContentEnquireBlockProps) {
  const whatsappHref = `https://wa.me/${contactInfo.phoneTel.replace('+', '')}?text=${encodeURIComponent(
    'Hi GolfSol — I am on your website and would like help planning a Costa del Sol golf trip.'
  )}`

  return (
    <GeSection
      id="ge-content-enquire"
      background="white"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_60%)]"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
        <motion.div {...fadeUp}>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange sm:text-[0.85rem]">{eyebrow}</p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[0.01em] text-gs-green sm:text-[2.4rem] lg:text-[2.6rem]">{title}</h2>
          <p className="mt-5 font-ge text-base leading-7 text-ge-gray500 sm:text-[1.05rem] sm:leading-8">{body}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3">
            <a
              href={`tel:${contactInfo.phoneTel}`}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl bg-gs-green px-5 font-ge text-base font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(6,59,42,0.25)] transition-all hover:bg-gs-electric hover:text-gs-dark sm:text-[0.9rem]"
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span>{contactInfo.phoneDisplay}</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl border-2 border-gs-green bg-white px-5 font-ge text-base font-bold uppercase tracking-[0.12em] text-gs-green transition-all hover:bg-gs-green hover:text-white sm:text-[0.9rem]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp us
            </a>
          </div>

          <ul className="mt-8 space-y-3 border-t border-gs-dark/10 pt-6">
            {reassurances.map((line) => (
              <li key={line} className="flex items-start gap-3 font-ge text-base leading-7 text-gs-dark sm:text-[1rem]">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <GeQuickEnquiryForm
            title={formTitle}
            lead={formLead}
            interestPreset={interestPreset}
            routeLabel={routeLabel}
            formConfig={formConfig}
          />
        </motion.div>
      </div>
    </GeSection>
  )
}
