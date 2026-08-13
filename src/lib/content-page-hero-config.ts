import { CheckCircle2, Clock3, Flag, Hotel, PlaneLanding, Scale, ShieldCheck, type LucideIcon } from 'lucide-react'
import { HERO_FORM_SCROLL_DEFAULT_SUBLABEL } from '../components/home/hero-form-scroll-cue'
import { splitHeroTitle } from '../components/home/premium-page-hero'
import { SEO_LANDING_PAGE_PATHS } from '../data/seo-landing-page-paths'
import type { GeContentPageData } from '../pages/golf-experience/data/content-pages'
import { NAMED_HERO_IMAGE_SETS, heroImageSetForContentPage, type HeroImageSet } from './page-hero-images'

/** Course-corridor pages with dedicated heroes (must not fall back to generic fairway). */
const PAGE_OWNED_HERO_PATHS = new Set<string>([
  ...SEO_LANDING_PAGE_PATHS,
  '/golf-courses/sotogrande',
  '/golf-courses/marbella-golf-valley',
  '/golf-courses/mijas-fuengirola'
])

type ContentPageKind =
  | 'twilight'
  | 'courses'
  | 'accommodation'
  | 'transport'
  | 'booking'
  | 'legal'
  | 'newsletter'
  | 'testimonial'
  | 'about'
  | 'news'
  | 'support'

function inferPageKind(path: string, page: GeContentPageData): ContentPageKind {
  const haystack = `${path} ${page.title} ${page.interestPreset}`.toLowerCase()
  const pathLower = path.toLowerCase()

  if (pathLower.includes('twilight')) return 'twilight'
  if (page.enquiryType === 'legal') return 'legal'
  if (page.enquiryType === 'newsletter') return 'newsletter'
  if (page.enquiryType === 'testimonial') return 'testimonial'
  // Destination golf-holiday pages must not be classified as transport because of "malaga" in the path.
  if (pathLower.startsWith('/golf-holidays')) return 'support'
  if (haystack.includes('tee-time') || haystack.includes('golf-courses') || haystack.includes('course')) return 'courses'
  if (
    haystack.includes('transport') ||
    pathLower.includes('airport') ||
    pathLower.includes('/transfers/') ||
    (pathLower.includes('malaga') && !pathLower.includes('/golf-holidays/'))
  ) {
    return 'transport'
  }
  if (haystack.includes('accommodation') || haystack.includes('hotel')) return 'accommodation'
  if (haystack.includes('booking') || haystack.includes('quote')) return 'booking'
  if (haystack.includes('about')) return 'about'
  if (haystack.includes('news')) return 'news'
  return 'support'
}

function imagesForKind(kind: ContentPageKind, path: string, page: GeContentPageData): HeroImageSet {
  // SEO landings + corridor pages carry page-specific heroes — never replace with category generics.
  if (PAGE_OWNED_HERO_PATHS.has(path)) {
    return heroImageSetForContentPage(path, page)
  }

  switch (kind) {
    case 'twilight':
      return NAMED_HERO_IMAGE_SETS.twilightGolf
    case 'courses':
      return NAMED_HERO_IMAGE_SETS.fairwayCoastal
    case 'accommodation':
      return NAMED_HERO_IMAGE_SETS.resortHotel
    case 'transport':
      return NAMED_HERO_IMAGE_SETS.transportCoastal
    case 'booking':
      return NAMED_HERO_IMAGE_SETS.fleetCover
    case 'testimonial':
      return NAMED_HERO_IMAGE_SETS.testimonial
    case 'legal':
      return NAMED_HERO_IMAGE_SETS.legal
    case 'about':
      return NAMED_HERO_IMAGE_SETS.about
    case 'news':
    case 'newsletter':
      return NAMED_HERO_IMAGE_SETS.editorial
    default:
      return heroImageSetForContentPage(path, page)
  }
}

export function buildContentPageHeroConfig(path: string, page: GeContentPageData, formTarget: string) {
  const kind = inferPageKind(path, page)
  const { line1, line2 } = splitHeroTitle(page.title)
  const trustIcons: LucideIcon[] = [CheckCircle2, PlaneLanding, Flag, ShieldCheck, Hotel, Clock3, Scale]
  const trustBadges = page.highlights.slice(0, 4).map((label, index) => ({
    icon: trustIcons[index % trustIcons.length] ?? CheckCircle2,
    label
  }))

  const scrollLabels: Record<ContentPageKind, string> = {
    twilight: 'Book twilight golf',
    courses: 'Request tee times',
    accommodation: 'Request a stay quote',
    transport: 'Get a transfer quote',
    booking: 'Start your booking',
    legal: 'Questions on terms?',
    newsletter: 'Join the list',
    testimonial: 'Share your story',
    about: 'Talk to our team',
    news: 'Get in touch',
    support: 'Send your enquiry'
  }

  return {
    images: imagesForKind(kind, path, page),
    kicker: page.eyebrow,
    titleLine1: line1,
    titleLine2: line2,
    lead: page.subtitle,
    trustBadges,
    trustSectionTitle: kind === 'legal' ? 'What these terms cover' : 'Why Irish groups use us',
    formScrollTarget: formTarget,
    formScrollLabel: scrollLabels[kind],
    formScrollSublabel: HERO_FORM_SCROLL_DEFAULT_SUBLABEL,
    primaryCtaLabel: kind === 'testimonial' ? 'Leave a testimonial' : 'Start your enquiry',
    floatingBadges:
      kind === 'transport'
        ? [
            { kicker: 'Malaga AGP', title: 'Meet & greet at arrivals' },
            {
              kicker: 'Door to door',
              title: 'Resort & course runs',
              panelClass: 'border-forest-700 bg-forest-950 shadow-[0_12px_32px_rgba(6,32,22,0.4)]',
              offsetClass: 'ml-8'
            }
          ]
        : kind === 'accommodation'
          ? [
              { kicker: 'Stay + play', title: 'Hotels Irish groups love' },
              {
                kicker: 'Golf ready',
                title: 'Tee times lined up',
                panelClass: 'border-forest-700 bg-forest-950 shadow-[0_12px_32px_rgba(6,32,22,0.4)]',
                offsetClass: 'ml-8'
              }
            ]
          : undefined
  }
}
