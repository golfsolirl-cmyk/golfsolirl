import { GeAboutBlock } from './sections/about-block'
import { GeAccommodationIntro } from './sections/accommodation-intro'
import { GeAccommodationSpain } from './sections/accommodation-spain'
import { GeCoursesSpain } from './sections/courses-spain'
import { GeDesignYourPackage } from './sections/design-your-package'
import { GeExtrasStrip } from './sections/extras-strip'
import { GeFacts } from './sections/facts'
import { GeFinalCta } from './sections/final-cta'
import { GePaymentsIreland } from './sections/payments-ireland'
import { GeHero } from './sections/hero'
import { PublicSiteShell } from '../../components/public/public-site-shell'
import { buildWebsiteJsonLd, usePageMetadata } from '../../lib/page-metadata'
import { SITE_NAME } from '../../lib/site-config'

export function GolfExperienceHome() {
  usePageMetadata({
    title: `Costa del Sol golf holidays for Irish travellers | ${SITE_NAME}`,
    description:
      'Plan premium Costa del Sol golf holidays with GolfSol Ireland. Explore handpicked courses, accommodation, airport transfers, group packages, and Irish-led trip planning.',
    canonicalPath: '/',
    image: '/images/hero-malaga-transfers-1600.jpg',
    keywords: [
      'GolfSol Ireland',
      'Costa del Sol golf holidays',
      'Irish golf travel',
      'Malaga golf transfers',
      'Costa del Sol golf packages'
    ],
    jsonLd: buildWebsiteJsonLd({
      title: `Costa del Sol golf holidays for Irish travellers | ${SITE_NAME}`,
      description:
        'Plan premium Costa del Sol golf holidays with GolfSol Ireland. Explore handpicked courses, accommodation, airport transfers, group packages, and Irish-led trip planning.',
      canonicalUrl: 'https://golfsolirl.com/',
      image: 'https://golfsolirl.com/images/hero-malaga-transfers-1600.jpg'
    })
  })

  return (
    <PublicSiteShell>
      <main id="main">
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
      </main>
    </PublicSiteShell>
  )
}
