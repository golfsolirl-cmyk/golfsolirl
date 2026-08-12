import { lazy, Suspense, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { usePageMeta } from '../../lib/use-page-meta'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { GePaymentsIreland } from './sections/payments-ireland'
import { GeFinalCta } from './sections/final-cta'
import { GeContentEnquireBlock } from './sections/ge-content-enquire-block'
import { GeContentPromiseBand } from './sections/ge-content-promise-band'
import { GeContentStoryGrid, type GeContentStoryCard } from './sections/ge-content-story-grid'
import { PremiumPageHero } from '../../components/home/premium-page-hero'
import { buildContentPageHeroConfig } from '../../lib/content-page-hero-config'
import { TermsEmailRequest } from './sections/terms-email-request'
import { TermsSolicitorNotice } from './sections/terms-solicitor-notice'
import { getGeContentPage } from './data/content-pages'
import { formatContentPageRouteLabel, getContentPageFormConfig, getContentStorySectionMedia } from './content-page-context'
import { GeTransfersInsuranceBanner } from './components/ge-transfers-insurance-banner'
import { WhatsappFab } from './components/whatsapp-fab'
import { GeSection } from './components/ge-section'
import {
  GOLF_COURSES_MAP_SECTION_ID,
  shouldShowInteractiveCourseMap
} from './components/ge-courses-map-visibility'

const GeCoursesInteractiveCorridor = lazy(async () => {
  const mod = await import('./components/ge-courses-interactive-corridor')
  return { default: mod.GeCoursesInteractiveCorridor }
})

function normalisePath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function GeContentPage() {
  const path = useMemo(() => normalisePath(), [])
  const page = useMemo(() => getGeContentPage(path), [path])
  const formConfig = useMemo(() => (page ? getContentPageFormConfig(path, page) : null), [page, path])

  const storyCards: readonly GeContentStoryCard[] = useMemo(() => {
    if (!page) return []
    return page.sections.slice(0, 3).map((section, index) => {
      const media = getContentStorySectionMedia(path, page, index)
      const badge = index === 0 ? 'Step 01' : index === 1 ? 'Step 02' : 'Step 03'
      return { section, badge, image: media.image, imageAlt: media.alt }
    })
  }, [page, path])


  usePageMeta(
    page
      ? {
          title: page.metaTitle,
          description: page.subtitle,
          canonicalPath: path
        }
      : {
          title: 'Page not found',
          description: 'This Golf Sol Ireland page could not be found.',
          noIndex: true
        }
  )

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
  const isTermsPage = path.includes('terms')
  const showCourseCorridorMap = shouldShowInteractiveCourseMap(path)
  const formTarget = showCourseCorridorMap ? `#${GOLF_COURSES_MAP_SECTION_ID}` : '#ge-content-enquire'
  const heroConfig = buildContentPageHeroConfig(path, page, formTarget)
  const routeLabel = formatContentPageRouteLabel(path)

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>
      <GeNavbar />

      <main id="main">
        <PremiumPageHero
          srTitle={page.title}
          images={heroConfig.images}
          kicker={heroConfig.kicker}
          titleLine1={heroConfig.titleLine1}
          titleLine2={heroConfig.titleLine2}
          lead={heroConfig.lead}
          trustBadges={heroConfig.trustBadges}
          trustSectionTitle={heroConfig.trustSectionTitle}
          floatingBadges={heroConfig.floatingBadges}
          formScrollTarget={heroConfig.formScrollTarget}
          formScrollLabel={heroConfig.formScrollLabel}
          formScrollSublabel={heroConfig.formScrollSublabel}
          primaryCta={{
            label: showCourseCorridorMap ? 'Explore the course map' : heroConfig.primaryCtaLabel,
            href: formTarget,
            variant: 'gs-gold'
          }}
          secondaryCta={
            showCourseCorridorMap
              ? { label: 'Start your enquiry', href: '#ge-content-enquire', variant: 'outline-gs-green' }
              : undefined
          }
        />

        {showCourseCorridorMap ? (
          <Suspense
            fallback={
              <div
                aria-hidden
                className="mx-auto h-[min(52vh,520px)] max-w-[1180px] animate-pulse rounded-[2rem] bg-forest-100/40 px-5 sm:px-8"
              />
            }
          >
            <GeCoursesInteractiveCorridor path={path} routeLabel={routeLabel} />
          </Suspense>
        ) : null}

        <GeContentPromiseBand
          eyebrow="The promise"
          title="Plain guidance. One Irish team. Zero guesswork."
          body={promiseBody}
          bullets={page.highlights}
        />

        <GePaymentsIreland />

        <div className="bg-white px-5 py-6 sm:px-8 sm:py-7">
          <div className="mx-auto max-w-[1180px]">
            <GeTransfersInsuranceBanner variant="inline" />
          </div>
        </div>

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
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
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

        {isTermsPage ? (
          <>
            <TermsSolicitorNotice />
            <TermsEmailRequest />
          </>
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
