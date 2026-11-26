import { coursesForHolidayArea } from './area-course-map'

/** Area holiday landings that have mapped courses (footer “Golf breaks by area”). */
const AREA_FOOTER_CANDIDATES = [
  { slug: 'costa-del-sol', label: 'Costa del Sol' },
  { slug: 'malaga', label: 'Málaga' },
  { slug: 'marbella', label: 'Marbella' },
  { slug: 'mijas', label: 'Mijas' },
  { slug: 'estepona', label: 'Estepona' },
  { slug: 'fuengirola', label: 'Fuengirola' },
  { slug: 'benalmadena', label: 'Benalmádena' },
  { slug: 'torremolinos', label: 'Torremolinos' },
  { slug: 'sotogrande', label: 'Sotogrande' },
  { slug: 'la-cala', label: 'La Cala' },
  { slug: 'nueva-andalucia', label: 'Nueva Andalucía' }
] as const

export function golfBreaksByAreaFooterLinks(): readonly { readonly label: string; readonly href: string }[] {
  return AREA_FOOTER_CANDIDATES.filter((area) => coursesForHolidayArea(area.slug).length > 0).map((area) => ({
    label: area.label,
    href: `/golf-holidays/${area.slug}`
  }))
}
