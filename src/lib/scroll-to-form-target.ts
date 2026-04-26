import type { MouseEvent } from 'react'

const formTargetSelectors = [
  '#continue-trip-form',
  '#transport-enquire',
  '#transport-enquiry',
  '#ge-content-enquire',
  '#ge-enquiry-form',
  '#enquire'
] as const

export function getPageFormTarget() {
  if (typeof document === 'undefined') return null

  for (const selector of formTargetSelectors) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) return element
  }

  return null
}

export function scrollToPageFormTarget(fallbackSelector?: string) {
  const target =
    getPageFormTarget() ??
    (fallbackSelector && typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>(fallbackSelector)
      : null)

  if (!target) return false

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}

export function handleScrollToFormTarget(event: MouseEvent<HTMLAnchorElement>, fallbackSelector?: string) {
  if (scrollToPageFormTarget(fallbackSelector)) {
    event.preventDefault()
  }
}
