import { motion } from 'framer-motion'
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

/**
 * Premium course card.
 *  - Tall hero image with gentle Ken-Burns zoom on hover
 *  - Gradient scrim so overlaid badges stay legible on any photo
 *  - Gold "character" badge top-left, green location chip top-right
 *  - Info panel lifts on hover with a soft gold underline reveal
 *  - Body uses the gs/dark + ge-orange palette only — no blue anywhere
 */
export function GeCourseCard({ course }: CourseCardProps) {
  return (
    <motion.article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ge-gray100 bg-white shadow-[0_6px_20px_rgba(6,59,42,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(6,59,42,0.18)]"
      {...fadeUp}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        {/* Bottom-up scrim for readability over the image edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark/85 via-gs-dark/15 to-transparent"
        />
        {/* Top row: flex + wrap stops character badge and area chip colliding on narrow columns */}
        <div className="pointer-events-none absolute left-2 right-2 top-2 z-10 flex flex-wrap items-start justify-between gap-2 sm:left-3 sm:right-3 sm:top-3">
          <span className="inline-flex min-w-0 max-w-[min(100%,11.5rem)] items-center gap-1 rounded-full border border-gs-gold/60 bg-gs-dark/90 px-2.5 py-1 font-ge text-[0.65rem] font-extrabold uppercase leading-tight tracking-[0.06em] text-gs-gold shadow-[0_8px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:max-w-[13rem] sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[0.72rem] sm:tracking-[0.08em]">
            <span className="truncate">{course.badge}</span>
          </span>
          <span className="inline-flex min-w-0 max-w-[min(100%,10.5rem)] items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 font-ge text-[0.65rem] font-bold uppercase leading-tight tracking-[0.06em] text-gs-green shadow-[0_4px_12px_rgba(0,0,0,0.18)] sm:max-w-[12rem] sm:text-[0.7rem] sm:tracking-[0.08em]">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{course.area}</span>
          </span>
        </div>
        {/* Course name — line clamp so long names never creep under the chips */}
        <h3 className="absolute bottom-2 left-3 right-3 line-clamp-2 font-ge text-[1.15rem] font-extrabold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:bottom-3 sm:left-4 sm:right-4 sm:text-[1.35rem] sm:leading-tight md:text-[1.4rem]">
          {course.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="font-ge text-base leading-7 text-ge-gray500 sm:text-[0.95rem]">
          {course.description}
        </p>
        <a
          href={course.href}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 self-start rounded-full bg-gs-dark/5 px-4 py-2 font-ge text-base font-bold uppercase tracking-[0.12em] text-gs-green transition-all duration-300 hover:bg-gs-gold hover:text-gs-dark group-hover:bg-gs-gold group-hover:text-gs-dark sm:text-[0.85rem]"
        >
          Get Tee-Time Quote
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </a>
      </div>

      {/* Bottom gold accent bar that grows on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gs-gold via-[#f4b41a] to-ge-orange transition-transform duration-500 group-hover:scale-x-100"
      />
    </motion.article>
  )
}
