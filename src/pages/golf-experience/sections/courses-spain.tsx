import { GeButton } from '../components/ge-button'
import { GeCourseCard } from '../components/course-card'
import { GeSection } from '../components/ge-section'
import { courseListsCopy } from '../data/copy'
import { coursesSpain } from '../data/courses'

export function GeCoursesSpain() {
  return (
    <GeSection background="white" id="golf-courses-spain" className="pt-12 pb-16">
      <div className="text-center">
        <h2 className="font-ge text-[2.15rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-gs-green sm:text-[2.4rem]">
          {courseListsCopy.spainHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gs-gold" />
      </div>

      <div className="mt-12 grid gap-7 md:grid-cols-3">
        {coursesSpain.map((course) => (
          <GeCourseCard key={course.name} course={course} />
        ))}
      </div>

      <p className="mt-8 text-center font-ge text-[1.06rem] italic leading-8 text-ge-gray500 sm:text-[1.08rem]">
        {courseListsCopy.manyMore}
      </p>

      <div className="mt-8 flex justify-center">
        <GeButton href="/golf-courses" variant="gs-gold" size="md">
          {courseListsCopy.cta}
        </GeButton>
      </div>
    </GeSection>
  )
}
