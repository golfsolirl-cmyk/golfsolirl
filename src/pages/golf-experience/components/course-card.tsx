import { m } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import type { GeCourse } from '../data/courses'

interface CourseCardProps {
  readonly course: GeCourse
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

function CourseBadgeChip({ badge }: { readonly badge: string }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-[#c9a84a]/45 bg-cream px-3 py-1 font-ge text-[0.68rem] font-extrabold uppercase leading-snug tracking-[0.1em] text-gs-green sm:text-[0.72rem]">
      {badge}
    </span>
  )
}

function CourseAreaChip({ area }: { readonly area: string }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-gs-green/15 bg-white px-3 py-1 font-ge text-[0.72rem] font-bold uppercase leading-snug tracking-[0.08em] text-gs-green sm:text-[0.78rem] sm:tracking-[0.1em]">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-gs-green/80" aria-hidden="true" />
      <span className="truncate">{area}</span>
    </span>
  )
}

/** Premium course card — readable meta chips + solid primary CTA. */
export function GeCourseCard({ course }: CourseCardProps) {
  return (
    <m.article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ge-gray100 bg-white shadow-[0_6px_20px_rgba(6,59,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(6,59,42,0.18)]"
      {...fadeUp}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04130c]/92 via-[#04130c]/35 to-transparent"
        />
        <h3
          style={{ color: '#ffffff' }}
          className="absolute bottom-2 left-3 right-3 font-ge text-[1.02rem] font-extrabold leading-snug tracking-[0.01em] drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)] sm:bottom-3 sm:left-4 sm:right-4 sm:text-[1.18rem]"
        >
          {course.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <CourseBadgeChip badge={course.badge} />
          <CourseAreaChip area={course.area} />
        </div>
        <p className="font-ge text-base leading-6 text-ge-gray500 sm:text-[0.92rem]">{course.description}</p>
        <div className="mt-auto border-t border-ge-gray100 pt-4">
          <a
            href={course.href}
            className="ge-course-card-cta gsol-cta-primary inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 font-ge text-[0.8125rem] font-bold uppercase tracking-[0.08em] sm:text-[0.875rem]"
          >
            Get tee-time quote
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-800 via-[#136047] to-brand-700 transition-transform duration-500 group-hover:scale-x-100"
      />
    </m.article>
  )
}
