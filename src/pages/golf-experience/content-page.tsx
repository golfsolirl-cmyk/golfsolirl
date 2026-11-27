import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useJsonLd, usePageMeta } from '../../lib/use-page-meta'
import { buildBreadcrumbListSchema, buildFaqSchema, buildWebPageSchema } from '../../lib/seo/organization-schema'
import { absoluteOgImageUrl } from '../../lib/site-seo'
import { GeFooter } from './sections/ge-footer'
import { GeNavbar } from './sections/ge-navbar'
import { GeContentEnquireBlock } from './sections/ge-content-enquire-block'
import { IrishDriversTrustPill, LeanPublicHero } from '../../components/home/premium-golf-hero'
import { MeetAndGreetIrishDrivers } from '../../components/meet-and-greet-irish-drivers'
import { TransferFleetPhotoStrip } from '../../components/transfer-fleet-photo-strip'
import { buildContentPageHeroConfig } from '../../lib/content-page-hero-config'
import { TermsEmailRequest } from './sections/terms-email-request'
import { TermsSolicitorNotice } from './sections/terms-solicitor-notice'
import { getGeContentPage } from './data/content-pages'
import { formatContentPageRouteLabel, getContentPageFormConfig } from './content-page-context'
import { GeSection } from './components/ge-section'
import { FindYourCourse } from './components/find-your-course'
import { FindYourHotel } from './components/find-your-hotel'
import { GOLF_COURSES_MAP_SECTION_ID } from './components/ge-courses-map-visibility'
import { GeGolfMapSimple } from './components/ge-golf-map-simple'
import { WhatsAppBanner } from '../../components/whatsapp/WhatsAppBanner'
import { GSOL_BUSINESS } from '../../lib/business-details'
import { openCookieSettings } from '../../lib/cookie-consent'

function CompanyIdentityBlock() {
  return (
    <GeSection background="cream" innerClassName="py-10 sm:py-12">
      <div className="mx-auto max-w-[760px] px-5 sm:px-8">
        <h2 className="font-ge text-[1.35rem] font-extrabold leading-tight text-gs-dark sm:text-[1.55rem]">
          Company identity
        </h2>
        <address className="mt-3 not-italic font-ge text-base leading-7 text-ge-gray600">
          <span className="block font-semibold text-gs-dark">{GSOL_BUSINESS.brandName}</span>
          <span className="mt-1 block">{GSOL_BUSINESS.addressOneLine}</span>
        </address>
        <ul className="mt-4 space-y-2 font-ge text-base text-gs-dark">
          <li>
            Ireland{' '}
            <a className="font-semibold underline decoration-brand-500/40 underline-offset-2" href={`tel:${GSOL_BUSINESS.irishPhoneTel}`}>
              {GSOL_BUSINESS.irishPhoneDisplay}
            </a>
            {' · '}
            Spain{' '}
            <a className="font-semibold underline decoration-brand-500/40 underline-offset-2" href={`tel:${GSOL_BUSINESS.spanishPhoneTel}`}>
              {GSOL_BUSINESS.spanishPhoneDisplay}
            </a>
          </li>
          <li>
            <a className="font-semibold underline decoration-brand-500/40 underline-offset-2" href={`mailto:${GSOL_BUSINESS.email}`}>
              {GSOL_BUSINESS.email}
            </a>
            {' · '}
            <a
              className="font-semibold underline decoration-brand-500/40 underline-offset-2"
              href={GSOL_BUSINESS.websiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {GSOL_BUSINESS.websiteDisplay}
            </a>
          </li>
          <li className="text-ge-gray600">{GSOL_BUSINESS.registeredInLabel}</li>
        </ul>
      </div>
    </GeSection>
  )
}

function normalisePath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

function breadcrumbItemsForPath(path: string, title: string) {
  const items: { name: string; path: string }[] = [{ name: 'Home', path: '/' }]
  const parts = path.split('/').filter(Boolean)
  let acc = ''
  for (let i = 0; i < parts.length; i += 1) {
    acc += `/${parts[i]}`
    const isLast = i === parts.length - 1
    items.push({
      name: isLast
        ? title
        : parts[i]
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
      path: acc
    })
  }
  return items
}

function ContentBullet({ bullet }: { readonly bullet: string }) {
  const internal = bullet.match(/^(.*?)\s+[—–-]\s+(\/[\w\-./]+)\s*$/)
  if (internal) {
    return (
      <li className="flex items-start gap-2.5 font-ge text-base text-gs-dark">
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
        <a className="underline decoration-brand-500/40 underline-offset-2 hover:text-gs-green" href={internal[2]}>
          {internal[1]}
        </a>
      </li>
    )
  }
  const external = bullet.match(/^(.*?)\s+[—–-]\s+(https?:\/\/\S+)\s*$/)
  if (external) {
    return (
      <li className="flex items-start gap-2.5 font-ge text-base text-gs-dark">
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
        <a
          className="underline decoration-brand-500/40 underline-offset-2 hover:text-gs-green"
          href={external[2]}
          rel="noreferrer"
          target="_blank"
        >
          {external[1]}
        </a>
      </li>
    )
  }
  return (
    <li className="flex items-start gap-2.5 font-ge text-base text-gs-dark">
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
      <span>{bullet}</span>
    </li>
  )
}

export function GeContentPage() {
  const path = useMemo(() => normalisePath(), [])
  const page = useMemo(() => getGeContentPage(path), [path])
  const formConfig = useMemo(() => (page ? getContentPageFormConfig(path, page) : null), [page, path])

  const crumbs = useMemo(
    () => (page ? breadcrumbItemsForPath(path, page.title) : []),
    [page, path]
  )

  usePageMeta(
    page
      ? {
          title: page.metaTitle,
          description: page.subtitle,
          canonicalPath: path,
          ogImage: page.heroImage,
          ogImageAlt: page.heroAlt
        }
      : {
          title: 'Page not found',
          description: 'This Golf Sol Ireland page could not be found.',
          noIndex: true
        }
  )

  useJsonLd(
    'gsol-content-webpage',
    useMemo(
      () =>
        page
          ? buildWebPageSchema({
              path,
              name: page.metaTitle,
              description: page.subtitle,
              imageUrl: absoluteOgImageUrl(page.heroImage)
            })
          : { '@context': 'https://schema.org', '@type': 'WebPage' },
      [page, path]
    )
  )

  useJsonLd(
    'gsol-content-breadcrumbs',
    useMemo(
      () => (page ? buildBreadcrumbListSchema(crumbs) : { '@context': 'https://schema.org', '@type': 'BreadcrumbList' }),
      [crumbs, page]
    )
  )

  useJsonLd(
    'gsol-content-faq',
    useMemo(() => {
      if (!page) return null
      const faqs = page.sections
        .filter((section) => section.title.trim().endsWith('?'))
        .map((section) => ({ question: section.title.trim(), answer: section.body }))
      if (faqs.length < 2) return null
      return buildFaqSchema(faqs)
    }, [page])
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

  const isNewsletter = page.enquiryType === 'newsletter'
  const isTermsPage = path.includes('terms')
  const isPrivacyPage = path.includes('privacy')
  const isCookiePage = path.includes('cookie')
  const isLegalLongform = isTermsPage || isPrivacyPage || isCookiePage || page.enquiryType === 'legal'
  /**
   * FAQ pages: show every Q&A section (titles ending in ?).
   * Legal / policy pages: show every authored section (GDPR requires the full notice).
   * Other content pages: first section only (lean marketing layout).
   */
  const faqSections = page.sections.filter((section) => section.title.trim().endsWith('?'))
  const leadSections = isLegalLongform
    ? page.sections
    : faqSections.length >= 2
      ? faqSections
      : page.sections.slice(0, 1)
  const isContactPage = path === '/contact' || path.startsWith('/contact/')
  const showCompanyIdentity = isTermsPage || isPrivacyPage || isCookiePage || isContactPage
  const isAccommodationHub = path === '/accommodation' || path.startsWith('/accommodation/')
  const isGolfCoursesHub = path === '/golf-courses' || path.startsWith('/golf-courses/')
  const isChooserHub = isAccommodationHub || isGolfCoursesHub
  const isGolfMap = path === '/golf-map'
  const isAirportTransfersPage = path === '/airport-transfers'
  const formTarget = isGolfMap
    ? `#${GOLF_COURSES_MAP_SECTION_ID}`
    : isAccommodationHub
      ? '#hotel-list'
      : isGolfCoursesHub
        ? '#course-list'
        : '#ge-content-enquire'
  const heroConfig = buildContentPageHeroConfig(path, page, formTarget)
  const routeLabel = formatContentPageRouteLabel(path)
  const leadBody =
    !isLegalLongform && leadSections[0]?.body && leadSections[0].body.length > 420
      ? `${leadSections[0].body.slice(0, 417).trim()}…`
      : leadSections[0]?.body

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
        <LeanPublicHero
          ariaLabel={page.title}
          images={heroConfig.images}
          kicker={heroConfig.kicker || page.eyebrow || 'GolfSol Ireland'}
          lead={page.subtitle}
          primaryCta={{
            label: isAccommodationHub
              ? 'Find hotels'
              : isGolfCoursesHub || isGolfMap
                ? 'Find golf courses'
                : isAirportTransfersPage
                  ? 'Request a transfer'
                  : isNewsletter
                    ? 'Subscribe'
                    : 'Get a quote',
            href: isAirportTransfersPage ? '#ge-content-enquire' : formTarget
          }}
          secondaryCta={
            isChooserHub || isGolfMap
              ? { label: 'Get a quote', href: '/quote' }
              : isAirportTransfersPage
                ? { label: 'Get a quote', href: '/quote' }
                : { label: 'View bundles', href: '/bundles' }
          }
          title={page.title}
          trustPill={isAirportTransfersPage ? <IrishDriversTrustPill href="#meet-and-greet" /> : undefined}
        />

        {isAirportTransfersPage ? (
          <>
            <MeetAndGreetIrishDrivers
              variant="page"
              ctaHref="#ge-content-enquire"
              ctaLabel="Request a transfer"
            />
            <TransferFleetPhotoStrip />
          </>
        ) : null}

        {isGolfMap ? <GeGolfMapSimple /> : null}

        {path === '/accommodation' || path.startsWith('/accommodation/') ? <FindYourHotel /> : null}

        {/* Course hubs + corridor pages: lean list chooser (no busy dual map UI). */}
        {path === '/golf-courses' || path.startsWith('/golf-courses/') ? <FindYourCourse /> : null}

        {isNewsletter && formConfig ? (
          <GeContentEnquireBlock
            variant="newsletter"
            eyebrow="Subscribe"
            title={page.formTitle}
            body={page.formLead}
            formTitle={page.formTitle}
            formLead={page.formLead}
            interestPreset={page.interestPreset}
            routeLabel={routeLabel}
            formConfig={formConfig}
            reassurances={['Your email is enough', 'A few notes a year, not a weekly blast', 'Unsubscribe any time']}
          />
        ) : null}

        {isNewsletter || isChooserHub ? null : (
          <>
            {leadSections.length > 0 ? (
              <GeSection background="white" innerClassName="py-12 sm:py-14">
                <div className="mx-auto max-w-[760px] space-y-8 px-5 sm:px-8">
                  {page.lastUpdated ? (
                    <p className="font-ge text-sm font-semibold uppercase tracking-[0.12em] text-ge-gray500">
                      Last updated: {page.lastUpdated}
                    </p>
                  ) : null}
                  {isCookiePage ? (
                    <div className="rounded-2xl border border-gs-dark/10 bg-ge-gray50 px-4 py-4 sm:px-5">
                      <p className="font-ge text-base leading-7 text-ge-gray600">
                        Change or withdraw your cookie choice at any time.
                      </p>
                      <button
                        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-gs-green px-5 font-ge text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-brand-800"
                        onClick={openCookieSettings}
                        type="button"
                      >
                        Open cookie settings
                      </button>
                    </div>
                  ) : null}
                  {leadSections.map((section) => (
                    <article key={section.title}>
                      <h2 className="font-ge text-[1.45rem] font-extrabold leading-tight text-gs-dark sm:text-[1.7rem]">
                        {section.title}
                      </h2>
                      <p className="mt-3 font-ge text-base leading-7 text-ge-gray600">
                        {section === leadSections[0] && leadBody ? leadBody : section.body}
                      </p>
                      {section.bullets ? (
                        <ul className="mt-4 space-y-2.5">
                          {(isLegalLongform ? section.bullets : section.bullets.slice(0, 4)).map((bullet) => (
                            <ContentBullet key={bullet} bullet={bullet} />
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              </GeSection>
            ) : null}

            {showCompanyIdentity ? <CompanyIdentityBlock /> : null}

            {isTermsPage ? (
              <>
                <TermsSolicitorNotice />
                <TermsEmailRequest />
              </>
            ) : null}

            {formConfig ? (
              <GeContentEnquireBlock
                eyebrow={
                  page.enquiryType === 'testimonial'
                    ? 'Your trip'
                    : page.enquiryType === 'legal'
                      ? 'The terms'
                      : 'Get a quote'
                }
                title={page.formTitle}
                body={page.formLead}
                formTitle={page.formTitle}
                formLead={page.formLead}
                interestPreset={page.interestPreset}
                routeLabel={routeLabel}
                formConfig={formConfig}
              />
            ) : null}
          </>
        )}
      </main>

      <WhatsAppBanner sourcePage={path} />
      <GeFooter />
    </div>
  )
}
