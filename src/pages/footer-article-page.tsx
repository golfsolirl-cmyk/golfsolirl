import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Phone, Quote } from 'lucide-react'
import { applyPageSeo } from '../lib/seo'
import { contactInfo } from './golf-experience/data/copy'
import { GeButton } from './golf-experience/components/ge-button'
import { GeQuickEnquiryForm } from './golf-experience/components/ge-quick-enquiry-form'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { getFooterArticlePage } from '../data/footer-article-pages'

function FooterArticlePage() {
  const path = useMemo(() => {
    const p = window.location.pathname.replace(/\/+$/, '')
    return p === '' ? '/' : p
  }, [])

  const page = useMemo(() => getFooterArticlePage(path), [path])

  useEffect(() => {
    if (!page) {
      return
    }

    applyPageSeo({
      title: page.metaTitle,
      description: page.metaDescription,
      path,
      image: page.heroImage,
      type: 'article'
    })
  }, [page, path])

  if (!page) {
    return (
      <div className="ge-page flex min-h-screen flex-col items-center justify-center bg-ge-gray50 px-6 text-center">
        <p className="font-ge text-[2rem] font-extrabold text-gs-dark sm:text-[2.4rem]">Page not found</p>
        <p className="mt-2 font-ge text-base text-ge-gray500">This link may have moved.</p>
        <GeButton className="mt-6" href="/#top" size="md" variant="gs-green">
          Back home
        </GeButton>
      </div>
    )
  }

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <section className="relative isolate overflow-hidden bg-gs-dark text-white">
          <div aria-hidden="true" className="h-[134px] w-full bg-white sm:h-[148px] md:h-[164px] lg:h-[130px] xl:h-[142px]" />
          <div className="relative">
            <img
              src={page.heroImage}
              alt={page.heroAlt}
              className="h-[42vh] min-h-[300px] w-full object-cover object-center md:h-[50vh] md:min-h-[420px] lg:h-[54vh]"
              width={2200}
              height={1100}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gs-dark/88 via-gs-dark/66 to-gs-dark/48" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/70 via-transparent to-transparent" />
            <div className="absolute inset-0 z-10 flex items-end pb-20 sm:pb-24">
              <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="max-w-3xl"
                >
                  <p className="font-ge text-[0.8rem] font-bold uppercase tracking-[0.24em] text-gs-gold sm:text-[0.88rem]">
                    {page.kicker}
                  </p>
                  <h1 className="mt-3 font-ge text-[2.15rem] font-extrabold leading-[1.03] tracking-[-0.01em] text-white sm:text-[2.8rem] md:text-[3.25rem]">
                    {page.heroTitle}
                  </h1>
                  <p className="mt-4 max-w-2xl font-ge text-[1.04rem] leading-7 text-white/92 sm:text-[1.12rem] sm:leading-8">
                    {page.heroBody}
                  </p>
                </motion.div>
              </div>
            </div>
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
                    Golf Sol Ireland
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
            <div className="space-y-6">
              {page.sections.map((section) => (
                <article key={section.title} className="rounded-2xl border border-ge-gray100 bg-white p-5 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-7">
                  <h2 className="font-ge text-[1.58rem] font-extrabold leading-tight text-gs-green sm:text-[1.9rem]">{section.title}</h2>
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
                <div className="rounded-2xl border border-ge-gray100 bg-gs-dark p-6 text-white shadow-[0_12px_34px_rgba(6,59,42,0.2)] sm:p-7">
                  <Quote className="h-8 w-8 text-gs-gold/85" aria-hidden />
                  <p className="mt-4 font-ge text-[1.22rem] font-semibold leading-8 sm:text-[1.35rem]">{page.asideQuote.text}</p>
                  <p className="mt-3 font-ge text-sm font-bold uppercase tracking-[0.18em] text-white/60">{page.asideQuote.attribution}</p>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-36">
              <GeQuickEnquiryForm
                title={page.formTitle ?? 'Start your enquiry'}
                lead={page.formLead ?? 'Share your trip details and we will reply with clear next steps.'}
                enquiryType={page.enquiryType ?? 'booking'}
                interestPreset={page.interestPreset ?? page.heroTitle}
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

        <section className="bg-ge-gray50 py-14 sm:py-16">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="rounded-2xl border border-ge-gray100 bg-white p-6 text-center shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-8">
              <h2 className="font-ge text-[1.8rem] font-extrabold leading-tight text-gs-green sm:text-[2.1rem]">
                Ready to shape your Costa del Sol trip?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl font-ge text-base leading-7 text-ge-gray500">
                Tell us your dates and group style and we will come back with practical options that fit your route, golf preferences, and budget.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <GeButton href="/#top" size="md" variant="gs-green">
                  Back to home
                </GeButton>
                <GeButton href="/contact" size="md" variant="gs-gold">
                  Get quote
                </GeButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GeFooter />
      <WhatsappFab />
    </div>
  )
}

export { FooterArticlePage }
