import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { GOLFSOL_BRAND_LOGO, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { useHomepageTestLogo } from '../providers/homepagetest-variant'
import { cx } from '../lib/utils'

export type BrandLogoPictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  readonly alt: string
  /** Footer + legal surfaces always use production `g-sol-logo.png`. */
  readonly ignoreTestVariant?: boolean
}

/**
 * Header + footer logo: crest (`g-sol-logo.png`).
 */
export function BrandLogoPicture({
  alt,
  width: widthProp,
  height: heightProp,
  className,
  ignoreTestVariant = false,
  ...imgProps
}: BrandLogoPictureProps) {
  const testLogo = useHomepageTestLogo()
  const useTestLogo = !ignoreTestVariant && testLogo
  const logo = useTestLogo ? testLogo : GOLFSOL_BRAND_LOGO
  const width = widthProp ?? (useTestLogo ? testLogo.width : GOLFSOL_BRAND_LOGO_INTRINSIC.width)
  const height = heightProp ?? (useTestLogo ? testLogo.height : GOLFSOL_BRAND_LOGO_INTRINSIC.height)

  return (
    <img
      src={useTestLogo ? logo.png : GOLFSOL_BRAND_LOGO.png}
      alt={alt}
      width={width}
      height={height}
      className={cx(className)}
      {...imgProps}
    />
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
 * pixels composite on solid white, not the dark footer. Slight scaled duplicate plugs
 * anti-aliased edge holes. Foreground: SVG → WebP `<picture>` (`BrandLogoPicture`).
 */
export function FooterBrandLogoPicture({ className, ...props }: BrandLogoPictureProps) {
  const testLogo = useHomepageTestLogo()
  const maskPng = testLogo?.png ?? GOLFSOL_BRAND_LOGO.png
  const crestAlphaMaskPng = crestAlphaMaskStyle(maskPng)

  return (
    <div className="relative inline-flex w-fit max-w-full justify-center [isolation:isolate]">
      <div className="relative w-max max-w-full">
        {/* Slight bleed under anti-aliased edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 scale-[1.028] bg-white"
          style={crestAlphaMaskPng}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-white" style={crestAlphaMaskPng} />
        <div className="relative z-10 [&>picture]:block [&>picture]:leading-none [&_img]:relative [&_img]:mix-blend-normal">
          <BrandLogoPicture {...props} className={cx(className)} />
        </div>
      </div>
    </div>
  )
}
