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
 * Responsive homepage hero — desktop full banner, mobile crop from `afeeead4-…png`.
 */
export function GeMarketingHeroPicture({ className, imgClassName }: GeMarketingHeroPictureProps) {
  const desktopWebp = marketingHeroAsset(BRAND_MARKETING_HERO_DESKTOP.webp)
  const desktopPng = marketingHeroAsset(BRAND_MARKETING_HERO_DESKTOP.png)
  const mobileWebp = marketingHeroAsset(BRAND_MARKETING_HERO_MOBILE.webp)
  const mobilePng = marketingHeroAsset(BRAND_MARKETING_HERO_MOBILE.png)

  return (
    <picture className={cx('block w-full', className)}>
      <source media="(min-width: 768px)" srcSet={desktopWebp} type="image/webp" />
      <source media="(min-width: 768px)" srcSet={desktopPng} type="image/png" />
      <source srcSet={mobileWebp} type="image/webp" />
      <img
        src={mobilePng}
        alt={BRAND_MARKETING_HERO_COMPOSITE_ALT}
        decoding="async"
        fetchPriority="high"
        width={750}
        height={1345}
        sizes="100vw"
        className={cx('block h-auto w-full max-w-full', imgClassName)}
      />
    </picture>
  )
}
