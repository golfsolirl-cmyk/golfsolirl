import { m } from 'framer-motion'
import { GsolGoldCornerAccents } from '../../../components/gsol-gold-corner-accents'

export function CinematicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-forest-950 px-4 py-14 sm:px-8">
      <GsolGoldCornerAccents preset="footer" />
      <div className="relative z-[1] mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="cin-display text-2xl text-cream sm:text-3xl">Ready when you are.</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/70">
            Experimental cinematic layout — the live site remains unchanged at{' '}
            <a href="/" className="font-semibold text-silver-200 underline-offset-4 hover:underline">
              golfsol.ie
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <m.a
            href="/packages"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-brand-700/50 bg-brand-700/10 px-6 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-silver-200"
            whileHover={{ backgroundColor: 'rgba(19, 96, 71, 0.2)' }}
            transition={{ duration: 0.25 }}
          >
            View packages
          </m.a>
          <div className="text-[0.72rem] uppercase tracking-[0.18em] text-cream/72">
            <span className="block">GolfSol Ireland</span>
            <span className="mt-1 block text-cream/80">Irish-owned · Costa del Sol</span>
          </div>
        </div>
      </div>
      <div className="relative z-[1] mx-auto mt-12 max-w-[1400px] border-t border-white/[0.06] pt-8 text-center text-[0.7rem] text-cream/70">
        <a href="/documents/terms" className="hover:text-cream/65">
          Terms
        </a>
        <span className="mx-3 text-cream/45" aria-hidden>
          ·
        </span>
        <a href="/services/transport" className="hover:text-cream/65">
          Transport
        </a>
      </div>
    </footer>
  )
}
