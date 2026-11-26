import { GeSection } from '../components/ge-section'

const links = [
  { label: 'Transfers', href: '/services/transport' },
  { label: 'Golf courses', href: '/golf-courses' },
  { label: 'Hotels', href: '/accommodation' }
] as const

/** Thin secondary strip — services live under bundles, not as competing cards. */
export function GeHomeWhatWeDo() {
  return (
    <GeSection background="cream" className="border-t border-chrome-200/80 py-8 sm:py-10">
      <div className="mx-auto flex max-w-[920px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="font-ge text-[0.95rem] leading-6 text-ge-gray600">
          Every bundle can include private transfers, tee times and your hotel.
        </p>
        <nav aria-label="Trip building blocks" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-gs-dark underline decoration-brand-500/40 underline-offset-4 hover:text-gs-green"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </GeSection>
  )
}
