/**
 * Prefetch Vite route chunks for high-probability marketing navigations.
 * Safe no-op for unknown paths; never blocks the UI.
 */

import { isGeContentPagePath } from '../pages/golf-experience/data/ge-content-page-paths'

const prefetched = new Set<string>()

function normalizePath(href: string): string {
  try {
    const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://golfsolirl.com')
    if (typeof window !== 'undefined' && url.origin !== window.location.origin) return ''
    const path = url.pathname.replace(/\/+$/, '') || '/'
    return path
  } catch {
    return ''
  }
}

function loadChunk(path: string): Promise<unknown> | null {
  if (path === '/services/transport') {
    return import('../pages/golf-experience/transport-service-page')
  }
  if (path === '/packages' || path === '/package') {
    return import('../pages/customer-packages')
  }
  if (
    path === '/login' ||
    path === '/dashboard/login' ||
    path === '/dashboard/admin/login' ||
    path === '/driver/login'
  ) {
    return import('../pages/login-page')
  }
  if (path === '/continue-trip') {
    return import('../pages/continue-trip-page')
  }
  if (isGeContentPagePath(path)) {
    return import('../pages/golf-experience/content-page')
  }
  return null
}

/** Call on link hover / focus / idle for likely next routes. */
export function prefetchRouteChunk(href: string): void {
  const path = normalizePath(href)
  if (!path || path === '/' || prefetched.has(path)) return
  const loader = loadChunk(path)
  if (!loader) return
  prefetched.add(path)
  void loader.catch(() => {
    prefetched.delete(path)
  })
}

/** Idle prefetch of the most common next steps from the homepage. */
export function prefetchLikelyMarketingRoutes(): void {
  if (typeof window === 'undefined') return
  const run = () => {
    for (const href of ['/contact', '/services/transport', '/packages', '/golf-courses']) {
      prefetchRouteChunk(href)
    }
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 4000 })
  } else {
    window.setTimeout(run, 2500)
  }
}
