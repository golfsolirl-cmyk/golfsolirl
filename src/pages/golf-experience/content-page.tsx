import { useMemo } from 'react'
import { usePageSeo } from '../../lib/use-page-seo'
import { getGeContentPage } from './data/content-pages'
import { MarketingPageTemplate } from './components/marketing-page-template'

function normalisePath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function GeContentPage() {
  const path = useMemo(() => normalisePath(), [])
  const page = useMemo(() => getGeContentPage(path), [path])

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ge-gray50 px-5 text-center">
        <div>
          <p className="font-ge text-[2rem] font-extrabold text-gs-dark sm:text-[2.4rem]">Page not found</p>
          <p className="mt-2 font-ge text-base text-ge-gray500">This link may have moved.</p>
          <a
            href="/#top"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gs-green px-6 py-3 font-ge text-base font-bold uppercase tracking-[0.12em] text-white"
          >
            Back home
          </a>
        </div>
      </div>
    )
  }

  usePageSeo({
    title: page.metaTitle,
    description: page.metaDescription,
    canonicalPath: page.canonicalPath ?? path,
    noIndex: page.noIndex,
    ogImage: page.heroImage
  })

  return <MarketingPageTemplate page={page} />
}
