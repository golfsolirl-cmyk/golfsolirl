type SeoConfig = {
  readonly title: string
  readonly description: string
  readonly path: string
  readonly image?: string
  readonly type?: 'website' | 'article'
  readonly noindex?: boolean
}

const DEFAULT_OG_IMAGE = '/images/hero-malaga-transfers.jpg'
const ORGANIZATION_JSONLD_ID = 'gsol-org-jsonld'

const ensureMetaTag = (selector: string, attributes: Record<string, string>) => {
  const head = document.head
  let meta = head.querySelector<HTMLMetaElement>(selector)

  if (!meta) {
    meta = document.createElement('meta')
    head.appendChild(meta)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    meta?.setAttribute(key, value)
  })
}

const ensureCanonicalLink = (href: string) => {
  const head = document.head
  let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    head.appendChild(link)
  }
  link.setAttribute('href', href)
}

const toAbsoluteUrl = (origin: string, maybeRelative: string) => {
  if (/^https?:\/\//i.test(maybeRelative)) {
    return maybeRelative
  }

  return `${origin}${maybeRelative.startsWith('/') ? maybeRelative : `/${maybeRelative}`}`
}

export const applyPageSeo = ({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false
}: SeoConfig) => {
  const origin = window.location.origin
  const canonicalUrl = toAbsoluteUrl(origin, path)
  const imageUrl = toAbsoluteUrl(origin, image)

  document.title = title

  ensureMetaTag('meta[name="description"]', { name: 'description', content: description })
  ensureMetaTag('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' })

  ensureMetaTag('meta[property="og:title"]', { property: 'og:title', content: title })
  ensureMetaTag('meta[property="og:description"]', { property: 'og:description', content: description })
  ensureMetaTag('meta[property="og:type"]', { property: 'og:type', content: type })
  ensureMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
  ensureMetaTag('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
  ensureMetaTag('meta[property="og:locale"]', { property: 'og:locale', content: 'en_IE' })

  ensureMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })

  ensureCanonicalLink(canonicalUrl)
}

export const ensureOrganizationStructuredData = () => {
  const origin = window.location.origin
  const existing = document.getElementById(ORGANIZATION_JSONLD_ID)
  if (existing) {
    return
  }

  const script = document.createElement('script')
  script.id = ORGANIZATION_JSONLD_ID
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Golf Sol Ireland',
    url: origin,
    description: 'Premium Costa del Sol golf holidays designed for Irish golfers.',
    areaServed: ['Ireland', 'Costa del Sol'],
    email: 'hello@golfsolireland.ie',
    telephone: '+353874464766'
  })

  document.head.appendChild(script)
}
