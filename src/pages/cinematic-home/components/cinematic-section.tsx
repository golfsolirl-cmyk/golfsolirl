import { m, useReducedMotion } from 'framer-motion'
import type { CinematicImageKey } from '../cinematic-assets'
import { CINEMATIC_REMOTE } from '../cinematic-assets'
import { CinematicRemoteImage } from './cinematic-remote-image'
import { cx } from '../../../lib/utils'

export interface CinematicSectionProps {
  readonly id?: string
  readonly kicker: string
  readonly title: string
  readonly body: string
  readonly imageKey: CinematicImageKey
  /** Image on the right on large screens when true */
  readonly imageRight?: boolean
}

export function CinematicSection({ id, kicker, title, body, imageKey, imageRight }: CinematicSectionProps) {
  const reduce = useReducedMotion()
  const img = CINEMATIC_REMOTE[imageKey]

  return (
    <section id={id} className="relative scroll-mt-24 py-20 sm:py-28 md:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 sm:gap-14 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <m.div
          initial={reduce ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className={cx('relative', !imageRight && 'lg:order-2')}
        >
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-silver-200/90 sm:text-[0.72rem]">
            {kicker}
          </p>
          <h2 className="cin-display mt-3 max-w-[16ch] text-3xl leading-[1.05] text-cream sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-cream/78 sm:text-lg">{body}</p>
        </m.div>

        <m.div
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
          className={cx(
            'relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] sm:aspect-[5/6] sm:rounded-[1.75rem] lg:aspect-[5/5.5]',
            !imageRight && 'lg:order-1'
          )}
        >
          <div className="cin-grain z-[2]" aria-hidden />
          <CinematicRemoteImage
            remoteSrc={img.src}
            fallbackSrc={img.fallback}
            alt={img.alt}
            className="absolute inset-0 h-full w-full object-cover brightness-[0.75] contrast-[1.08] saturate-[1.08]"
            loading="lazy"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-forest-950/20"
            aria-hidden
          />
        </m.div>
      </div>
    </section>
  )
}
