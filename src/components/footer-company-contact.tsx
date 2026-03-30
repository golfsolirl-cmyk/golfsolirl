import { ExternalLink, MapPin, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { companyContact } from '../data/site-content'

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyContact.mapsQuery)}`

export function FooterCompanyContact() {
  return (
    <div className="mx-auto mt-10 max-w-7xl">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/14 bg-[linear-gradient(152deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.02)_48%,rgba(80,163,45,0.06)_100%)] p-6 shadow-[0_28px_72px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.06] md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_0%_-20%,rgba(220,88,1,0.14),transparent_50%),radial-gradient(ellipse_70%_60%_at_100%_100%,rgba(80,163,45,0.11),transparent_45%)]"
        />
        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-start md:gap-12 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold-300/95 md:text-[11px]">Dublin office</p>
            <div className="mt-4 flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-gold-300">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <address className="not-italic text-base font-medium leading-relaxed text-white/88 md:text-sm">
                  {companyContact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="mt-1 block text-sm font-semibold tracking-[0.12em] text-white/55 md:text-[13px]">{companyContact.eircode}</span>
                </address>
                <a
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-gold-400/90 transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 md:text-xs"
                  href={mapsHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Maps
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold-300/95 md:text-[11px]">Phone &amp; WhatsApp</p>
            <div className="mt-4 flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-gold-300">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 space-y-3">
                <a
                  className="block font-display text-2xl font-bold tracking-tight text-white transition-colors hover:text-gold-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 md:text-[1.65rem]"
                  href={`tel:${companyContact.phoneTel}`}
                >
                  {companyContact.phoneDisplay}
                </a>
                <p className="text-base leading-relaxed text-white/58 md:text-sm">Irish mobile — same number on WhatsApp for quick trip questions.</p>
                <a
                  aria-label={`Message Golf Sol Ireland on WhatsApp at ${companyContact.phoneDisplay}`}
                  className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-[#25D366]/35 bg-[#25D366]/10 px-5 py-2.5 text-base font-semibold text-[#b8f5c8] transition-all hover:border-[#25D366]/60 hover:bg-[#25D366]/18 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 md:text-sm"
                  href={companyContact.whatsappHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FaWhatsapp className="h-5 w-5 text-[#25D366] transition-transform group-hover:scale-110" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
