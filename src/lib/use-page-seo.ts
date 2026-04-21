import { useEffect } from 'react'

export interface PageSeoConfig {
  readonly title: string
  readonly description?: string
  readonly canonicalPath?: string
  readonly noIndex?: boolean
  readonly ogImage?: string
}

const DEFAULT_DESCRIPTION =
  'Golf Sol Ireland creates premium Costa del Sol golf holidays for Irish travellers with handpicked packages, hotels, tee times, and transfers.'

function ensureMeta(selector: string, factory: () => HTMLMetaElement) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector)
  if (existing) {
    return existing
  }

  const created = factory()
  document.head.appendChild(created)
  return created
}

function ensureLink(selector: string, factory: () => HTMLLinkElement) {
  const existing = document.head.querySelector<HTMLLinkElement>(selector)
  if (existing) {
    return existing
  }

  const created = factory()
  document.head.appendChild(created)
  return created
}

function removeElement(selector: string) {
  const existing = document.head.querySelector(selector)
  existing?.parentElement?.removeChild(existing)
}

function toAbsoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, window.location.origin).toString()
  } catch {
    return `${window.location.origin}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
  }
}

function applyPageSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noIndex = false,
  ogImage
}: PageSeoConfig) {
  document.title = title

  const resolvedCanonical = toAbsoluteUrl(canonicalPath ?? `${window.location.pathname}${window.location.search}`)
  const resolvedImage = ogImage ? toAbsoluteUrl(ogImage) : null

  ensureMeta('meta[name="description"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('name', 'description')
    return element
  }).setAttribute('content', description)

  ensureMeta('meta[name="robots"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('name', 'robots')
    return element
  }).setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow')

  ensureMeta('meta[property="og:type"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('property', 'og:type')
    return element
  }).setAttribute('content', 'website')

  ensureMeta('meta[property="og:title"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('property', 'og:title')
    return element
  }).setAttribute('content', title)

  ensureMeta('meta[property="og:description"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('property', 'og:description')
    return element
  }).setAttribute('content', description)

  ensureMeta('meta[property="og:url"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('property', 'og:url')
    return element
  }).setAttribute('content', resolvedCanonical)

  ensureMeta('meta[name="twitter:card"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('name', 'twitter:card')
    return element
  }).setAttribute('content', resolvedImage ? 'summary_large_image' : 'summary')

  ensureMeta('meta[name="twitter:title"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('name', 'twitter:title')
    return element
  }).setAttribute('content', title)

  ensureMeta('meta[name="twitter:description"]', () => {
    const element = document.createElement('meta')
    element.setAttribute('name', 'twitter:description')
    return element
  }).setAttribute('content', description)

  if (resolvedImage) {
    ensureMeta('meta[property="og:image"]', () => {
      const element = document.createElement('meta')
      element.setAttribute('property', 'og:image')
      return element
    }).setAttribute('content', resolvedImage)

    ensureMeta('meta[name="twitter:image"]', () => {
      const element = document.createElement('meta')
      element.setAttribute('name', 'twitter:image')
      return element
    }).setAttribute('content', resolvedImage)
  } else {
    removeElement('meta[property="og:image"]')
    removeElement('meta[name="twitter:image"]')
  }

  ensureLink('link[rel="canonical"]', () => {
    const element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    return element
  }).setAttribute('href', resolvedCanonical)
}

export function usePageSeo(config: PageSeoConfig) {
  useEffect(() => {
    applyPageSeo(config)
  }, [config])
}

export function useOptionalPageSeo(config: PageSeoConfig | null | undefined) {
  useEffect(() => {
    if (!config) {
      return
    }
    applyPageSeo(config)
  }, [config])
}
