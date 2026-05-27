import { BRAND_FLEET_HERO_ALT, BRAND_FLEET_HERO_IMAGE_SRC } from '../lib/brand-visual-assets'
import { cx } from '../lib/utils'

type BrandFleetHeroPanelVariant = 'dashboard' | 'login' | 'pdf-shell'

interface BrandFleetHeroPanelProps {
  readonly variant?: BrandFleetHeroPanelVariant
  readonly className?: string
  /** When true, show “airport desk” style pills above the image (matches transport marketing). */
  readonly showBadges?: boolean
}

export function BrandFleetHeroPanel({
  variant = 'dashboard',
  className,
  showBadges = true
}: BrandFleetHeroPanelProps) {
  const isLogin = variant === 'login'
  const isPdf = variant === 'pdf-shell'

  return (
    <div
      className={cx(
        'overflow-hidden rounded-[1.35rem] border border-[#d9d9d9]/90 bg-[#eef2ef]/95 shadow-[0_18px_48px_rgba(6,59,42,0.12)] ring-1 ring-white/60',
        isLogin && 'lg:max-w-none',
        isPdf && 'rounded-xl border-ge-gray200 bg-offwhite',
        className
      )}
    >
      {showBadges ? (
        <div
          className={cx(
            'flex flex-wrap items-center gap-2 border-b border-[#d9d9d9]/80 bg-[#FFFBF3] px-4 py-3 sm:px-5',
            isPdf && 'px-3 py-2.5'
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gs-green/25 bg-white px-3 py-1 font-ge text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gs-green shadow-sm">
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-fairway-500" />
            Airport transfer desk
          </span>
          <span className="inline-flex rounded-full border border-brand-700/40 bg-brand-700/15 px-3 py-1 font-ge text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gs-dark">
            AGP arrivals · Costa del Sol
          </span>
        </div>
      ) : null}
      <div className={cx('relative bg-[#0a2008]', isPdf && 'bg-forest-950')}>
        <img
          alt={BRAND_FLEET_HERO_ALT}
          className={cx(
            'block h-auto w-full object-cover object-center',
            isLogin ? 'max-h-[220px] sm:max-h-[280px] lg:max-h-[340px]' : 'max-h-[200px] sm:max-h-[240px] md:max-h-[280px]',
            isPdf && 'max-h-[160px]'
          )}
          decoding="async"
          height={720}
          loading="lazy"
          src={BRAND_FLEET_HERO_IMAGE_SRC}
          width={1280}
        />
        <p className="absolute bottom-2 left-2 right-2 rounded-lg bg-brand-charcoal px-3 py-1.5 text-center font-ge text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white sm:text-xs">
          Fleet ready for golf bags
        </p>
      </div>
      <p
        className={cx(
          'border-t border-[#d9d9d9]/80 bg-[#FFF9EA] px-4 py-3 font-ge text-sm font-semibold leading-snug text-gs-dark sm:px-5 sm:text-[0.95rem]',
          isPdf && 'py-2.5 text-xs sm:text-sm'
        )}
      >
        Mercedes fleet: E-Class, V-Class and Sprinter — matched to your group and bag count.
      </p>
    </div>
  )
}
