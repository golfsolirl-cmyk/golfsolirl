import { COURSES, type CoastalCourse } from '../../data/coastal-golf-data'
import { buildTripQuoteHref } from '../trip-quote-services'

/** Area slug (from /golf-holidays/:area) → coastal course filter. */
const AREA_REGION_MATCH: Record<string, (region: string) => boolean> = {
  marbella: (r) => /marbella/i.test(r),
  mijas: (r) => /mijas/i.test(r),
  estepona: (r) => /estepona/i.test(r),
  benalmadena: (r) => /benalm/i.test(r),
  torremolinos: (r) => /torremolinos|benalm/i.test(r),
  fuengirola: (r) => /mijas|fuengirola/i.test(r),
  sotogrande: (r) => /sotogrande|san roque/i.test(r),
  casares: (r) => /casares|estepona|sotogrande/i.test(r),
  'benahavis': (r) => /nueva andaluc|marbella/i.test(r),
  'nueva-andalucia': (r) => /nueva andaluc/i.test(r),
  'la-cala': (r) => /mijas/i.test(r),
  malaga: (r) => /alhaur|benalm|mijas|torremolinos/i.test(r),
  'costa-del-sol': () => true
}

export function coursesForHolidayArea(areaSlug: string): readonly CoastalCourse[] {
  const match = AREA_REGION_MATCH[areaSlug]
  if (!match) return []
  return COURSES.filter((c) => match(c.region))
}

export function courseDetailPath(course: CoastalCourse): string {
  const slugMap: Record<string, string> = {
    torrequebrada: '/golf-courses/torrequebrada',
    lauro: '/golf-courses/lauro',
    chaparral: '/golf-courses/el-chaparral',
    lacala: '/golf-courses/la-cala-golf',
    cabopino: '/golf-courses/cabopino',
    santamaria: '/golf-courses/santa-maria',
    santaclara: '/golf-courses/santa-clara',
    higueron: '/golf-courses/higueron',
    lasbrisas: '/golf-courses/las-brisas',
    losnaranjos: '/golf-courses/los-naranjos',
    elparaiso: '/golf-courses/el-paraiso',
    valleromano: '/golf-courses/valle-romano',
    fincacortesin: '/golf-courses/finca-cortesin',
    valderrama: '/golf-courses/valderrama',
    sotogrande: '/golf-courses/sotogrande-old',
    sanroque: '/golf-courses/san-roque',
    lahacienda: '/golf-courses/la-hacienda'
  }
  return slugMap[course.id] ?? `/golf-courses/${course.id}`
}

/** Prefill trip builder for an area landing (golf + transfers + accommodation). */
export function quoteHrefForHolidayArea(areaSlug: string, fromPath: string): string {
  const courses = coursesForHolidayArea(areaSlug).map((c) => c.name)
  return buildTripQuoteHref({
    from: fromPath,
    courses: courses.slice(0, 4),
    golf: true,
    transfers: true,
    accommodation: true
  })
}

export function quoteHrefForCourseName(courseName: string, fromPath: string): string {
  return buildTripQuoteHref({
    from: fromPath,
    courses: [courseName],
    golf: true,
    transfers: true,
    accommodation: true
  })
}

export function holidayAreaSlugFromPath(path: string): string | null {
  const m = path.match(/^\/golf-holidays\/([^/]+)$/)
  return m?.[1] ?? null
}
