import { motion } from 'framer-motion'
import type { GeCourse } from '../data/courses'

interface CourseCardProps {
  readonly course: GeCourse
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export function GeCourseCard({ course }: CourseCardProps) {
  return (
    <motion.article
      className="group flex flex-col overflow-hidden rounded-sm border border-ge-gray100 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]"
      {...fadeUp}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-ge text-[1.25rem] font-bold leading-snug text-ge-teal">
          {course.name}
        </h3>
        <p className="mt-3 line-clamp-4 font-ge text-[0.92rem] leading-7 text-ge-gray500">
          {course.description}
        </p>
        <a
          href={course.href}
          className="mt-4 inline-flex items-center gap-1 self-start font-ge text-[0.78rem] font-bold uppercase tracking-[0.14em] text-ge-teal transition-colors hover:text-ge-orange"
        >
          Read more →
        </a>
      </div>
    </motion.article>
  )
}
