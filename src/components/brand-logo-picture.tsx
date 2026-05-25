import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { GOLFSOL_BRAND_LOGO, GOLFSOL_BRAND_LOGO_INTRINSIC, GOLFSOL_BRAND_LOGO_SOURCE, brandLogoAssetUrl } from '../lib/brand-logo-assets'
import { useHomepageTestLogo } from '../providers/homepagetest-variant'
import { cx } from '../lib/utils'

const LOGO_SRCSET_WIDTH = `${GOLFSOL_BRAND_LOGO_INTRINSIC.width}w`

export type BrandLogoPictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> & {
  readonly alt: string
  /** Footer + legal surfaces always use production crest (source PNG). */
  readonly ignoreTestVariant?: boolean
  /** Hint for responsive pick (retina-safe). */
  readonly sizes?: string
}

/**
 * Header + footer logo — Golf Sol Ireland shield crest (source PNG).
 */
export function BrandLogoPicture({
  alt,
  width: widthProp,
  height: heightProp,
  className,
  sizes: sizesProp,
  ignoreTestVariant = false,
  ...imgProps
}: BrandLogoPictureProps) {
  const testLogo = useHomepageTestLogo()
  const useTestLogo = !ignoreTestVariant && testLogo
  const logo = useTestLogo ? testLogo : GOLFSOL_BRAND_LOGO
  const width = widthProp ?? (useTestLogo ? testLogo.width : GOLFSOL_BRAND_LOGO_INTRINSIC.width)
  const height = heightProp ?? (useTestLogo ? testLogo.height : GOLFSOL_BRAND_LOGO_INTRINSIC.height)
  const src = useTestLogo ? testLogo.png : brandLogoAssetUrl(logo.png)
  const srcSet = `${src} ${LOGO_SRCSET_WIDTH}`
  const sizes = sizesProp ?? `${Math.round(Math.min(Number(width), 360) * 2)}px`

  return (
    <picture className="inline-flex max-w-full leading-none">
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={cx(className)}
        {...imgProps}
      />
    </picture>
  )
}

/**
 * PNG alpha for the backing plate only — lossy WebP often keeps the ball / flag whites
 * slightly transparent; PNG alpha usually matches the art file used at export.
 */
function crestAlphaMaskStyle(png: string): CSSProperties {
  const mask = `url("${png}")`
  return {
    WebkitMaskImage: mask,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskImage: mask,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskMode: 'alpha',
    maskMode: 'alpha',
  } as CSSProperties
}

/**
 * Footer-only: opaque `#fff` clipped to crest alpha (PNG) so semi-transparent ball/flag
 * pixels composite on solid white, not the dark footer. Foreground uses the hosted crest PNG.
 */
export function FooterBrandLogoPicture({ className, ...props }: BrandLogoPictureProps) {
  const testLogo = useHomepageTestLogo()
  const maskPng = testLogo?.png ?? brandLogoAssetUrl(GOLFSOL_BRAND_LOGO_SOURCE)
  const crestAlphaMaskPng = crestAlphaMaskStyle(maskPng)

  return (
    <div className="relative inline-flex w-fit max-w-full justify-center [isolation:isolate]">
      <div className="relative w-max max-w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 scale-[1.028] bg-white"
          style={crestAlphaMaskPng}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-white" style={crestAlphaMaskPng} />
        <div className="relative z-10 [&>picture]:block [&>picture]:max-w-full [&>picture]:leading-none [&_img]:relative [&_img]:max-w-full [&_img]:mix-blend-normal">
          <BrandLogoPicture {...props} className={cx(className)} ignoreTestVariant />
        </div>
      </div>
    </div>
  )
}
