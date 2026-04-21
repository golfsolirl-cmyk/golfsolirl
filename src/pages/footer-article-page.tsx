import { useMemo } from 'react'
import type { MarketingPageData } from '../data/marketing-page-types'
import { getFooterArticlePage } from '../data/footer-article-pages'
import { usePageSeo } from '../lib/use-page-seo'
import { LuxuryButton } from '../components/ui/button'
import { MarketingPageTemplate } from './golf-experience/components/marketing-page-template'

function toMarketingPageData(path: string, page: NonNullable<ReturnType<typeof getFooterArticlePage>>): MarketingPageData {
  const isCoursePage =
    path.includes('course') ||
    path === '/featured-courses' ||
    path === '/costa-del-sol-routing'
  const isAccommodationPage = path.includes('hotel') || path.includes('accommodation')
  const isTransportPage = path.includes('transfer') || path === '/airport-transfers'
  const isLegalPage =
    path === '/terms-and-conditions' || path === '/deposit-upfront' || path === '/final-balance-terms'
  const isQuotePage = path === '/no-obligation-enquiry'

  const formVariant = isLegalPage
    ? 'legal'
    : isTransportPage
      ? 'transport'
      : isCoursePage
        ? 'courses'
        : isAccommodationPage
          ? 'accommodation'
          : isQuotePage
            ? 'quote'
            : 'itinerary'

  const heroImage = isTransportPage
    ? '/images/transport-fleet-lineup.jpg'
    : isAccommodationPage
      ? '/images/transport-moment-resort.jpg'
      : isCoursePage
        ? '/images/about-golfsol-hero.jpg'
        : '/images/transport-moment-arrivals.jpg'

  const heroAlt = isTransportPage
    ? 'GolfSol Ireland transport service for Costa del Sol golf groups.'
    : isAccommodationPage
      ? 'Costa del Sol accommodation for Irish golf groups.'
      : isCoursePage
        ? 'Costa del Sol golf course planning for Irish travellers.'
        : 'GolfSol Ireland planning support for Costa del Sol golf trips.'

  const highlights = isTransportPage
    ? ['Irish-led transfer planning', 'Golf-bag friendly routing', 'Clear next-step support']
    : isAccommodationPage
      ? ['Hotel-fit advice for groups', 'Base selection without overload', 'Joined-up stay and golf planning']
      : isCoursePage
        ? ['Shortlists with real context', 'Routing that saves time', 'Fast replies for organisers']
        : isLegalPage
          ? ['Plain-language answers', 'Clear payment and change guidance', 'Irish-owned support']
          : ['Irish-owned planning support', 'Clear next steps in plain English', 'Fast replies for organisers']

  const formTitle = isTransportPage
    ? 'Request transfer planning'
    : isAccommodationPage
      ? 'Request hotel options'
      : isCoursePage
        ? 'Request a course shortlist'
        : isLegalPage
          ? 'Ask about booking terms'
          : isQuotePage
            ? 'Start your no-obligation enquiry'
            : 'Start planning your trip'

  const formLead = isTransportPage
    ? 'Tell us your route, dates, and group size and we will outline the cleanest transfer plan.'
    : isAccommodationPage
      ? 'Share your dates, group size, and preferred base and we will send hotel options that match the trip.'
      : isCoursePage
        ? 'Send your dates, group size, and preferred golf area and we will return a tighter shortlist.'
        : isLegalPage
          ? 'Send your question and we will clarify deposits, balances, or booking terms before you commit.'
          : isQuotePage
            ? 'Tell us the basics and we will come back with a clear next step without any pressure.'
            : 'Share your dates, group profile, and priorities and we will shape the right next step.'

  const interestPreset = page.interestPreset ?? page.heroTitle

  return {
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription ?? page.heroBody,
    canonicalPath: page.canonicalPath,
    noIndex: page.noIndex,
    eyebrow: page.kicker,
    title: page.heroTitle,
    subtitle: page.heroBody,
    heroImage: page.heroImage ?? heroImage,
    heroAlt: page.heroAlt ?? heroAlt,
    highlights: page.highlights ?? highlights,
    sections: page.sections,
    formTitle: page.formTitle ?? formTitle,
    formLead: page.formLead ?? formLead,
    interestPreset,
    enquiryType: page.enquiryType ?? (isLegalPage ? 'legal' : 'booking'),
    formVariant: page.formVariant ?? formVariant,
    asideQuote: page.asideQuote
  }
}

function FooterArticlePage() {
  const path = useMemo(() => {
    const p = window.location.pathname.replace(/\/+$/, '')
    return p === '' ? '/' : p
  }, [])

  const page = useMemo(() => getFooterArticlePage(path), [path])

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 text-center text-forest-900">
        <p className="font-display text-2xl font-bold">Page not found</p>
        <LuxuryButton className="mt-6" href="/">
          Back home
        </LuxuryButton>
      </div>
    )
  }

  const marketingPage: MarketingPageData = toMarketingPageData(path, page)

  usePageSeo({
    title: marketingPage.metaTitle,
    description: marketingPage.metaDescription,
    canonicalPath: marketingPage.canonicalPath ?? path,
    noIndex: marketingPage.noIndex,
    ogImage: marketingPage.heroImage
  })

  return <MarketingPageTemplate page={marketingPage} />
}

export { FooterArticlePage }
