/**
 * Responsive Malaga / transfer hero raster.
 * — `default`: full `srcSet` brand master (`hero-malaga-transfers.*`) for {@link GeHero}.
 * — `transport`: single transport-variant PNG (`hero-transport-variant.png`).
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
    /** Same flow as default hero: natural height on mobile, aspect frame + cover on md+. */
    return (
      <picture className="block md:absolute md:inset-0 md:h-full md:w-full">
        <img
          src="/images/hero-transport-variant.png"
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
        srcSet="/images/hero-malaga-transfers-mobile-720.webp 720w, /images/hero-malaga-transfers-mobile.webp 1080w"
        sizes="100vw"
      />
      <source
        media="(max-width: 767px)"
        type="image/jpeg"
        srcSet="/images/hero-malaga-transfers-mobile-720.jpg 720w, /images/hero-malaga-transfers-mobile.jpg 1080w"
        sizes="100vw"
      />
      <source
        type="image/webp"
        srcSet="/images/hero-malaga-transfers-1600.webp 1600w, /images/hero-malaga-transfers.webp 2200w"
        sizes="100vw"
      />
      <source
        type="image/jpeg"
        srcSet="/images/hero-malaga-transfers-1600.jpg 1600w, /images/hero-malaga-transfers.jpg 2200w"
        sizes="100vw"
      />
      <img
        src="/images/hero-malaga-transfers.jpg"
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
