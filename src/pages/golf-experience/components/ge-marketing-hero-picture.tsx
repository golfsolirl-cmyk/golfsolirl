import {
  BRAND_MARKETING_HERO_COMPOSITE_ALT,
  BRAND_MARKETING_HERO_DESKTOP,
  BRAND_MARKETING_HERO_MOBILE
} from '../../../lib/brand-visual-assets'
import { cx } from '../../../lib/utils'

function marketingHeroAsset(publicPath: string): string {
  const path = publicPath.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

interface GeMarketingHeroPictureProps {
  readonly className?: string
  readonly imgClassName?: string
}

/**
 * Responsive homepage hero.
 * — Desktop / tablet (≥768px): banner with the "MALAGA → COSTA DEL SOL GOLF
 *   TRANSFERS" headline baked into the artwork (top of the image must remain
 *   visible — never cropped from the top).
 * — Mobile (<768px): fleet lineup that shows the three black Mercedes vehicles
 *   with the GolfSol crest and the "FROM PLANE TO FAIRWAY" circle text visible
 *   on each car.
 */
export function GeMarketingHeroPicture({ className, imgClassName }: GeMarketingHeroPictureProps) {
  const desktopWebp = marketingHeroAsset(BRAND_MARKETING_HERO_DESKTOP.webp)
  const mobileWebp = marketingHeroAsset(BRAND_MARKETING_HERO_MOBILE.webp)

  return (
    <picture className={cx('block w-full', className)}>
      <source media="(min-width: 768px)" srcSet={desktopWebp} type="image/webp" />
      <img
        src={mobileWebp}
        alt={BRAND_MARKETING_HERO_COMPOSITE_ALT}
        decoding="async"
        fetchPriority="high"
        width={1024}
        height={576}
        sizes="100vw"
        className={cx(
          'block h-auto w-full max-w-full select-none object-cover object-top',
          imgClassName
        )}
      />
    </picture>
  )
}
