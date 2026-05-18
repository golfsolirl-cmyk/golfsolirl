/**
 * Responsive Malaga / transfer hero raster.
 * — `default`: `hero-malaga-transfer-*` assets from `npm run build:hero-malaga-transfer`.
 * — `transport`: fleet lineup plate (`88054e80-…`).
 */
interface GeHeroMalagaTransferPictureProps {
  readonly alt: string
  readonly variant?: 'default' | 'transport'
}

const heroImgClass =
  'block h-auto w-full max-w-full select-none md:h-full md:w-full md:object-cover md:object-center' as const

export function GeHeroMalagaTransferPicture({
  alt,
  variant = 'default'
}: GeHeroMalagaTransferPictureProps) {
  if (variant === 'transport') {
    return (
      <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
        <img
          src="/images/88054e80-6dd1-483f-8557-cdc45caa2442.png"
          alt={alt}
          className="block h-auto w-full max-w-full select-none object-cover object-[center_36%] md:h-full md:w-full md:object-cover md:object-[center_40%]"
          fetchPriority="high"
          decoding="async"
          width={2400}
          height={1200}
        />
      </picture>
    )
  }

  return (
    <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
      <source
        media="(max-width: 767px)"
        type="image/webp"
        srcSet="/images/hero-malaga-transfer-mobile.webp"
        sizes="100vw"
      />
      <source
        media="(min-width: 768px)"
        type="image/webp"
        srcSet="/images/hero-malaga-transfer-desktop.webp"
        sizes="100vw"
      />
      <source
        media="(max-width: 767px)"
        srcSet="/images/hero-malaga-transfer-mobile.png"
        sizes="100vw"
      />
      <img
        src="/images/hero-malaga-transfer-desktop.png"
        alt={alt}
        className={heroImgClass}
        fetchPriority="high"
        decoding="async"
        width={2200}
        height={1100}
      />
    </picture>
  )
}
