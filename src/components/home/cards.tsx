import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, CheckCircle2, Star } from 'lucide-react'
import type {
  CourseItem,
  HotelItem,
  PackageItem,
  PlanningStep,
  StatItem,
  TestimonialItem,
  TransferFeature
} from '../../data/site-content'
import { cx } from '../../lib/utils'

const fadeUpProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export function TrustStat({ value, label }: StatItem) {
  return (
    <div className="min-w-[88px]">
      <p className="font-display text-[1.95rem] font-bold text-gold-300 md:text-[2.25rem]">{value}</p>
      <p className="mt-1 text-base leading-7 text-white">{label}</p>
    </div>
  )
}

export function PackageCard({ name, description, price, duration, highlight, includes }: PackageItem) {
  const isFeaturedPackage = highlight === 'Most requested itinerary'

  return (
    <motion.article
      className={cx(
        'group relative overflow-hidden rounded-[2rem] border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl',
        isFeaturedPackage && 'md:col-span-2',
        isFeaturedPackage
          ? 'border-gold-300 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white'
          : 'border-forest-100 bg-gradient-to-br from-white via-white to-gold-50/60'
      )}
      {...fadeUpProps}
    >
      <div
        aria-hidden="true"
        className={cx(
          'absolute inset-x-0 top-0 h-24',
          isFeaturedPackage
            ? 'bg-[radial-gradient(circle_at_top,rgba(253,186,116,0.28),transparent_68%)]'
            : 'bg-[radial-gradient(circle_at_top,rgba(220,88,1,0.12),transparent_68%)]'
        )}
      />
      <div
        aria-hidden="true"
        className={cx(
          'absolute -right-10 top-14 h-28 w-28 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-110',
          isFeaturedPackage ? 'bg-gold-400/20' : 'bg-gold-400/10'
        )}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span
              className={cx(
                'inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.1em]',
                isFeaturedPackage
                  ? 'border-gold-300/40 bg-gold-400/15 text-gold-300'
                  : 'border-gold-200 bg-gold-50 text-forest-950'
              )}
            >
              {highlight}
            </span>

            <div
              className={cx(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium',
                isFeaturedPackage
                  ? 'border-white/10 bg-white/8 text-white/75'
                  : 'border-forest-100 bg-white/80 text-forest-900/68'
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{duration}</span>
            </div>
          </div>

          <div className="sm:text-right">
            <p
              className={cx(
                'text-sm font-semibold uppercase tracking-[0.1em]',
                isFeaturedPackage ? 'text-white/62' : 'text-forest-900/54'
              )}
            >
              Starting from
            </p>
            <p
              className={cx(
                'mt-2 font-display text-[2.1rem] font-bold leading-tight md:text-[2.35rem]',
                isFeaturedPackage ? 'text-white' : 'text-forest-900'
              )}
            >
              {price.replace('From ', '')}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className={cx('text-[1.85rem] font-semibold tracking-[-0.015em] md:text-[2rem]', isFeaturedPackage ? 'text-white' : 'text-forest-900')}>
            {name}
          </h3>
          <p className={cx('mt-3 text-[1.02rem] leading-8', isFeaturedPackage ? 'text-white/76' : 'text-forest-900/70')}>{description}</p>
        </div>

        <div
          className={cx(
            'mb-6 space-y-3 rounded-[1.5rem] border p-4',
            isFeaturedPackage ? 'border-white/10 bg-white/6 backdrop-blur-sm' : 'border-forest-100 bg-white/80'
          )}
        >
          {includes.map((item) => (
            <div
              key={item}
              className={cx(
                'flex items-center gap-3 text-base',
                isFeaturedPackage ? 'text-white/82' : 'text-forest-900/72'
              )}
            >
              <CheckCircle2
                className={cx('h-4 w-4 shrink-0', isFeaturedPackage ? 'text-gold-300' : 'text-gold-500')}
                aria-hidden="true"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-current/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className={cx('text-sm font-semibold uppercase tracking-[0.1em]', isFeaturedPackage ? 'text-white/62' : 'text-forest-900/54')}>
            Tailored for your group
          </p>
          <a
            aria-label={`Tailor the ${name} trip`}
            className={cx(
              'inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-semibold transition-all duration-300 sm:min-w-[170px]',
              isFeaturedPackage
                ? 'bg-white text-forest-900 hover:bg-gold-300 hover:text-forest-950'
                : 'bg-forest-900 text-white hover:bg-gold-500'
            )}
            href="/packages"
          >
            <span>Tailor this trip</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export function CourseCard({ name, location, distance, badge, description, rate, image, tags }: CourseItem) {
  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      {...fadeUpProps}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          alt={`${name} golf course in ${location}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/75 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-gold-400 px-3 py-1.5 text-sm font-semibold text-forest-950">
          {badge}
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-[1.95rem] font-bold tracking-[-0.015em] text-white">{name}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-base text-forest-900/60">
          <span>{location}</span>
          <span className="h-1 w-1 rounded-full bg-forest-900/20" />
          <span>{distance}</span>
        </div>
        <p className="mb-4 text-[1.02rem] leading-8 text-forest-900/70">{description}</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-sm font-medium text-forest-900"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-forest-100 pt-4">
          <p className="text-base font-semibold text-forest-900">{rate}</p>
          <a className="text-base font-semibold text-forest-900 transition-colors hover:text-gold-600" href="/packages">
            Request details
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export function HotelCard({ name, tier, area, image, description, perks, price }: HotelItem) {
  const tierClassName =
    tier === 5
      ? 'border-gold-200 bg-gold-50 text-gold-600'
      : tier === 4
        ? 'border-white/15 bg-forest-800 text-white'
        : 'border-white/15 bg-fairway-700 text-white'

  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      {...fadeUpProps}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          alt={`${name} hotel exterior in ${area}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/65 via-transparent to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
          <span className={cx('rounded-full border px-3 py-1.5 text-sm font-semibold', tierClassName)}>
            {tier}-star stay
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: tier }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-gold-400 text-gold-400" aria-hidden="true" />
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-[1.95rem] font-bold tracking-[-0.015em] text-white">{name}</p>
          <p className="text-[1.02rem] text-white/82">{area}</p>
        </div>
      </div>

      <div className="p-6">
        <p className="mb-4 text-[1.02rem] leading-8 text-forest-900/70">{description}</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {perks.map((perk) => (
            <span
              key={perk}
              className="rounded-full border border-white/12 bg-forest-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              {perk}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-forest-100 pt-4">
          <p className="text-base font-semibold text-forest-900">{price}</p>
          <a className="text-base font-semibold text-forest-900 transition-colors hover:text-gold-600" href={`/packages?stay=${tier}`}>
            Match with package
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export function FeatureTile({ title, description, icon: Icon }: TransferFeature) {
  return (
    <motion.article
      className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md"
      {...fadeUpProps}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-forest-950 shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mb-3 text-[1.18rem] font-semibold leading-7 text-white md:text-[1.24rem]">{title}</h3>
      <p className="text-[1.08rem] leading-8 text-white">{description}</p>
    </motion.article>
  )
}

export function StepCard({ step, title, description, image }: PlanningStep) {
  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      {...fadeUpProps}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          alt={`${title} planning step illustration`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 font-display text-3xl font-bold leading-none text-gold-400">{step}</span>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-base font-semibold text-forest-900">{title}</h3>
        <p className="text-base leading-relaxed text-forest-900/68">{description}</p>
      </div>
    </motion.article>
  )
}

export function TestimonialCard({ quote, name, meta }: TestimonialItem) {
  return (
    <motion.article
      className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-sm"
      {...fadeUpProps}
    >
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-gold-400 text-gold-400" aria-hidden="true" />
        ))}
      </div>
      <p className="mb-5 text-[1.02rem] leading-8 text-forest-900/80">"{quote}"</p>
      <div>
        <p className="text-[1.02rem] font-semibold text-forest-900">{name}</p>
        <p className="text-base text-forest-900/58">{meta}</p>
      </div>
    </motion.article>
  )
}
