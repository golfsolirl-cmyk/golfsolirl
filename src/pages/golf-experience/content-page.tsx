import { useEffect, useMemo } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { GePaymentsIreland } from './sections/payments-ireland'
import { GeFinalCta } from './sections/final-cta'
import { GeContentEnquireBlock } from './sections/ge-content-enquire-block'
import { GeContentPromiseBand } from './sections/ge-content-promise-band'
import { GeContentStoryGrid, type GeContentStoryCard } from './sections/ge-content-story-grid'
import { GeServiceStyleHero } from './sections/ge-service-style-hero'
import { PageIdentityBar } from '../../components/page-identity-bar'
import { getGeContentPage } from './data/content-pages'
import { getContentPageFormConfig, getContentPageHeroMedia, getContentStorySectionMedia } from './content-page-context'
import { WhatsappFab } from './components/whatsapp-fab'
import { GeSection } from './components/ge-section'

function normalisePath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function GeContentPage() {
  const path = useMemo(() => normalisePath(), [])
  const page = useMemo(() => getGeContentPage(path), [path])
  const formConfig = useMemo(() => (page ? getContentPageFormConfig(path, page) : null), [page, path])
  const heroMedia = useMemo(() => (page ? getContentPageHeroMedia(path, page) : null), [page, path])

  const storyCards: readonly GeContentStoryCard[] = useMemo(() => {
    if (!page) return []
    return page.sections.slice(0, 3).map((section, index) => {
      const media = getContentStorySectionMedia(path, page, index)
      const badge = index === 0 ? 'Step 01' : index === 1 ? 'Step 02' : 'Step 03'
      return { section, badge, image: media.image, imageAlt: media.alt }
    })
  }, [page, path])

  useEffect(() => {
    if (!page) return
    document.title = page.metaTitle
  }, [page])

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ge-gray50 px-5 text-center">
        <div>
          <p className="font-ge text-[2rem] font-extrabold text-gs-dark sm:text-[2.4rem]">Page not found</p>
          <p className="mt-2 font-ge text-base text-ge-gray500">This link may have moved.</p>
          <a
            href="/#top"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gs-green px-6 py-3 font-ge text-base font-bold uppercase tracking-[0.12em] text-white"
          >
            Back home
          </a>
        </div>
      </div>
    )
  }

  const extraSections = page.sections.length > 3 ? page.sections.slice(3) : []
  const promiseBody = page.sections[0]?.body ?? page.subtitle
  const heroImage = heroMedia?.image ?? page.heroImage
  const heroAlt = heroMedia?.alt ?? page.heroAlt
  const routeLabel = heroMedia?.stripeLabel ?? page.eyebrow

  const mobileHighlights = page.highlights.slice(0, 3).map((label) => ({
    icon: CheckCircle2,
    label
  }))

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gs-gold focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-gs-dark"
      >
        Skip to content
      </a>
      <GeNavbar />
      <PageIdentityBar
        compact
        description={page.subtitle}
        eyebrow={page.eyebrow}
        label={routeLabel}
        offsetHeader
      />

      <main id="main">
        <GeServiceStyleHero
          srTitle={page.title}
          eyebrow={page.eyebrow}
          title={page.title}
          subtitle={page.subtitle}
          image={heroImage}
          imageAlt={heroAlt}
          primaryCta={{ label: 'Start your enquiry', href: '#ge-content-enquire' }}
          showNavbarSpacer={false}
          mobileHighlights={mobileHighlights}
        />

        <GeContentPromiseBand
          eyebrow="The promise"
          title="Plain guidance. One Irish team. Zero guesswork."
          body={promiseBody}
          bullets={page.highlights}
        />

        <GePaymentsIreland />

        <GeContentStoryGrid
          eyebrow="The detail"
          title="How we support your week."
          lead={page.subtitle}
          cards={storyCards}
        />

        {extraSections.length > 0 ? (
          <GeSection background="white" innerClassName="py-14 sm:py-16">
            <div className="mx-auto max-w-[1180px] space-y-8 px-5 sm:px-8">
              {extraSections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-2xl border border-ge-gray100 bg-ge-gray50/40 p-5 shadow-[0_10px_30px_rgba(6,59,42,0.06)] sm:p-7"
                >
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
            </div>
          </GeSection>
        ) : null}

        {formConfig ? (
          <GeContentEnquireBlock
            eyebrow="Get in touch"
            title={page.formTitle}
            body={page.formLead}
            formTitle={page.formTitle}
            formLead={page.formLead}
            interestPreset={page.interestPreset}
            routeLabel={routeLabel}
            formConfig={formConfig}
          />
        ) : null}

        <GeFinalCta />
      </main>

      <GeFooter />

      <WhatsappFab />
    </div>
  )
}
