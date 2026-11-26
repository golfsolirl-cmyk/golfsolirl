import type { MouseEvent } from 'react'

const formTargetSelectors = [
  '#quote-form',
  '#continue-trip-form',
  '#transport-enquire',
  '#transport-enquiry',
  '#ge-content-enquire',
  '#ge-enquiry-form',
  '#calculator',
  '#enquire',
  '#plan-trip'
] as const

/** Sticky header offset so the form title + first field sit above the fold. */
export function getStickyHeaderOffsetPx(): number {
  if (typeof document === 'undefined') return 88
  const header =
    document.querySelector<HTMLElement>('[data-site-header]') ||
    document.querySelector<HTMLElement>('header') ||
    document.querySelector<HTMLElement>('.ge-navbar')
  const h = header?.getBoundingClientRect().height
  return Math.max(72, Math.ceil(h || 88) + 12)
}

export function getPageFormTarget(fallbackSelector?: string) {
  if (typeof document === 'undefined') return null

  for (const selector of formTargetSelectors) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) return element
  }

  if (fallbackSelector) {
    return document.querySelector<HTMLElement>(fallbackSelector)
  }

  return null
}

function focusFirstField(root: HTMLElement) {
  const field = root.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button[data-service-chip]'
  )
  if (!field) return
  try {
    field.focus({ preventScroll: true })
  } catch {
    field.focus()
  }
}

/**
 * Scroll form into view with sticky-header offset and focus the first field.
 */
export function scrollToPageFormTarget(fallbackSelector?: string) {
  const target = getPageFormTarget(fallbackSelector)
  if (!target) return false

  const offset = getStickyHeaderOffsetPx()
  const top = target.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  window.setTimeout(() => focusFirstField(target), 320)
  return true
}

export function handleScrollToFormTarget(event: MouseEvent<HTMLAnchorElement>, fallbackSelector?: string) {
  const href = event.currentTarget.getAttribute('href') || ''
  if (href.startsWith('#') || href.includes('#')) {
    if (scrollToPageFormTarget(fallbackSelector || (href.includes('#') ? `#${href.split('#')[1]}` : undefined))) {
      event.preventDefault()
    }
  }
}

/** On load / hash change: if URL hash targets a form, scroll + focus. */
export function bindFormHashScroll() {
  if (typeof window === 'undefined') return () => {}
  const run = () => {
    const hash = window.location.hash
    if (!hash) return
    if (
      formTargetSelectors.includes(hash as (typeof formTargetSelectors)[number]) ||
      hash === '#quote-form'
    ) {
      window.setTimeout(() => scrollToPageFormTarget(hash), 50)
    }
  }
  run()
  window.addEventListener('hashchange', run)
  return () => window.removeEventListener('hashchange', run)
}
