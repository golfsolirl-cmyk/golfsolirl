import { useRef, type ReactNode } from 'react'
import { BrandFleetHeroPanel } from './brand-fleet-hero-panel'
import { LuxuryButton } from './ui/button'
import { Logo } from './ui/logo'
import { SiteFooter } from './site-footer'
import { navLinks } from '../data/site-content'

const siteFooterIntro =
  'Golf Sol Ireland exists for golfers who want the Costa del Sol done properly: better courses, smarter stays, and a smoother trip from first enquiry to final round.'

const siteCopyrightNote = 'Golf travel planning for Irish groups heading to the Costa del Sol.'

export type PdfSiteShellProps = {
  readonly children: ReactNode
}

/**
 * Static shell matching the live site header (scrolled navbar look) and full SiteFooter for print/PDF pages.
 */
export function PdfSiteShell({ children }: PdfSiteShellProps) {
  const footerRef = useRef<HTMLElement | null>(null)

  return (
    <div className="pdf-document-root bg-offwhite text-forest-900">
      <header className="border-b border-white/10 bg-forest-950 px-4 py-5 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <a aria-label="Golf Sol Ireland home" className="inline-flex shrink-0" href="/">
            <Logo tone="scrolled" />
          </a>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {navLinks.map((link) => (
              <a
                key={link}
                className="text-sm tracking-wide text-white transition-colors hover:text-white"
                href={`/#${link.toLowerCase()}`}
              >
                {link}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap gap-3">
            <LuxuryButton className="!border-white/25 !bg-forest-900 !text-white hover:!bg-forest-900" href="/dashboard/login" variant="outline">
              Sign in
            </LuxuryButton>
            <LuxuryButton className="!px-5 !py-2.5 !text-xs" href="/packages" variant="outline">
              View packages
            </LuxuryButton>
          </div>
        </div>
      </header>

      <div className="border-b border-ge-gray100 bg-offwhite px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <BrandFleetHeroPanel showBadges variant="pdf-shell" />
        </div>
      </div>

      {children}

      <SiteFooter copyrightNote={siteCopyrightNote} footerRef={footerRef} intro={siteFooterIntro} />
    </div>
  )
}
