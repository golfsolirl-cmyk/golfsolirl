import { type ReactNode } from 'react'
import { Navbar } from './home/navbar'
import { SiteFooter } from './site-footer'
import type { SiteFooterProps } from './site-footer'

type MarketingShellProps = {
  readonly children: ReactNode
  readonly footerRef: SiteFooterProps['footerRef']
  readonly intro: string
  readonly copyrightNote: string
  readonly navLinks?: readonly string[]
  readonly primaryCta?: string
}

const defaultNavLinks = ['Packages', 'Courses', 'Hotels', 'Transfers', 'Testimonials'] as const

export function MarketingShell({
  children,
  footerRef,
  intro,
  copyrightNote,
  navLinks = defaultNavLinks,
  primaryCta = 'Plan your trip'
}: MarketingShellProps) {
  return (
    <div className="overflow-x-hidden bg-offwhite">
      <Navbar links={navLinks} primaryCta={primaryCta} />
      <main>{children}</main>
      <SiteFooter copyrightNote={copyrightNote} footerRef={footerRef} intro={intro} />
    </div>
  )
}
