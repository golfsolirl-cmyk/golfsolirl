import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { GeQuickEnquiryForm } from '../components/ge-quick-enquiry-form'
import { GeSection } from '../components/ge-section'
import { contactInfo } from '../data/copy'
import type { ContentFormConfig } from '../content-page-context'

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
    { id: 'travelDates', label: 'Travel dates', placeholder: 'e.g. 15-19 Sept 2026', required: true },
    {
      id: 'groupSize',
      label: 'Group size',
      type: 'select',
      required: true,
      options: [
        { label: '2 golfers', value: '2 golfers' },
        { label: '4 golfers', value: '4 golfers' },
        { label: '8 golfers', value: '8 golfers' },
        { label: '12+ golfers', value: '12+ golfers' }
      ]
    },
    {
      id: 'tripType',
      label: 'What do you need?',
      type: 'select',
      required: true,
      options: [
        { label: 'Full package: golf, hotel and transfers', value: 'Full package: golf, hotel and transfers' },
        { label: 'Airport transfers only', value: 'Airport transfers only' },
        { label: 'Golf and tee times', value: 'Golf and tee times' },
        { label: 'Accommodation advice', value: 'Accommodation advice' }
      ]
    },
    {
      id: 'preferredBase',
      label: 'Preferred base',
      type: 'select',
      options: [
        { label: 'Fuengirola', value: 'Fuengirola' },
        { label: 'Torremolinos', value: 'Torremolinos' },
        { label: 'Marbella', value: 'Marbella' },
        { label: 'Sotogrande', value: 'Sotogrande' },
        { label: 'Need advice', value: 'Need advice' }
      ]
    },
    {
      id: 'notes',
      label: 'Trip brief',
      type: 'textarea',
      placeholder: 'Tell us the hotel level, number of rounds, must-play courses, airport transfer needs, or anything already booked.',
      rows: 5
    }
  ]
} as const satisfies ContentFormConfig

const reassuranceLines = [
  'Airport transfers, courses and hotels handled together',
  'Irish phone and WhatsApp follow-up',
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

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3">
            <a
              href={`tel:${contactInfo.phoneTel}`}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl bg-gs-green px-5 font-ge text-[1rem] font-bold uppercase tracking-[0.11em] text-white shadow-[0_12px_28px_rgba(6,59,42,0.25)] transition-all hover:bg-gs-electric hover:text-gs-dark"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {contactInfo.phoneDisplay}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl border-2 border-gs-green bg-white px-5 font-ge text-[1rem] font-bold uppercase tracking-[0.11em] text-gs-green transition-all hover:bg-gs-green hover:text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp us
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
