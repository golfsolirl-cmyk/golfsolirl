/**
 * Progressive-enhancement scroll entrance for public marketing pages.
 * Content stays visible without JS. When enabled, marks elements in view once.
 */

const ROOT_READY = 'gsol-motion-ready'
const IN_CLASS = 'gsol-reveal--in'

const isPublicMarketingPath = (pathname: string) => {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/driver') ||
    path.startsWith('/portal') ||
    path.startsWith('/documents') ||
    path.startsWith('/auth') ||
    path.startsWith('/login') ||
    path.startsWith('/logged-out') ||
    path.startsWith('/packages-admin') ||
    path.startsWith('/package-admin')
  ) {
    return false
  }
  return true
}

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return true
  }
}

const markIn = (el: Element) => {
  el.classList.add(IN_CLASS)
}

/**
 * Enable subtle scroll-enter animations on public pages. Safe to call repeatedly.
 * Returns a cleanup function.
 */
export function enablePublicScrollEnter(root: ParentNode = document): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined
  }
  if (!isPublicMarketingPath(window.location.pathname)) {
    document.documentElement.classList.remove(ROOT_READY)
    return () => undefined
  }
  if (prefersReducedMotion()) {
    document.documentElement.classList.remove(ROOT_READY)
    root.querySelectorAll('.gsol-reveal, .gsol-fly').forEach(markIn)
    return () => undefined
  }

  document.documentElement.classList.add(ROOT_READY)

  const targets = root.querySelectorAll('.gsol-reveal, .gsol-fly')
  if (!targets.length) {
    return () => {
      document.documentElement.classList.remove(ROOT_READY)
    }
  }

  const vh = window.innerHeight || 800
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        markIn(entry.target)
        observer.unobserve(entry.target)
      }
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  )

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect()
    // Already on screen (hero / above fold) — show immediately, no wait.
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      markIn(el)
      return
    }
    observer.observe(el)
  })

  return () => {
    observer.disconnect()
    document.documentElement.classList.remove(ROOT_READY)
  }
}
