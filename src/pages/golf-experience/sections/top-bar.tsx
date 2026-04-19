import { Mail, Phone } from 'lucide-react'
import { contactInfo } from '../data/copy'

export function GeTopBar() {
  return (
    <div className="hidden bg-ge-teal text-white md:block" id="top">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em]">
        <p>{contactInfo.tagline}</p>
        <div className="flex items-center gap-5 text-white/95">
          <a
            className="flex items-center gap-2 transition-colors hover:text-ge-orange"
            href={`tel:${contactInfo.phoneTel}`}
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{contactInfo.phoneDisplay}</span>
          </a>
          <span aria-hidden="true" className="text-white/40">|</span>
          <a
            className="flex items-center gap-2 transition-colors hover:text-ge-orange"
            href={`mailto:${contactInfo.email}`}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="lowercase">{contactInfo.email}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export function GeTopBarMobile() {
  return (
    <div className="flex items-center justify-between gap-3 bg-ge-teal px-4 py-2 text-white md:hidden">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em]">{contactInfo.tagline}</p>
      <div className="flex items-center gap-3">
        <a
          aria-label="Call Golf Experience"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          href={`tel:${contactInfo.phoneTel}`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          aria-label="Email Golf Experience"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          href={`mailto:${contactInfo.email}`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
