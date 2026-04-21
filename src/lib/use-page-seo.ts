import { useEffect } from 'react'

type JsonLdValue = Record<string, unknown> | readonly Record<string, unknown>[]

interface PageSeoConfig {
  readonly title: string
  readonly description: string
  readonly path?: string
  readonly image?: string
  readonly noIndex?: boolean
  readonly type?: 'website' | 'article'
  readonly jsonLd?: JsonLdValue
  readonly keywords?: readonly string[]
}

const DEFAULT_IMAGE = '/images/hero-malaga-transfers-1600.jpg'
const SITE_NAME = 'Golf Sol Ireland'

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }

  element.href = href
}

function upsertJsonLd(payload: JsonLdValue | undefined) {
  const existing = document.head.querySelector<HTMLScriptElement>('script[data-gsi-jsonld="true"]')

  if (!payload) {
    existing?.remove()
    return
  }

  const script = existing ?? document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.gsiJsonld = 'true'
  script.text = JSON.stringify(payload)

  if (!existing) {
    document.head.appendChild(script)
  }
}

function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return new URL(path, window.location.origin).toString()
}

export function usePageSeo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
  type = 'website',
  jsonLd,
  keywords
}: PageSeoConfig) {
  useEffect(() => {
    const canonicalUrl = toAbsoluteUrl(path ?? `${window.location.pathname}${window.location.search}`)
    const imageUrl = toAbsoluteUrl(image)
    const robots = noIndex ? 'noindex, nofollow' : 'index, follow'

    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    if (keywords?.length) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') })
    }
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
    upsertLink('canonical', canonicalUrl)
    upsertJsonLd(jsonLd)
  }, [description, image, jsonLd, keywords, noIndex, path, title, type])
}
