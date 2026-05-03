import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { GeDualPhoneEnquiryCallRow } from '../components/ge-dual-phone-contact'
import { GeQuickEnquiryForm } from '../components/ge-quick-enquiry-form'
import { GeSection } from '../components/ge-section'
import { contactInfo } from '../data/copy'
import type { ContentFormConfig } from '../content-page-context'
import { golferGroupSizeSelectOptions } from '../data/form-people-options'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const homeQuoteFormConfig = {
  badge: 'Start your quote',
  submitLabel: 'Send my trip brief',
  successTitle: 'Trip brief received',
  successBody: 'Thanks. We will reply from Ireland with the clearest next step for your Costa del Sol golf trip.',
  fields: [
    {
      id: 'tripArrivalMode',
      label: 'Trip timing',
      type: 'select',
      required: true,
      options: [
        { label: 'I have travel dates (arrival and departure)', value: 'planned' },
        { label: 'Already at Málaga (AGP) — need transfers now', value: 'already_at_agp' }
      ]
    },
    { id: 'travelDateFrom', label: 'Travel start date', type: 'date', required: false },
    { id: 'travelDateTo', label: 'Travel end date', type: 'date', required: false },
    {
      id: 'groupSize',
      label: 'Group size',
      type: 'select',
      required: true,
      options: golferGroupSizeSelectOptions
    },
    {
      id: 'tripType',
      label: 'What do you need?',
      type: 'select',
      required: true,
      options: [
        { label: 'Full trip: golf, transfers and planning', value: 'Full trip: golf, transfers and planning' },
        { label: 'Airport transfers only', value: 'Airport transfers only' },
        { label: 'Golf and tee times', value: 'Golf and tee times' }
      ]
    },
    {
      id: 'preferredBase',
      label: 'Preferred location',
      type: 'select',
      options: [
        { label: 'Fuengirola', value: 'Fuengirola' },
        { label: 'Torremolinos', value: 'Torremolinos' },
        { label: 'Marbella', value: 'Marbella' },
        { label: 'Vélez-Málaga', value: 'Vélez-Málaga' },
        { label: 'Sotogrande', value: 'Sotogrande' },
        { label: 'Need advice', value: 'Need advice' }
      ]
    },
    {
      id: 'notes',
      label: 'Trip brief',
      type: 'textarea',
      placeholder: 'Tell us number of rounds, must-play courses, airport transfer needs, budget band, or anything already booked.',
      rows: 5
    }
  ]
} as const satisfies ContentFormConfig

const reassuranceLines = [
  'Airport transfers, tee times and routing handled together',
  'Irish & Spanish phone lines — WhatsApp on the Irish number',
  'No-obligation quote before anything is booked'
] as const

export function GeHomeEnquiry() {
  const whatsappHref = `https://wa.me/${contactInfo.phoneTel.replace('+', '')}?text=${encodeURIComponent(
    'Hi GolfSol Ireland — I would like help planning a Costa del Sol golf trip.'
  )}`

  return (
    <GeSection
      id="enquire"
      background="white"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_62%)]"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
        <motion.div {...fadeUp}>
          <p className="font-ge text-[0.95rem] font-bold uppercase tracking-[0.16em] text-ge-orange sm:text-[1rem]">
            Get a quote
          </p>
          <h2 className="mt-3 font-ge text-[2.15rem] font-extrabold leading-[1.05] tracking-[0.005em] text-gs-green sm:text-[2.7rem]">
            Send the trip shape. We will build the clean route.
          </h2>
          <p className="mt-5 font-ge text-[1.08rem] leading-8 text-ge-gray500 sm:text-[1.12rem] sm:leading-8">
            Tell us dates, group size and what is already booked. Your enquiry goes straight into the GolfSol workflow, with a branded
            confirmation email and admin copy for follow-up.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <GeDualPhoneEnquiryCallRow />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border-2 border-gs-green bg-white px-5 font-ge text-[1rem] font-bold uppercase tracking-[0.11em] text-gs-green transition-all hover:bg-gs-green hover:text-white sm:text-[1rem]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp us (Irish number)
            </a>
          </div>

          <ul className="mt-8 space-y-3 border-t border-gs-dark/10 pt-6">
            {reassuranceLines.map((line) => (
              <li key={line} className="flex items-start gap-3 font-ge text-[1.04rem] leading-7 text-gs-dark sm:text-[1.06rem]">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <GeQuickEnquiryForm
            title="Start your Costa del Sol quote"
            lead="A short brief is enough. We will fill in the details with you."
            interestPreset="HOMEPAGE — Costa del Sol golf trip quote"
            routeLabel="Homepage"
            formConfig={homeQuoteFormConfig}
          />
        </motion.div>
      </div>
    </GeSection>
  )
}
