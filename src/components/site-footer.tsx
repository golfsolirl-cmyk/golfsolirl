import { ChevronRight } from 'lucide-react'
import { FaBluesky, FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6'
import { integrationRegistry } from '../config/integrations'
import { FooterCompanyContact } from './footer-company-contact'
import { AmbientGolfBall } from './ui/ambient-golf-ball'
import { Logo } from './ui/logo'
import { footerGroups, footerSocialLinks } from '../data/site-content'
import { useAuth } from '../providers/auth-provider'
import type { RefObject } from 'react'

const footerSocialIconMap = {
  LinkedIn: FaLinkedinIn,
  Facebook: FaFacebookF,
  WhatsApp: FaWhatsapp,
  Bluesky: FaBluesky
} as const

export type SiteFooterProps = {
  readonly footerRef: RefObject<HTMLElement | null>
  readonly intro: string
  readonly copyrightNote: string
}

export function SiteFooter({ footerRef, intro, copyrightNote }: SiteFooterProps) {
  const { session, profile, isLoading: authLoading } = useAuth()
  const showAuthFooter = integrationRegistry.supabase.enabled
  const dashboardHref = profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard'

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t border-white/10 px-6 py-10 text-white"
      style={{ backgroundColor: 'var(--gsol-section-footer-bg)' }}
    >
      <AmbientGolfBall className="right-[3%] top-2 opacity-75 xl:right-[6%]" size="sm" tone="footer" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md">
          <Logo tone="hero" />
          <p className="mt-4 text-[1.02rem] leading-8 text-white/72">{intro}</p>
          {showAuthFooter && !authLoading ? (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">Client area</p>
              <ul className="mt-3">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  <a
                    className="text-base font-medium text-white transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
                    href={session ? dashboardHref : '/login'}
                  >
                    {session ? 'My dashboard' : 'Sign in'}
                  </a>
                </li>
              </ul>
            </div>
          ) : null}
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">Stay connected</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {footerSocialLinks.map(({ label, href }) => {
                const Icon = footerSocialIconMap[label]

                return (
                  <a
                    key={label}
                    aria-label={`Visit our ${label} page`}
                    className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#dc5801]/25 bg-white/5 text-[#dc5801] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#dc5801]/65 hover:bg-[#dc5801] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc5801] focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
                    href={href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">{group.title}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((item) => (
                  <li key={item.href} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                    <a
                      className="text-base font-medium text-white transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <FooterCompanyContact />

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-5 text-base text-white/62 md:flex-row md:items-center md:justify-between">
        <p>Copyright {new Date().getFullYear()} Golf Sol Ireland. All rights reserved.</p>
        <p>{copyrightNote}</p>
      </div>
    </footer>
  )
}
