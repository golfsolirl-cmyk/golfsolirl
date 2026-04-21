import { useEffect } from 'react'
import { siteConfig } from './site-config'

type JsonLdObject = Record<string, unknown>

export interface PageMetadataInput {
  readonly title: string
  readonly description: string
  readonly canonicalPath?: string
  readonly image?: string
  readonly type?: 'website' | 'article'
  readonly noindex?: boolean
  readonly keywords?: readonly string[]
  readonly jsonLd?: JsonLdObject | readonly JsonLdObject[]
}

const SITE_NAME = 'GolfSol Ireland'
const DEFAULT_IMAGE = '/images/hero-malaga-transfers-1600.jpg'
const DEFAULT_THEME_COLOR = '#063B2A'
const MANAGED_ATTR = 'data-gsol-managed'
const JSON_LD_ID = 'gsol-json-ld'

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

const toAbsoluteUrl = (value: string) => {
  if (typeof window === 'undefined') {
    return isAbsoluteUrl(value) ? value : new URL(value, siteConfig.siteUrl).toString()
  }

  if (isAbsoluteUrl(value)) {
    return value
  }

  return new URL(value, siteConfig.siteUrl || window.location.origin).toString()
}

const ensureTag = <T extends HTMLElement>(
  query: string,
  create: () => T
): T => {
  const existing = document.head.querySelector<T>(query)
  if (existing) {
    return existing
  }

  const element = create()
  element.setAttribute(MANAGED_ATTR, 'true')
  document.head.appendChild(element)
  return element
}

const setMetaTag = (selector: string, key: 'name' | 'property', value: string, content: string) => {
  const tag = ensureTag<HTMLMetaElement>(selector, () => {
    const element = document.createElement('meta')
    element.setAttribute(key, value)
    return element
  })
  tag.setAttribute('content', content)
}

const setLinkTag = (selector: string, rel: string, href: string) => {
  const tag = ensureTag<HTMLLinkElement>(selector, () => {
    const element = document.createElement('link')
    element.setAttribute('rel', rel)
    return element
  })
  tag.setAttribute('href', href)
}

const removeTagIfManaged = (selector: string) => {
  const tag = document.head.querySelector<HTMLElement>(selector)
  if (tag?.getAttribute(MANAGED_ATTR) === 'true') {
    tag.remove()
  }
}

const setJsonLd = (jsonLd: PageMetadataInput['jsonLd']) => {
  const existing = document.getElementById(JSON_LD_ID)
  if (!jsonLd) {
    existing?.remove()
    return
  }

  const script =
    existing instanceof HTMLScriptElement
      ? existing
      : (() => {
          const element = document.createElement('script')
          element.id = JSON_LD_ID
          element.type = 'application/ld+json'
          element.setAttribute(MANAGED_ATTR, 'true')
          document.head.appendChild(element)
          return element
        })()

  script.textContent = JSON.stringify(jsonLd)
}

export const buildWebsiteJsonLd = ({
  title,
  description,
  canonicalUrl,
  image
}: {
  readonly title: string
  readonly description: string
  readonly canonicalUrl: string
  readonly image: string
}) => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: canonicalUrl
  },
  {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    description,
    url: canonicalUrl,
    image
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    image
  }
] as const

export const buildWebPageJsonLd = ({
  title,
  description,
  canonicalUrl,
  image,
  type = 'WebPage'
}: {
  readonly title: string
  readonly description: string
  readonly canonicalUrl: string
  readonly image: string
  readonly type?: 'WebPage' | 'Article'
}) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name: title,
  description,
  url: canonicalUrl,
  image
})

export function usePageMetadata({
  title,
  description,
  canonicalPath,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  keywords,
  jsonLd
}: PageMetadataInput) {
  useEffect(() => {
    const normalizedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const normalizedCanonicalPath = canonicalPath ?? window.location.pathname
    const canonicalUrl = toAbsoluteUrl(normalizedCanonicalPath)
    const absoluteImage = toAbsoluteUrl(image)
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow'

    document.title = normalizedTitle

    setMetaTag('meta[name="description"]', 'name', 'description', description)
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent)
    setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', robotsContent)
    setMetaTag('meta[name="theme-color"]', 'name', 'theme-color', DEFAULT_THEME_COLOR)
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', normalizedTitle)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type)
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', absoluteImage)
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', normalizedTitle)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', absoluteImage)

    if (keywords && keywords.length > 0) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '))
    } else {
      removeTagIfManaged('meta[name="keywords"]')
    }

    setLinkTag('link[rel="canonical"]', 'canonical', canonicalUrl)

    const defaultJsonLd =
      jsonLd ??
      buildWebPageJsonLd({
        title: normalizedTitle,
        description,
        canonicalUrl,
        image: absoluteImage,
        type: type === 'article' ? 'Article' : 'WebPage'
      })

    setJsonLd(defaultJsonLd)
  }, [canonicalPath, description, image, jsonLd, keywords, noindex, title, type])
}
