import type { SVGProps } from 'react'
import { ChevronRight, Mail } from 'lucide-react'
import { FooterBrandLogoPicture } from '../../../components/brand-logo-picture'
import { BrandPlaneToFairwayTagline } from '../../../components/brand-plane-to-fairway-tagline'
import { GOLFSOL_BRAND_LOGO_FOOTER_SIZES, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../../lib/brand-logo-assets'
import { GeButton } from '../components/ge-button'
import { GeDualPhoneFooterLines } from '../components/ge-dual-phone-contact'
import { aboutFooterCopy, contactInfo } from '../data/copy'
import { GsolGoldCornerAccents } from '../../../components/gsol-gold-corner-accents'
import { footerColumns } from '../data/nav'

type IconProps = SVGProps<SVGSVGElement>

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 8.2h2.2V5.1c-.4 0-1.7-.2-3.2-.2-3.2 0-5.4 1.9-5.4 5.5V13H5.5v3.4H7.6V22h3.5v-5.6h2.7l.4-3.4h-3.1v-2.3c0-1 .3-1.7 1.9-1.7Z" />
    </svg>
  )
}

function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm5.1-8.2a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 4.4c-2 0-2.3 0-3.1.1a4.7 4.7 0 0 0-3.4 3.4c-.1.8-.1 1.1-.1 3.1s0 2.3.1 3.1a4.7 4.7 0 0 0 3.4 3.4c.8.1 1.1.1 3.1.1s2.3 0 3.1-.1a4.7 4.7 0 0 0 3.4-3.4c.1-.8.1-1.1.1-3.1s0-2.3-.1-3.1a4.7 4.7 0 0 0-3.4-3.4c-.8-.1-1.1-.1-3.1-.1Zm0 1.6c2 0 2.2 0 3 .1a3.1 3.1 0 0 1 2.2 2.2c.1.8.1 1 .1 3s0 2.2-.1 3a3.1 3.1 0 0 1-2.2 2.2c-.8.1-1 .1-3 .1s-2.2 0-3-.1a3.1 3.1 0 0 1-2.2-2.2c-.1-.8-.1-1-.1-3s0-2.2.1-3a3.1 3.1 0 0 1 2.2-2.2c.8-.1 1-.1 3-.1Z" />
    </svg>
  )
}

function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.6 3.5h2.7l-5.9 6.7 7 9.3h-5.5l-4.3-5.6-4.9 5.6H4l6.3-7.2L3.7 3.5h5.6l3.9 5.1 4.4-5.1Zm-1 14.4h1.5L7.5 5h-1.6l10.7 12.9Z" />
    </svg>
  )
}

function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.3 9.1H3.5V20.5h2.8V9.1ZM4.9 3.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20.5 20.5h-2.8v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H11V9.1h2.7v1.6h.1c.4-.7 1.3-1.8 3.2-1.8 3.4 0 4 2.2 4 5.1v6.5Z" />
    </svg>
  )
}

const socials = [
  { label: 'Facebook', icon: FacebookIcon, href: 'https://www.facebook.com/' },
  { label: 'Instagram', icon: InstagramIcon, href: 'https://www.instagram.com/golfsolireland/' },
  { label: 'X', icon: XIcon, href: 'https://x.com/golfsolireland' },
  { label: 'LinkedIn', icon: LinkedInIcon, href: 'https://www.linkedin.com/in/gregory-mcdonald-44a537415/' }
]

export function GeFooter() {
  return (
    <footer className="relative overflow-hidden bg-gs-dark text-white">
      <GsolGoldCornerAccents preset="footer" />
      <div className="relative z-[1] mx-auto max-w-[1180px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {footerColumns.map((column) => (
            <div key={column.title}>
              {column.title === 'Docs' ? (
                <div className="mb-3 flex items-center gap-3">
                  <FooterBrandLogoPicture
                    alt=""
                    width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
                    height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
                    sizes="72px"
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.4)] sm:h-14 sm:w-14"
                  />
                  <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-emerald-200 drop-shadow-sm sm:text-[0.82rem]">
                    {column.title}
                  </p>
                </div>
              ) : (
                <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-emerald-200 drop-shadow-sm sm:text-[0.82rem]">
                  {column.title}
                </p>
              )}
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`} className="flex items-start gap-2">
                    <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-gs-electric" aria-hidden="true" />
                    <a
                      href={link.href}
                      className="font-ge text-[1.05rem] leading-7 text-white transition-colors hover:text-[#fbe8b5] sm:text-[0.98rem]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div id="contact-us">
            <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-emerald-200 drop-shadow-sm sm:text-[0.82rem]">
              Contact Us
            </p>
            <ul className="mt-4 space-y-3">
              <GeDualPhoneFooterLines />
              <li className="flex items-start gap-2">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-emerald-200/90" aria-hidden="true" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="font-ge text-[1.05rem] leading-7 text-white transition-colors hover:text-[#fbe8b5] sm:text-[0.98rem]"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
            <p className="mt-6 font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-emerald-200 drop-shadow-sm sm:text-[0.82rem]">
              Follow Social
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  aria-label={`Follow us on ${label}`}
                  href={href}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-700/45 bg-gs-dark/50 text-silver-200 shadow-[0_0_0_1px_rgba(19, 96, 71,0.2)] ring-1 ring-brand-700/35 transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:bg-forest-900 hover:text-white hover:shadow-[0_0_0_1px_rgba(217,190,122,0.35)] hover:ring-brand-700/55"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
          <div>
            <FooterBrandLogoPicture
              alt="GolfSol Ireland"
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              sizes={GOLFSOL_BRAND_LOGO_FOOTER_SIZES}
              loading="lazy"
              decoding="async"
              className="h-auto w-full max-w-[min(100%,20rem)] select-none object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:max-w-[21rem] md:max-w-[22.5rem]"
            />
            <BrandPlaneToFairwayTagline tone="dark" layout="footer" className="mt-4 sm:mt-5" />
            <p className="mt-5 font-ge text-[1.05rem] leading-8 text-white sm:mt-6 sm:text-[0.98rem]">{aboutFooterCopy}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="font-ge text-[0.95rem] font-extrabold uppercase tracking-[0.18em] text-[#fbe8b5] drop-shadow-[0_0_14px_rgba(217,190,122,0.3)] sm:text-[0.86rem]">
              Stay in touch
            </p>
            <div className="flex flex-wrap gap-3">
              <GeButton href="/newsletter" variant="outline-white" size="sm">
                Join our newsletter
              </GeButton>
              <GeButton href="/testimonials" variant="outline-white" size="sm">
                Give a Testimonial
              </GeButton>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 px-5 py-5 text-center sm:flex-row sm:flex-wrap sm:justify-between sm:text-left">
          <p className="font-ge text-[0.98rem] leading-6 text-white sm:text-[0.88rem]">
            Copyright © {new Date().getFullYear()} – GolfSol Ireland – All Rights Reserved
          </p>
          <p className="font-ge text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-[#fbe8b5] drop-shadow-[0_0_12px_rgba(217,190,122,0.25)] sm:text-[0.86rem]">
            Irish-owned · Costa del Sol golf specialists
          </p>
        </div>
      </div>
    </footer>
  )
}
