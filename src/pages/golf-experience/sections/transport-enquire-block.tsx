import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { SmartEnquiryButton } from '../components/smart-enquiry-button'
import { TransportHeroEnquiryForm } from '../components/transport-hero-enquiry-form'
import { contactInfo } from '../data/copy'
import { transportEnquireBlockCopy } from '../data/transport-service'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

/**
 * Bottom-of-page enquiry block — left column carries the reassurance copy,
 * direct contact buttons (call + WhatsApp), and three confidence ticks.
 * Right column hosts the transfer enquiry form. Soft cream background so
 * the gold-cornered form card pops without competing with the dark green
 * journey section above it.
 */
export function TransportEnquireBlock() {
  return (
    <GeSection
      id="transport-enquire"
      background="white"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_60%)]"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
        <motion.div {...fadeUp}>
          <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange sm:text-[0.85rem]">
            {transportEnquireBlockCopy.eyebrow}
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[0.01em] text-gs-green sm:text-[2.4rem] lg:text-[2.6rem]">
            {transportEnquireBlockCopy.title}
          </h2>
          <p className="mt-5 font-ge text-base leading-7 text-ge-gray500 sm:text-[1.05rem] sm:leading-8">
            {transportEnquireBlockCopy.body}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3">
            <a
              href={`tel:${contactInfo.phoneTel}`}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-xl bg-gs-green px-5 font-ge text-base font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(6,59,42,0.25)] transition-all hover:bg-gs-electric hover:text-gs-dark sm:text-[0.9rem]"
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span>{contactInfo.phoneDisplay}</span>
            </a>
            <SmartEnquiryButton
              intent="transport"
              sourceLabel="Transport enquiry block"
              label="WhatsApp a transfer brief"
              notes="Looking for a Costa del Sol golf transfer"
              variant="outline-gs-green"
              size="md"
              className="w-full flex-1 rounded-xl"
              containerClassName="flex-1"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-gs-green/12 bg-white/80 p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-gs-green" aria-hidden />
              <div>
                <p className="font-ge text-[0.8rem] font-bold uppercase tracking-[0.16em] text-ge-orange">
                  Smart WhatsApp idea
                </p>
                <p className="mt-2 font-ge text-base leading-7 text-ge-gray500">
                  Visitors can tap WhatsApp here for a prebuilt transfer brief, then simply edit from/to, date, and
                  passenger count before sending.
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-8 space-y-3 border-t border-gs-dark/10 pt-6">
            {transportEnquireBlockCopy.reassurances.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 font-ge text-base leading-7 text-gs-dark sm:text-[1rem]"
              >
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <TransportHeroEnquiryForm />
        </motion.div>
      </div>
    </GeSection>
  )
}
