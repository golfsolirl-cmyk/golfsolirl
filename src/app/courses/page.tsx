import { Container } from '@/components/layout/Container';
import { COURSES_MAP, AREA_FILTERS } from '@/lib/courses-data';
import { CoursesMapClient } from './CoursesMapClient';

export const metadata = {
  title: 'Golf Courses | Golf Sol Ireland',
  description: 'Costa del Sol golf courses: Valderrama, Finca Cortesín, La Cala, Marbella and more. Map and list.',
};

export default function CoursesPage() {
  return (
    <>
      <section className="relative py-24 md:py-32 bg-primary text-white overflow-hidden" aria-labelledby="courses-hero-heading">
        <Container className="relative z-10 text-center">
          <h1 id="courses-hero-heading" className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
            Golf courses
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            Costa del Sol — 70+ courses. Use the map or list below. Final tee times confirmed upon booking.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="map-heading">
        <Container>
          <h2 id="map-heading" className="section-title text-primary mb-6">
            Map
          </h2>
          <CoursesMapClient />
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-surface-alt" aria-labelledby="list-heading">
        <Container>
          <h2 id="list-heading" className="section-title text-primary mb-6">
            All courses
          </h2>
          <p className="text-muted text-sm mb-6">
            Filter by area: {AREA_FILTERS.join(', ')}. (Filter UI can be added as a client component.)
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES_MAP.map((course) => (
              <article
                key={course.name}
                className="bg-background rounded-xl p-4 border border-border/50 shadow-sm"
              >
                <h3 className="font-display font-bold text-primary">{course.name}</h3>
                <p className="text-muted text-sm mt-1">
                  Par {course.par} · {course.holes} holes · {course.town}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
