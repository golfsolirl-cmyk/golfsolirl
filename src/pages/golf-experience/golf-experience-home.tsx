import { PublicSiteShell } from '../../components/public/public-site-shell'
import { usePageSeo } from '../../lib/use-page-seo'
import { GeAboutBlock } from './sections/about-block'
import { GeAccommodationIntro } from './sections/accommodation-intro'
import { GeAccommodationSpain } from './sections/accommodation-spain'
import { GeCoursesSpain } from './sections/courses-spain'
import { GeDesignYourPackage } from './sections/design-your-package'
import { GeExtrasStrip } from './sections/extras-strip'
import { GeFacts } from './sections/facts'
import { GeFinalCta } from './sections/final-cta'
import { GeHero } from './sections/hero'
import { GePaymentsIreland } from './sections/payments-ireland'

export function GolfExperienceHome() {
  usePageSeo({
    title: 'Golf Sol Ireland | Costa del Sol Golf Holidays for Irish Golfers',
    description:
      'Premium Costa del Sol golf holidays for Irish golfers with handpicked courses, accommodation, Malaga transfers, and fast quote support from an Irish-owned specialist.',
    path: '/',
    image: '/images/hero-malaga-transfers-1600.jpg',
    keywords: [
      'Golf Sol Ireland',
      'Costa del Sol golf holidays',
      'golf trips from Ireland to Spain',
      'Malaga golf transfers',
      'Costa del Sol golf packages'
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'Golf Sol Ireland',
      url: `${window.location.origin}/`,
      description:
        'Irish-owned Costa del Sol golf travel specialist providing golf packages, accommodation, and Malaga airport transfers.',
      areaServed: ['Ireland', 'Costa del Sol'],
      email: 'hello@golfsolireland.ie',
      telephone: '+353874464766'
    }
  })

  return (
    <PublicSiteShell>
      <GeHero />
      <GePaymentsIreland />
      <GeDesignYourPackage />
      <GeCoursesSpain />
      <GeAccommodationIntro />
      <GeAccommodationSpain />
      <GeExtrasStrip />
      <GeFacts />
      <GeAboutBlock />
      <GeFinalCta />
    </PublicSiteShell>
  )
}
