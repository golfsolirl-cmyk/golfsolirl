import { useEffect } from 'react'

const DEFAULT_OG_IMAGE = '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp'
const SITE_NAME = 'Golf Sol Ireland'

export interface PageMeta {
  readonly title: string
  readonly description?: string
  readonly canonicalPath?: string
  readonly ogImage?: string
  readonly noIndex?: boolean
}

const upsertMeta = (attr: 'name' | 'property', key: string, content: string | undefined) => {
  if (!content) {
    return
  }

  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

const upsertLink = (rel: string, href: string | undefined) => {
  if (!href) {
    return
  }

  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const origin = window.location.origin
    const canonical = meta.canonicalPath ? `${origin}${meta.canonicalPath}` : `${origin}${window.location.pathname}`
    const ogImage = meta.ogImage?.startsWith('http') ? meta.ogImage : `${origin}${meta.ogImage ?? DEFAULT_OG_IMAGE}`
    const fullTitle = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`

    document.title = fullTitle
    upsertMeta('name', 'description', meta.description)
    upsertMeta('name', 'robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', meta.description)
    upsertMeta('name', 'twitter:image', ogImage)
  }, [meta.title, meta.description, meta.canonicalPath, meta.ogImage, meta.noIndex])
}

export function useJsonLd(id: string, data: Record<string, unknown>) {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = id
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)

    return () => {
      el?.remove()
    }
  }, [id, data])
}
