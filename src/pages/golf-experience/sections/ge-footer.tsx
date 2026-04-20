import { ChevronRight, Mail, Phone } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { GeBrandLockup } from '../components/brand-lockup'
import { GeButton } from '../components/ge-button'
import { aboutFooterCopy, contactInfo } from '../data/copy'
import { footerColumns } from '../data/nav'

const socials = [
  { label: 'Facebook', icon: FaFacebookF, href: '#' },
  { label: 'Instagram', icon: FaInstagram, href: '#' },
  { label: 'X', icon: FaXTwitter, href: '#' },
  { label: 'LinkedIn', icon: FaLinkedinIn, href: '#' }
]

export function GeFooter() {
  return (
    <footer className="bg-gs-dark text-white">
      <div className="mx-auto max-w-[1180px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gs-gold drop-shadow-[0_0_12px_rgba(255,199,44,0.22)]">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`} className="flex items-start gap-2">
                    <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-gs-green-light" aria-hidden="true" />
                    <a
                      href={link.href}
                      className="font-ge text-base text-white/90 transition-colors hover:text-ge-orange sm:text-[0.95rem]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div id="contact-us">
            <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gs-gold drop-shadow-[0_0_12px_rgba(255,199,44,0.22)]">
              Contact Us
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="mt-1 h-4 w-4 shrink-0 text-gs-gold/85" aria-hidden="true" />
                <a
                  href={`tel:${contactInfo.phoneTel}`}
                  className="font-ge text-base text-white/95 hover:text-gs-green-light sm:text-[0.95rem]"
                >
                  {contactInfo.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-gs-gold/85" aria-hidden="true" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="font-ge text-base text-white/95 hover:text-gs-green-light sm:text-[0.95rem]"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
            <p className="mt-6 font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gs-gold drop-shadow-[0_0_12px_rgba(255,199,44,0.22)]">
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gs-gold/45 bg-gs-dark/50 text-gs-gold shadow-[0_0_0_1px_rgba(255,199,44,0.2)] ring-1 ring-gs-gold/35 transition-all hover:-translate-y-0.5 hover:border-gs-gold hover:bg-white/[0.06] hover:text-gs-gold-light hover:shadow-[0_0_0_1px_rgba(255,226,122,0.35)] hover:ring-gs-gold/55"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
          <div>
            <GeBrandLockup tone="on-dark" mode="footer" />
            <p className="mt-6 font-ge text-base leading-7 text-white/80 sm:text-[0.95rem]">{aboutFooterCopy}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white/70">
              Stay in touch
            </p>
            <div className="flex flex-wrap gap-3">
              <GeButton href="#enquire" variant="outline-white" size="sm">
                Join our newsletter
              </GeButton>
              <GeButton href="#enquire" variant="outline-white" size="sm">
                Give a Testimonial
              </GeButton>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 px-5 py-5 text-center md:flex-row md:text-left">
          <p className="font-ge text-sm text-white/70 sm:text-[0.85rem]">
            Copyright © {new Date().getFullYear()} – GolfSol Ireland – All Rights Reserved
          </p>
          <p className="font-ge text-sm uppercase tracking-[0.12em] text-white/60 sm:text-[0.8rem]">
            Irish-owned · Costa del Sol golf specialists
          </p>
        </div>
      </div>
    </footer>
  )
}
