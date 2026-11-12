import { m } from 'framer-motion'
import { BedDouble, CarFront, Flag, ArrowRight, Plane } from 'lucide-react'
import { GeButton } from '../components/ge-button'

const services = [
  {
    icon: Plane,
    title: 'Airport Transfers',
    body: 'Meet and greet at Málaga Airport. Golf-bag-friendly vehicles, live flight tracking, direct to your hotel.',
    href: '/services/transport',
    cta: 'Explore transfers',
    image: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
    accent: 'from-emerald-600 to-emerald-800'
  },
  {
    icon: Flag,
    title: 'Golf Courses',
    body: 'Over 70 courses from Málaga to Sotogrande. Tell us your shortlist and we request the tee times.',
    href: '/golf-courses',
    cta: 'See courses',
    image: '/images/ge-premium-golf-fairway-coastal.webp',
    accent: 'from-teal-600 to-teal-800'
  },
  {
    icon: BedDouble,
    title: 'Hotels & Stays',
    body: 'Beachfront Fuengirola, Torremolinos resorts, and apartment bases Irish groups book again and again.',
    href: '/accommodation',
    cta: 'Browse hotels',
    image: '/images/ge-premium-resort-hotel-hero.webp',
    accent: 'from-sky-600 to-sky-800'
  },
  {
    icon: CarFront,
    title: 'Full Packages',
    body: 'Courses, transfers, hotel — one quote, one team, one itinerary. Tell us the dates and group size.',
    href: '/contact',
    cta: 'Get a quote',
    image: '/images/transport-moment-arrivals.webp',
    accent: 'from-amber-600 to-amber-800'
  }
] as const

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
} as const

export function GeHomeWhatWeDo() {
  return (
    <section className="relative bg-white px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1240px]">
        <m.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
          <p className="font-ge text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-gs-green">
            What we do
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-gs-dark sm:text-[2.6rem] lg:text-[3rem]">
            Everything your golf trip needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-ge text-[1rem] leading-relaxed text-ge-gray500 sm:text-[1.08rem]">
            Transfers, tee times and the hotel — planned by one Irish desk from one quote.
          </p>
        </m.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <m.a
                key={service.title}
                href={service.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.06 * index }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-gs-dark shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-sm">
                    <Icon className="h-5 w-5" aria-hidden strokeWidth={1.8} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-ge text-[1.08rem] font-bold text-gs-dark">{service.title}</h3>
                  <p className="mt-2 flex-1 font-ge text-[0.88rem] leading-relaxed text-ge-gray500">{service.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-ge text-[0.82rem] font-semibold text-gs-green transition-colors group-hover:text-gs-dark">
                    {service.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </m.a>
            )
          })}
        </div>

        <m.div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
          <GeButton href="/contact" variant="gs-green" size="lg">
            Get a free quote
            <ArrowRight className="h-4 w-4" aria-hidden />
          </GeButton>
          <GeButton href="/services/transport" variant="outline-gs-green" size="lg">
            Explore transfers
          </GeButton>
        </m.div>
      </div>
    </section>
  )
}
