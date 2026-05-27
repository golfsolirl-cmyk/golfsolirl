import { m } from 'framer-motion'
import { BrandLogoPicture } from '../../../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../../lib/brand-logo-assets'
import { cx } from '../../../lib/utils'

export function CinematicShellNav({ className }: { readonly className?: string }) {
  return (
    <header
      className={cx(
        'sticky top-0 z-50 border-b border-white/[0.06] bg-forest-950/55',
        className
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <a href="/" className="group flex shrink-0 items-center gap-2 outline-none ring-brand-700/40 focus-visible:ring-2">
          <BrandLogoPicture
            alt="GolfSol Ireland"
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            decoding="async"
            className="cin-logo-rim h-[52px] w-auto select-none object-contain sm:h-[60px]"
          />
        </a>
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Cinematic preview">
          <a
            href="/"
            className="hidden text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream/75 transition-colors hover:text-silver-200 sm:inline sm:text-[0.72rem]"
          >
            Live site
          </a>
          <m.a
            href="/packages"
            className="rounded-full bg-gradient-to-r from-brand-800 to-brand-200 px-4 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white shadow-gs-green transition-shadow hover:shadow-gs-green sm:px-6 sm:py-3 sm:text-[0.75rem]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            Plan trip
          </m.a>
        </nav>
      </div>
    </header>
  )
}
