import { ChevronRight, Mail } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { GeBrandLockup } from '../components/brand-lockup'
import { GeButton } from '../components/ge-button'
import { GeDualPhoneFooterLines } from '../components/ge-dual-phone-contact'
import { aboutFooterCopy, contactInfo } from '../data/copy'
import { footerColumns } from '../data/nav'

const socials = [
  { label: 'Facebook', icon: FaFacebookF, href: 'https://www.facebook.com/' },
  { label: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/' },
  { label: 'X', icon: FaXTwitter, href: 'https://x.com/' },
  { label: 'LinkedIn', icon: FaLinkedinIn, href: 'https://www.linkedin.com/' }
]

export function GeFooter() {
  return (
    <footer className="bg-gs-dark text-white">
      <div className="mx-auto max-w-[1180px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-brand-700 drop-shadow-[0_0_12px_rgba(19, 96, 71,0.22)] sm:text-[0.82rem]">
                {column.title}
              </p>
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
            <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-brand-700 drop-shadow-[0_0_12px_rgba(19, 96, 71,0.22)] sm:text-[0.82rem]">
              Contact Us
            </p>
            <ul className="mt-4 space-y-3">
              <GeDualPhoneFooterLines />
              <li className="flex items-start gap-2">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-brand-700/85" aria-hidden="true" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="font-ge text-[1.05rem] leading-7 text-white transition-colors hover:text-[#fbe8b5] sm:text-[0.98rem]"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
            <p className="mt-6 font-ge text-[0.9rem] font-bold uppercase tracking-[0.16em] text-brand-700 drop-shadow-[0_0_12px_rgba(19, 96, 71,0.22)] sm:text-[0.82rem]">
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-700/45 bg-gs-dark/50 text-silver-200 shadow-[0_0_0_1px_rgba(19, 96, 71,0.2)] ring-1 ring-brand-700/35 transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_0_1px_rgba(217,190,122,0.35)] hover:ring-brand-700/55"
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
            <p className="mt-6 font-ge text-[1.05rem] leading-8 text-white sm:text-[0.98rem]">{aboutFooterCopy}</p>
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

      <div className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 px-5 py-5 text-center sm:flex-row sm:flex-wrap sm:justify-between sm:text-left">
          <p className="font-ge text-[0.98rem] leading-6 text-white sm:text-[0.88rem]">
            Copyright © {new Date().getFullYear()} – GolfSol Ireland – All Rights Reserved
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-ge text-[0.92rem] text-white sm:text-[0.88rem]">
            <a className="underline decoration-white/35 underline-offset-4 transition-colors hover:text-silver-200" href="/dashboard/login">
              Client sign-in
            </a>
            <span className="text-white/35" aria-hidden="true">
              ·
            </span>
            <a
              className="underline decoration-white/35 underline-offset-4 transition-colors hover:text-silver-200"
              href="/dashboard/admin/login"
            >
              Admin sign-in
            </a>
          </p>
          <p className="font-ge text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-[#fbe8b5] drop-shadow-[0_0_12px_rgba(217,190,122,0.25)] sm:text-[0.86rem]">
            Irish-owned · Costa del Sol golf specialists
          </p>
        </div>
      </div>
    </footer>
  )
}
