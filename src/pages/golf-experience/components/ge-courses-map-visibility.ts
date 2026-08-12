export const GOLF_COURSES_MAP_SECTION_ID = 'golf-sol-course-corridor'

/** Interactive corridor map: main + cluster golf course URLs and the promo golf map page. */
export function shouldShowInteractiveCourseMap(path: string): boolean {
  return path === '/golf-map' || path.includes('/golf-courses')
}
