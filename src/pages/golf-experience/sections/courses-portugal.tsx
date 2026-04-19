import { GeButton } from '../components/ge-button'
import { GeCourseCard } from '../components/course-card'
import { GeSection } from '../components/ge-section'
import { courseListsCopy } from '../data/copy'
import { coursesPortugal } from '../data/courses'

export function GeCoursesPortugal() {
  return (
    <GeSection background="gray" id="golf-courses-portugal" className="pt-12 pb-12">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase tracking-[0.04em] text-ge-teal sm:text-[2.2rem]">
          {courseListsCopy.portugalHeading}
        </h2>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-ge-orange" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {coursesPortugal.map((course) => (
          <GeCourseCard key={course.name} course={course} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <GeButton href="#" variant="orange" size="md">
          {courseListsCopy.cta}
        </GeButton>
      </div>
    </GeSection>
  )
}
