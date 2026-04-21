type SeoConfig = {
  readonly title: string
  readonly description: string
  readonly path: string
  readonly imagePath?: string
  readonly noindex?: boolean
}

const DEFAULT_SITE_URL = 'https://golfsolirl.com'
const DEFAULT_IMAGE_PATH = '/images/hero-malaga-transfers-1600.jpg'
const SITE_NAME = 'GolfSol Ireland'

function normalisePath(path: string): string {
  if (!path || path === '/') {
    return '/'
  }

  const cleanedPath = path.replace(/\/+$/, '')
  return cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`
}

function getSiteUrl(): string {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim()
  return configured && /^https?:\/\//.test(configured) ? configured.replace(/\/+$/, '') : DEFAULT_SITE_URL
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl
  }

  const base = getSiteUrl()
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${path}`
}

function setMetaByName(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setMetaByProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

export function applySeo({ title, description, path, imagePath = DEFAULT_IMAGE_PATH, noindex = false }: SeoConfig) {
  const canonicalPath = normalisePath(path)
  const canonicalUrl = toAbsoluteUrl(canonicalPath)
  const imageUrl = toAbsoluteUrl(imagePath)
  const robots = noindex ? 'noindex, nofollow' : 'index, follow'

  document.title = title
  setCanonical(canonicalUrl)

  setMetaByName('description', description)
  setMetaByName('robots', robots)

  setMetaByProperty('og:type', 'website')
  setMetaByProperty('og:site_name', SITE_NAME)
  setMetaByProperty('og:title', title)
  setMetaByProperty('og:description', description)
  setMetaByProperty('og:url', canonicalUrl)
  setMetaByProperty('og:image', imageUrl)

  setMetaByName('twitter:card', 'summary_large_image')
  setMetaByName('twitter:title', title)
  setMetaByName('twitter:description', description)
  setMetaByName('twitter:image', imageUrl)
}
