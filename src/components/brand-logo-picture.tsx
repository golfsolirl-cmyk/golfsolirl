import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { GOLFSOL_BRAND_LOGO, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { cx } from '../lib/utils'

export type BrandLogoPictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  readonly alt: string
}

/**
 * Header + footer logo: **SVG first** (`golfsol-crest-brand.svg`), **WebP** as next `<source>`
 * and final `<img>` fallback. (SVG wraps WebP inside; browsers that mishandle SVG-in-`<picture>`
 * still get raster WebP.)
 */
export function BrandLogoPicture({
  alt,
  width = GOLFSOL_BRAND_LOGO_INTRINSIC.width,
  height = GOLFSOL_BRAND_LOGO_INTRINSIC.height,
  className,
  ...imgProps
}: BrandLogoPictureProps) {
  return (
    <picture>
      <source srcSet={GOLFSOL_BRAND_LOGO.svg} type="image/svg+xml" />
      <source srcSet={GOLFSOL_BRAND_LOGO.webp} type="image/webp" />
      <img src={GOLFSOL_BRAND_LOGO.webp} alt={alt} width={width} height={height} className={cx(className)} {...imgProps} />
    </picture>
  )
}

/**
 * PNG alpha for the backing plate only — lossy WebP often keeps the ball / flag whites
 * slightly transparent; PNG alpha usually matches the art file used at export.
 */
const FOOTER_CREST_PNG_ALPHA_MASK_URL = `url("${GOLFSOL_BRAND_LOGO.png}")`

const crestAlphaMaskPng = {
  WebkitMaskImage: FOOTER_CREST_PNG_ALPHA_MASK_URL,
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskImage: FOOTER_CREST_PNG_ALPHA_MASK_URL,
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskMode: 'alpha',
  maskMode: 'alpha',
} as CSSProperties

/**
 * Footer-only: opaque `#fff` clipped to crest alpha (PNG) so semi-transparent ball/flag
 * pixels composite on solid white, not the dark footer. Slight scaled duplicate plugs
 * anti-aliased edge holes. Foreground: SVG → WebP `<picture>` (`BrandLogoPicture`).
 */
export function FooterBrandLogoPicture({ className, ...props }: BrandLogoPictureProps) {
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
