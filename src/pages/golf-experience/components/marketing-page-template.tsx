import { motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Phone, Quote } from 'lucide-react'
import type { MarketingPageData } from '../../../data/marketing-page-types'
import { cx } from '../../../lib/utils'
import { contactInfo } from '../data/copy'
import { GeFooter } from '../sections/ge-footer'
import { GeNavbar } from '../sections/ge-navbar'
import { GeQuickEnquiryForm } from './ge-quick-enquiry-form'
import { WhatsappFab } from './whatsapp-fab'

function HeroRibbon({ eyebrow }: { readonly eyebrow: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      <div
        aria-hidden
        className="h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(184,137,0,0.5) 12%, #FFC72C 28%, #FFE27A 50%, #FFC72C 72%, rgba(184,137,0,0.5) 88%, transparent 100%)'
        }}
      />
      <div className="border-y border-[#b88900]/45 bg-[linear-gradient(90deg,#ffc72c_0%,#ffe27a_45%,#ffc72c_100%)]">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-center px-5 py-2.5 sm:px-8 sm:py-3">
          <span className="font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.28em] text-gs-dark sm:text-[0.88rem]">
            {eyebrow}
          </span>
        </div>
      </div>
    </div>
  )
}

export function MarketingPageTemplate({ page }: { readonly page: MarketingPageData }) {
  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <GeNavbar />
      <main>
        <section className="relative isolate overflow-hidden bg-gs-dark text-white">
          <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
          <div className="relative">
            <img
              src={page.heroImage}
              alt={page.heroAlt}
              className="h-[42vh] min-h-[300px] w-full object-cover object-[center_38%] md:h-[50vh] md:min-h-[420px] lg:h-[54vh]"
              width={2200}
              height={1100}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gs-dark/88 via-gs-dark/66 to-gs-dark/48" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/70 via-transparent to-transparent" />
            <div className={cx('absolute inset-0 z-10 flex items-end pb-20 sm:pb-24')}>
              <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="max-w-3xl"
                >
                  <h1 className="font-ge text-[2.15rem] font-extrabold leading-[1.03] tracking-[-0.01em] text-white sm:text-[2.8rem] md:text-[3.25rem]">
                    {page.title}
                  </h1>
                  <p className="mt-4 max-w-2xl font-ge text-[1.04rem] leading-7 text-white/92 sm:text-[1.12rem] sm:leading-8">
                    {page.subtitle}
                  </p>
                </motion.div>
              </div>
            </div>
            <HeroRibbon eyebrow={page.eyebrow} />
          </div>
        </section>

        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-ge-gray100 bg-ge-gray50 p-5 sm:p-6">
                <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-orange">Why this helps</p>
                <ul className="mt-4 space-y-3">
                  {page.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 font-ge text-base leading-7 text-gs-dark">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gs-green" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {page.sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-2xl border border-ge-gray100 bg-white p-5 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-7"
                >
                  <h2 className="font-ge text-[1.58rem] font-extrabold leading-tight text-gs-green sm:text-[1.9rem]">
                    {section.title}
                  </h2>
                  <p className="mt-3 font-ge text-base leading-7 text-ge-gray500">{section.body}</p>
                  {section.bullets ? (
                    <ul className="mt-4 space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5 font-ge text-base text-gs-dark">
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gs-gold" aria-hidden />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}

              {page.asideQuote ? (
                <article className="overflow-hidden rounded-[1.9rem] border border-gs-dark/10 bg-[linear-gradient(145deg,rgba(6,59,42,0.96),rgba(11,107,69,0.92),rgba(255,199,44,0.12))] p-[1px] shadow-[0_18px_40px_rgba(6,59,42,0.14)]">
                  <div className="rounded-[1.8rem] bg-gs-dark px-6 py-7 text-white sm:px-8">
                    <Quote className="h-8 w-8 text-gs-gold/80" aria-hidden />
                    <p className="mt-4 font-ge text-[1.25rem] font-extrabold leading-8 text-white sm:text-[1.45rem] sm:leading-9">
                      {page.asideQuote.text}
                    </p>
                    <p className="mt-4 font-ge text-[0.78rem] font-bold uppercase tracking-[0.22em] text-gs-gold-light/80">
                      {page.asideQuote.attribution}
                    </p>
                  </div>
                </article>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-36">
              <GeQuickEnquiryForm
                title={page.formTitle}
                lead={page.formLead}
                enquiryType={page.enquiryType ?? 'booking'}
                interestPreset={page.interestPreset}
                formVariant={page.formVariant}
              />
              <div className="mt-5 rounded-2xl border border-ge-gray100 bg-white p-5 shadow-[0_8px_20px_rgba(6,59,42,0.06)]">
                <p className="font-ge text-sm font-bold uppercase tracking-[0.16em] text-ge-orange">Prefer to call?</p>
                <a
                  href={`tel:${contactInfo.phoneTel}`}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-gs-green px-4 py-2.5 font-ge text-base font-bold uppercase tracking-[0.12em] text-gs-green transition-colors hover:bg-gs-green hover:text-white"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {contactInfo.phoneDisplay}
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <GeFooter />
      <WhatsappFab />
    </div>
  )
}
