/**
 * Progressive-enhancement scroll entrance for public marketing pages.
 * Content stays visible without JS. When enabled, marks elements in view once.
 */

const ROOT_READY = 'gsol-motion-ready'
const IN_CLASS = 'gsol-reveal--in'
const TARGET_SELECTOR = '.gsol-reveal, .gsol-fly'

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
    root.querySelectorAll(TARGET_SELECTOR).forEach(markIn)
    return () => undefined
  }

  document.documentElement.classList.add(ROOT_READY)

  const observed = new WeakSet<Element>()
  const vh = () => window.innerHeight || 800

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        markIn(entry.target)
        observer.unobserve(entry.target)
      }
    },
    /* Start animating when the block is meaningfully on-screen (not barely peeking). */
    { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.18 }
  )

  const watch = (el: Element) => {
    if (observed.has(el) || el.classList.contains(IN_CLASS)) return
    observed.add(el)
    const rect = el.getBoundingClientRect()
    const height = vh()
    // Already well into the viewport (hero / above-fold) — settle immediately.
    if (rect.top < height * 0.72 && rect.bottom > height * 0.08) {
      markIn(el)
      return
    }
    observer.observe(el)
  }

  const scan = () => {
    root.querySelectorAll(TARGET_SELECTOR).forEach(watch)
  }

  scan()

  // Late-mounted marketing cards (lazy sections). Coalesce to one scan per frame.
  let scanRaf = 0
  const scheduleScan = () => {
    if (scanRaf) return
    scanRaf = window.requestAnimationFrame(() => {
      scanRaf = 0
      scan()
    })
  }
  const mo =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => {
          scheduleScan()
        })
      : null
  if (mo && root instanceof Node) {
    mo.observe(root === document ? document.body : (root as Node), {
      childList: true,
      subtree: true
    })
  }

  const onResize = () => {
    /* no-op — IO handles; kept for future threshold tweaks */
  }
  window.addEventListener('orientationchange', onResize)

  return () => {
    if (scanRaf) window.cancelAnimationFrame(scanRaf)
    observer.disconnect()
    mo?.disconnect()
    window.removeEventListener('orientationchange', onResize)
    document.documentElement.classList.remove(ROOT_READY)
  }
}
