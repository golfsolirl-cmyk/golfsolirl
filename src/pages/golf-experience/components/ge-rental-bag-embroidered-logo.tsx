/** Same raster as header lockup export — `/images/golfsol-header-logo-bitmap.png` */
const RENTAL_HERO_BRAND_BITMAP = '/images/golfsol-header-logo-bitmap.png'

/**
 * Crest bitmap aligned to the lower bag pocket: anchored from the bottom with consistent
 * inset so it reads as deliberate product placement (not floating mid-frame).
 */
export function GeRentalBagEmbroideredLogo() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[4] flex items-end justify-end pb-[22%] pr-[4%] sm:pb-[19%] sm:pr-[5%] md:pb-[16%] md:pr-[7%] lg:pb-[14%] lg:pr-[8.5%]"
    >
      <div
        className="relative max-w-[min(78vw,300px)] shrink-0 rounded-[2px] ring-1 ring-black/25 shadow-[0_3px_18px_rgba(0,0,0,0.4)] sm:max-w-[min(72vw,320px)] md:max-w-[min(30vw,380px)] lg:max-w-[min(26vw,400px)]"
        style={{
          filter:
            'drop-shadow(0 1px 0 rgba(0,0,0,0.45)) drop-shadow(0 -0.5px 0 rgba(255,255,255,0.08)) drop-shadow(1px 0 0 rgba(0,0,0,0.2)) drop-shadow(-1px 0 0 rgba(0,0,0,0.16))'
        }}
      >
        <img
          src={RENTAL_HERO_BRAND_BITMAP}
          alt=""
          width={960}
          height={320}
          decoding="async"
          className="h-auto max-h-[min(22vh,200px)] w-full object-contain object-center opacity-[0.96] [transform:rotate(-2.25deg)] contrast-[1.04] saturate-[1.03] sm:max-h-[min(24vh,220px)] md:max-h-[min(26vh,240px)]"
        />
      </div>
    </div>
  )
}
