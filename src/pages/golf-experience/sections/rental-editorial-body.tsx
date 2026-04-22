import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Phone } from 'lucide-react'
import type { GeContentPageData } from '../data/content-pages'
import type { ContentFormConfig, ContentSmartAction } from '../content-page-context'
import { GeButton } from '../components/ge-button'
import { GeQuickEnquiryForm } from '../components/ge-quick-enquiry-form'
import { GeSmartActionCard } from '../components/ge-smart-action-card'
import { contactInfo } from '../data/copy'

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-48px' },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
} as const

export interface RentalEditorialBodyProps {
  readonly page: GeContentPageData
  readonly formConfig: ContentFormConfig | null
  readonly routeLabel: string
  readonly smartActions: readonly ContentSmartAction[]
}

/**
 * Clean rental layout — neutral surfaces, simple cards, smart actions as light tiles.
 */
export function RentalEditorialBody({ page, formConfig, routeLabel, smartActions }: RentalEditorialBodyProps) {
  return (
    <div className="bg-white text-neutral-900">
      <section id="rental-content" className="border-b border-neutral-200 px-4 py-12 sm:px-6 sm:py-14 md:px-10 md:py-16">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <h2 className="font-ge text-[0.68rem] font-bold uppercase tracking-[0.2em] text-neutral-500">At a glance</h2>
          <p className="mt-2 font-ge text-lg font-semibold text-neutral-800 sm:text-xl">What you can count on</p>
        </motion.div>

        <motion.ul {...reveal} className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3 sm:gap-5">
          {page.highlights.map((item, index) => (
            <li
              key={item}
              className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-5 shadow-sm sm:rounded-2xl sm:p-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-ge text-sm font-bold text-neutral-600 ring-1 ring-neutral-200">
                {index + 1}
              </span>
              <p className="mt-4 font-ge text-[0.95rem] font-medium leading-snug text-neutral-800">{item}</p>
            </li>
          ))}
        </motion.ul>

        <motion.div {...reveal} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:mx-auto sm:flex-row sm:justify-center">
          <GeButton href="#ge-enquiry-form" variant="ink" size="lg" className="w-full min-h-[50px] sm:w-auto">
            Go to enquiry form
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GeButton>
          <GeButton href={`tel:${contactInfo.phoneTel}`} variant="outline-ink" size="lg" className="w-full min-h-[50px] sm:w-auto">
            <Phone className="h-4 w-4" aria-hidden />
            Call
          </GeButton>
        </motion.div>
      </section>

      {smartActions.length > 0 ? (
        <section className="border-b border-neutral-200 bg-neutral-50 py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
            <motion.div {...reveal}>
              <h2 className="font-ge text-[0.68rem] font-bold uppercase tracking-[0.2em] text-neutral-500">Smart next steps</h2>
              <p className="mt-2 font-ge text-xl font-semibold text-neutral-900 sm:text-2xl">Pick the fastest route for you</p>
            </motion.div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {smartActions.map((action) => (
                <GeSmartActionCard key={action.label} action={action} appearance="clean" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="divide-y divide-neutral-200">
        {page.sections.map((section) => (
          <motion.article key={section.title} {...reveal} className="px-4 py-12 sm:px-8 sm:py-14 md:px-12 md:py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-ge text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.75rem]">{section.title}</h2>
              <p className="mt-4 font-ge text-[1.02rem] leading-7 text-neutral-600 sm:text-[1.05rem] sm:leading-8">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="border-l-2 border-neutral-300 pl-4 font-ge text-[0.98rem] leading-7 text-neutral-800 sm:text-[1rem]"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.article>
        ))}
      </section>

      {formConfig ? (
        <section className="border-t border-neutral-200 bg-neutral-100 px-4 py-14 sm:px-8 sm:py-16 md:py-20">
          <motion.div {...reveal} className="mx-auto max-w-lg">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:rounded-[1.35rem] sm:p-8 md:p-10">
              <GeQuickEnquiryForm
                title={page.formTitle}
                lead={page.formLead}
                interestPreset={page.interestPreset}
                routeLabel={routeLabel}
                formConfig={formConfig}
              />
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <a
                href={`https://wa.me/${contactInfo.phoneTel.replace(/\D/g, '')}?text=${encodeURIComponent("Hi GolfSol Ireland — I'm interested in golf club rental.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 font-ge text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"
              >
                <MessageCircle className="h-4 w-4 text-neutral-500" aria-hidden />
                WhatsApp
              </a>
              <a
                href={`tel:${contactInfo.phoneTel}`}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-5 py-2.5 font-ge text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
              >
                <Phone className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />
                <span className="whitespace-nowrap tabular-nums">{contactInfo.phoneDisplay}</span>
              </a>
            </div>
          </motion.div>
        </section>
      ) : null}
    </div>
  )
}
