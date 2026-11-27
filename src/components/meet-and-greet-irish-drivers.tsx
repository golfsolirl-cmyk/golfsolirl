import { m } from 'framer-motion'
import { ArrowRight, Briefcase, PlaneLanding, Users } from 'lucide-react'
import {
  MEET_AND_GREET_FEATURE_PHOTO,
  MEET_AND_GREET_HOME_FLEET_PHOTOS,
  MEET_AND_GREET_KERB_PHOTO
} from '../data/transfer-fleet-photos'
import { cx } from '../lib/utils'
import { IrishFlagEmblem } from './irish-flag-emblem'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

const POINTS = [
  {
    icon: PlaneLanding,
    title: 'Personal meet & greet at Málaga Arrivals',
    body: 'Your Irish driver tracks the flight and waits in the hall — name board ready, no rank queue scramble.'
  },
  {
    icon: Briefcase,
    title: 'Direct hotel & golf course transfers',
    body: 'Straight to your resort or first tee with proper room for travel covers, trolleys and shoe bags.'
  },
  {
    icon: Users,
    title: 'Local Irish-run team on the ground',
    body: 'From landing to the final tee time, the same Irish-speaking crew keeps every leg calm and clear.'
  }
] as const

export type MeetAndGreetIrishDriversProps = {
  /** Homepage band vs transfers-page lead highlight. */
  readonly variant?: 'home' | 'page'
  readonly className?: string
  /** Primary CTA href — transfers enquire or quote. */
  readonly ctaHref?: string
  readonly ctaLabel?: string
  /** Show compact 8-seater / fleet mosaic under the copy. Default true. */
  readonly showFleetMosaic?: boolean
}

/**
 * Standout Meet & Greet by Irish Drivers highlight —
 * forest / cream / gold, Irish flag emblem, real arrivals + van photos.
 */
export function MeetAndGreetIrishDrivers({
  variant = 'home',
  className,
  ctaHref = '/services/transport#meet-and-greet',
  ctaLabel = 'See airport transfers',
  showFleetMosaic = true
}: MeetAndGreetIrishDriversProps) {
  const isPage = variant === 'page'
  const titleId = isPage ? 'meet-and-greet-page-title' : 'meet-and-greet-home-title'
  const featurePhoto = isPage ? MEET_AND_GREET_FEATURE_PHOTO : MEET_AND_GREET_KERB_PHOTO
  const mosaic = MEET_AND_GREET_HOME_FLEET_PHOTOS.slice(0, isPage ? 6 : 4)

  return (
    <section
      id="meet-and-greet"
      aria-labelledby={titleId}
      data-meet-and-greet={variant}
      className={cx(
        'meet-and-greet-irish relative isolate overflow-hidden scroll-mt-[calc(var(--ge-fixed-header-h,7.5rem)+2.5rem)]',
        isPage ? 'bg-[#062016] text-white' : 'border-y border-[#d4a843]/35 bg-[#faf8f3] text-gs-dark',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,transparent_0%,#136047_18%,#d4a843_50%,#136047_82%,transparent_100%)]"
      />

      <div
        className={cx(
          'relative mx-auto max-w-[1180px] px-4 sm:px-8',
          isPage ? 'py-12 sm:py-16 lg:py-18' : 'py-12 sm:py-14 lg:py-16'
        )}
      >
        <div
          className={cx(
            'grid items-center gap-8 lg:gap-12',
            isPage ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'lg:grid-cols-[0.95fr_1.05fr]'
          )}
        >
          <m.div {...fadeUp} className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cx(
                  'inline-flex min-h-11 items-center gap-2.5 rounded-full px-3.5 py-2 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] sm:text-[0.72rem]',
                  isPage
                    ? 'border border-[#d4a843]/55 bg-white/10 text-[#f4dfa6]'
                    : 'border border-[#d4a843]/60 bg-white text-[#062016] shadow-[0_10px_24px_rgba(6,32,22,0.08)]'
                )}
              >
                <IrishFlagEmblem size="sm" title="Irish drivers" />
                Meet &amp; greet · Irish drivers
              </span>
            </div>

            <h2
              id={titleId}
              className={cx(
                'mt-5 max-w-[16ch] font-ge font-extrabold leading-[1.02] tracking-[-0.02em]',
                isPage
                  ? 'text-[2.15rem] text-white sm:text-[2.85rem] lg:text-[3.1rem]'
                  : 'text-[2.05rem] text-[#062016] sm:text-[2.65rem] lg:text-[2.9rem]'
              )}
            >
              Meet &amp; Greet by Irish Drivers
            </h2>

            <p
              className={cx(
                'mt-3 max-w-xl font-ge text-[1.05rem] font-semibold leading-7 sm:text-[1.15rem] sm:leading-8',
                isPage ? 'text-[#f4dfa6]' : 'text-[#136047]'
              )}
            >
              Friendly Irish drivers waiting at Arrivals
            </p>

            <p
              className={cx(
                'mt-4 max-w-xl font-ge text-[0.98rem] leading-7 sm:text-[1.05rem] sm:leading-8',
                isPage ? 'text-white/88' : 'text-gs-dark/80'
              )}
            >
              Land at Málaga AGP and walk straight to a familiar accent — private transfers sized for golf
              bags, run by an Irish team on the Costa del Sol.
            </p>

            <ul className="mt-7 space-y-4">
              {POINTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <span
                    className={cx(
                      'mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      isPage
                        ? 'border border-[#d4a843]/45 bg-[#0c3527] text-[#f4dfa6]'
                        : 'border border-[#d4a843]/50 bg-[#062016] text-[#f4dfa6] shadow-[0_10px_22px_rgba(6,32,22,0.18)]'
                    )}
                  >
                    <Icon className="h-[1.05rem] w-[1.05rem]" aria-hidden strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cx(
                        'font-ge text-[0.95rem] font-extrabold leading-snug sm:text-[1rem]',
                        isPage ? 'text-white' : 'text-[#062016]'
                      )}
                    >
                      {title}
                    </p>
                    <p
                      className={cx(
                        'mt-1 font-ge text-[0.9rem] leading-6 sm:text-[0.95rem]',
                        isPage ? 'text-white/78' : 'text-ge-gray500'
                      )}
                    >
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={ctaHref}
                className={cx(
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em]',
                  isPage
                    ? 'bg-[#d4a843] text-[#062016] shadow-[0_12px_28px_rgba(0,0,0,0.28)]'
                    : 'bg-[#062016] text-[#f7f3ea] shadow-[0_12px_28px_rgba(6,32,22,0.22)]'
                )}
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="/quote"
                className={cx(
                  'inline-flex min-h-12 items-center justify-center rounded-full border-2 px-6 font-ge text-[0.78rem] font-extrabold uppercase tracking-[0.12em]',
                  isPage
                    ? 'border-white/70 bg-white/10 text-white'
                    : 'border-[#062016]/25 bg-white text-[#062016]'
                )}
              >
                Get a quote
              </a>
            </div>
          </m.div>

          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="relative min-w-0"
          >
            <div
              className={cx(
                'relative overflow-hidden rounded-[1.75rem] shadow-[0_28px_64px_rgba(6,32,22,0.28)] ring-1',
                isPage ? 'ring-[#d4a843]/40' : 'ring-[#d4a843]/45'
              )}
            >
              <img
                src={featurePhoto.src}
                alt={featurePhoto.alt}
                className="aspect-[4/3] h-full w-full object-cover sm:aspect-[5/4]"
                loading={isPage ? 'eager' : 'lazy'}
                decoding="async"
                width={960}
                height={720}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#041610]/75 via-transparent to-transparent"
              />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#062016]/92 px-3.5 py-2 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#f4dfa6] ring-1 ring-[#d4a843]/45">
                  <IrishFlagEmblem size="sm" />
                  <span className="truncate">{featurePhoto.caption}</span>
                </p>
              </div>
            </div>

            {showFleetMosaic ? (
              <div
                className={cx(
                  'mt-3 grid gap-2.5 sm:mt-3.5 sm:gap-3',
                  isPage ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
                )}
              >
                {mosaic.map((photo) => (
                  <figure
                    key={photo.src}
                    className="relative overflow-hidden rounded-[1rem] bg-[#041610] ring-1 ring-[#d4a843]/35"
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-[4/3] h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={360}
                    />
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-[#041610]/90 to-transparent px-2 pb-2 pt-6 font-ge text-[0.58rem] font-extrabold uppercase tracking-[0.1em] text-[#f7f3ea]">
                      {photo.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </m.div>
        </div>
      </div>
    </section>
  )
}
