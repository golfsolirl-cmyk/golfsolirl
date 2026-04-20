import { Mail, Phone } from 'lucide-react'
import { contactInfo } from '../data/copy'

/**
 * Top contact strip. Floats over the hero image. The wrapper is transparent
 * so the hero shows through; switching to a solid bar on scroll is handled by
 * the parent navbar's scroll state (this strip is hidden once scrolled).
 */
export function GeTopBar() {
  return (
    <div className="hidden md:block">
      <div className="mx-auto flex max-w-[1340px] items-center justify-between px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white sm:text-[0.78rem]">
        <p className="text-white/85">{contactInfo.tagline}</p>
        <div className="flex items-center gap-5 text-white/95">
          <a
            className="flex min-h-[36px] items-center gap-2 transition-colors hover:text-gs-gold"
            href={`tel:${contactInfo.phoneTel}`}
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{contactInfo.phoneDisplay}</span>
          </a>
          <span aria-hidden="true" className="text-white/40">|</span>
          <a
            className="flex min-h-[36px] items-center gap-2 transition-colors hover:text-gs-gold"
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
    <div className="flex items-center justify-between gap-3 bg-gs-green px-4 py-2 text-white md:hidden">
      <p className="text-xs font-bold uppercase tracking-[0.12em] sm:text-[0.65rem]">{contactInfo.tagline}</p>
      <div className="flex items-center gap-3">
        <a
          aria-label="Call GolfSol Ireland"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          href={`tel:${contactInfo.phoneTel}`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          aria-label="Email GolfSol Ireland"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          href={`mailto:${contactInfo.email}`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
