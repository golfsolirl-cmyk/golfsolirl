import { SEO_CONTACT } from './seo-contact'
import { SITE_ORIGIN } from '../site-seo'

/** Verified sameAs only — generic facebook.com homepage is excluded. */
const SAME_AS: readonly string[] = [
  SEO_CONTACT.whatsappHref,
  'https://www.instagram.com/golfsolireland/',
  'https://www.linkedin.com/in/gregory-mcdonald-44a537415/'
]

export function buildOrganizationSchema(origin: string = SITE_ORIGIN): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${origin}/#organization`,
    name: SEO_CONTACT.brandName,
    alternateName: SEO_CONTACT.alternateName,
    url: origin,
    email: SEO_CONTACT.email,
    description:
      'Irish-owned Costa del Sol golf holiday specialist for golfers travelling from Ireland — courses, hotels, tee times, and Málaga airport transfers.',
    telephone: [SEO_CONTACT.irishPhoneTel, SEO_CONTACT.spanishPhoneTel],
    address: {
      '@type': 'PostalAddress',
      streetAddress: SEO_CONTACT.address.streetAddress,
      addressLocality: SEO_CONTACT.address.addressLocality,
      addressRegion: SEO_CONTACT.address.addressRegion,
      postalCode: SEO_CONTACT.address.postalCode,
      addressCountry: SEO_CONTACT.address.addressCountry
    },
    areaServed: [
      { '@type': 'Country', name: 'Ireland' },
      { '@type': 'AdministrativeArea', name: 'Costa del Sol' }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SEO_CONTACT.irishPhoneTel,
        contactType: 'customer support',
        areaServed: 'IE',
        availableLanguage: ['English']
      },
      {
        '@type': 'ContactPoint',
        telephone: SEO_CONTACT.spanishPhoneTel,
        contactType: 'customer support',
        areaServed: 'ES',
        availableLanguage: ['English', 'Spanish']
      }
    ],
    sameAs: [...SAME_AS]
  }
}

export function buildWebSiteSchema(origin: string = SITE_ORIGIN): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: SEO_CONTACT.brandName,
    alternateName: SEO_CONTACT.alternateName,
    url: origin,
    publisher: { '@id': `${origin}/#organization` },
    inLanguage: 'en-IE'
  }
}

export function buildWebPageSchema(input: {
  readonly origin?: string
  readonly path: string
  readonly name: string
  readonly description: string
  readonly imageUrl?: string
}): Record<string, unknown> {
  const origin = input.origin ?? SITE_ORIGIN
  const url = `${origin}${input.path === '/' ? '' : input.path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#organization` },
    inLanguage: 'en-IE',
    ...(input.imageUrl
      ? {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: input.imageUrl
          }
        }
      : {})
  }
}

export function buildBreadcrumbListSchema(
  items: readonly { readonly name: string; readonly path: string }[],
  origin: string = SITE_ORIGIN
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path === '/' ? '' : item.path}`
    }))
  }
}
