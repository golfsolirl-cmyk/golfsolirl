import { useEffect } from 'react'

export type PageSeo = {
  readonly title: string
  readonly description: string
  readonly path?: string
  readonly image?: string
  readonly type?: 'website' | 'article'
  readonly noindex?: boolean
}

const SITE_NAME = 'GolfSol Ireland'
const DEFAULT_DESCRIPTION =
  'Premium Costa del Sol golf travel for Irish golfers, with golf packages, accommodation, transfers, and practical trip planning in one place.'
const DEFAULT_IMAGE = '/images/about-golfsol-hero.jpg'
const JSON_LD_ID = 'gsol-organization-jsonld'

function getSiteOrigin() {
  if (typeof window === 'undefined') {
    return 'https://golfsolirl.com'
  }

  const envOrigin = import.meta.env.VITE_SITE_URL?.trim()
  return envOrigin ? envOrigin.replace(/\/+$/, '') : window.location.origin
}

function getAbsoluteUrl(path = '/') {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteOrigin()}${normalisedPath}`
}

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value))
    document.head.appendChild(element)
  }

  return element
}

function ensureLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector)

  if (!element) {
    element = document.createElement('link')
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value))
    document.head.appendChild(element)
  }

  return element
}

function setMetaContent(selector: string, attributes: Record<string, string>, content: string) {
  const element = ensureMeta(selector, attributes)
  element.setAttribute('content', content)
}

function setCanonical(url: string) {
  const link = ensureLink('link[rel="canonical"]', { rel: 'canonical' })
  link.setAttribute('href', url)
}

function setJsonLd() {
  const existing = document.getElementById(JSON_LD_ID)
  const script = existing instanceof HTMLScriptElement ? existing : document.createElement('script')

  script.id = JSON_LD_ID
  script.type = 'application/ld+json'
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: getSiteOrigin(),
    telephone: '+353874464766',
    email: 'hello@golfsolireland.ie',
    areaServed: ['Ireland', 'Costa del Sol', 'Malaga', 'Marbella', 'Sotogrande'],
    sameAs: ['https://golfsolirl.com']
  })

  if (!existing) {
    document.head.appendChild(script)
  }
}

export function applyPageSeo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false
}: PageSeo) {
  const resolvedDescription = description.trim() || DEFAULT_DESCRIPTION
  const resolvedPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const resolvedImage = image ?? DEFAULT_IMAGE
  const absoluteUrl = getAbsoluteUrl(resolvedPath)
  const absoluteImage = resolvedImage.startsWith('http') ? resolvedImage : getAbsoluteUrl(resolvedImage)

  document.title = title

  setMetaContent('meta[name="description"]', { name: 'description' }, resolvedDescription)
  setMetaContent('meta[name="robots"]', { name: 'robots' }, noindex ? 'noindex,nofollow' : 'index,follow')
  setMetaContent('meta[property="og:title"]', { property: 'og:title' }, title)
  setMetaContent('meta[property="og:description"]', { property: 'og:description' }, resolvedDescription)
  setMetaContent('meta[property="og:type"]', { property: 'og:type' }, type)
  setMetaContent('meta[property="og:url"]', { property: 'og:url' }, absoluteUrl)
  setMetaContent('meta[property="og:image"]', { property: 'og:image' }, absoluteImage)
  setMetaContent('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE_NAME)
  setMetaContent('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
  setMetaContent('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
  setMetaContent('meta[name="twitter:description"]', { name: 'twitter:description' }, resolvedDescription)
  setMetaContent('meta[name="twitter:image"]', { name: 'twitter:image' }, absoluteImage)
  setCanonical(absoluteUrl)
  setJsonLd()
}

export function usePageSeo(seo: PageSeo) {
  useEffect(() => {
    applyPageSeo(seo)
  }, [seo.description, seo.image, seo.noindex, seo.path, seo.title, seo.type])
}
