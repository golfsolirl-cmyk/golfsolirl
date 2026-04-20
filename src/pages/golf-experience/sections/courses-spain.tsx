import { GeButton } from '../components/ge-button'
import { GeCourseCard } from '../components/course-card'
import { GeSection } from '../components/ge-section'
import { courseListsCopy } from '../data/copy'
import { coursesSpain } from '../data/courses'

export function GeCoursesSpain() {
  return (
    <GeSection background="white" id="golf-courses-spain" className="pt-8 pb-12">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase tracking-[0.04em] text-gs-green sm:text-[2.2rem]">
          {courseListsCopy.spainHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gs-green" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {coursesSpain.map((course) => (
          <GeCourseCard key={course.name} course={course} />
        ))}
      </div>

      <p className="mt-8 text-center font-ge text-base italic text-ge-gray500">
        {courseListsCopy.manyMore}
      </p>

      <div className="mt-6 flex justify-center">
        <GeButton href="#" variant="blue" size="md">
          {courseListsCopy.cta}
        </GeButton>
      </div>
    </GeSection>
  )
}
