import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { usePageMeta } from '../lib/use-page-meta'

export function NotFoundPage() {
  usePageMeta({
    title: 'Page not found',
    description: 'This Golf Sol Ireland page could not be found.',
    canonicalPath: '/404',
    noIndex: true
  })

  return (
    <div className="ge-page flex min-h-screen flex-col bg-offwhite">
      <GeNavbar />
      <main
        className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center"
        id="main"
      >
        <p className="font-ge text-xs font-bold uppercase tracking-[0.2em] text-brand-700">404</p>
        <h1 className="mt-4 font-ge text-[2rem] font-extrabold text-gs-dark sm:text-[2.6rem]">Page not found</h1>
        <p className="mt-3 max-w-md font-ge text-base leading-relaxed text-forest-700">
          The link may have moved or the address was mistyped. Head back to the homepage or contact our trip desk.
        </p>
        <a
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gs-green px-7 py-3 font-ge text-sm font-bold uppercase tracking-[0.12em] text-white"
          href="/#top"
        >
          Back home
        </a>
      </main>
      <GeFooter />
    </div>
  )
}
