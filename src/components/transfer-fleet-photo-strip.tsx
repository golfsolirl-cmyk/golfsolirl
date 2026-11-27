import { m } from 'framer-motion'
import { TRANSFER_FLEET_STRIP_PHOTOS } from '../data/transfer-fleet-photos'
import { cx } from '../lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export type TransferFleetPhotoStripProps = {
  readonly className?: string
  /** Limit how many photos render (default: all catalogued van/fleet stills). */
  readonly limit?: number
}

/**
 * Dedicated “Our Transfer Fleet (8-Seater Vans & Minibuses)” photo strip/grid
 * for airport transfers & transport pages — real repo photos only.
 */
export function TransferFleetPhotoStrip({ className, limit }: TransferFleetPhotoStripProps) {
  const photos = typeof limit === 'number' ? TRANSFER_FLEET_STRIP_PHOTOS.slice(0, limit) : TRANSFER_FLEET_STRIP_PHOTOS

  return (
    <section
      id="transfer-fleet-photos"
      aria-labelledby="transfer-fleet-photos-title"
      data-transfer-fleet-strip
      className={cx('relative overflow-hidden border-y border-chrome-300/60 bg-[#faf8f3]', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,#136047_18%,#d4a843_50%,#136047_82%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-[1180px] px-4 py-12 sm:px-8 sm:py-14">
        <m.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[#136047]">
            Real vehicles · Golf-bag friendly
          </p>
          <h2
            id="transfer-fleet-photos-title"
            className="mt-3 font-ge text-[1.85rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#062016] sm:text-[2.35rem]"
          >
            Our Transfer Fleet
            <span className="mt-1 block text-[1.15rem] font-extrabold uppercase tracking-[0.06em] text-[#136047] sm:text-[1.25rem]">
              8-Seater Vans &amp; Minibuses
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-ge text-[1rem] leading-7 text-gs-dark/78 sm:text-[1.05rem]">
            People carriers and group minibuses matched to your party — with proper room for travel covers on every
            Málaga airport, hotel and golf-course leg.
          </p>
        </m.div>

        <m.ul
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
          className="mt-9 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
        >
          {photos.map((photo) => (
            <li key={photo.src}>
              <figure className="group relative overflow-hidden rounded-[1.15rem] bg-[#041610] shadow-[0_16px_36px_rgba(6,32,22,0.14)] ring-1 ring-[#d4a843]/40">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="aspect-[4/3] h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={480}
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#041610]/92 via-[#041610]/45 to-transparent px-3 pb-3 pt-10">
                  <span className="block truncate font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[#f7f3ea] sm:text-[0.72rem]">
                    {photo.caption}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}
