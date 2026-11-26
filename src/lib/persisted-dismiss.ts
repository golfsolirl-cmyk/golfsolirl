/** Keys for public UI surfaces that can be dismissed without returning every page load. */
export const DISMISS_STORAGE_KEYS = {
  whatsappBanner: 'gsol-dismiss-whatsapp-banner-v1',
  siteLaunchOffer: 'gsol-dismiss-site-launch-offer-v1',
  stickyCourseQuoteBar: 'gsol-dismiss-sticky-course-quote-v1',
  stickyHotelQuoteBar: 'gsol-dismiss-sticky-hotel-quote-v1'
} as const

export type DismissStorageKind = 'local' | 'session'

export function readDismissed(key: string, kind: DismissStorageKind = 'local'): boolean {
  if (typeof window === 'undefined') return false
  try {
    const store = kind === 'session' ? window.sessionStorage : window.localStorage
    return store.getItem(key) === '1'
  } catch {
    return false
  }
}

export function writeDismissed(key: string, kind: DismissStorageKind = 'local'): void {
  if (typeof window === 'undefined') return
  try {
    const store = kind === 'session' ? window.sessionStorage : window.localStorage
    store.setItem(key, '1')
  } catch {
    /* private mode / quota */
  }
}
