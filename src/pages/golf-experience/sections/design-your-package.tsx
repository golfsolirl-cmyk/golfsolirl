import { motion } from 'framer-motion'
import { TriangleDivider } from '../components/triangle-divider'
import { designYourPackage } from '../data/copy'

interface StepCard {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly image: string
  readonly link: string
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' }
} as const

export function GeDesignYourPackage() {
  // 4 steps to match the source site exactly.
  const steps: readonly StepCard[] = [
    {
      badge: 'Step 1',
      title: 'Choose Your Destination',
      body: designYourPackage.step1.body,
      image: designYourPackage.step1.image,
      link: designYourPackage.step1.link
    },
    {
      badge: 'Step 2',
      title: 'Choose Your Golf Course',
      body: designYourPackage.step2.body,
      image: designYourPackage.step2.image,
      link: designYourPackage.step2.link
    },
    {
      badge: 'Step 3',
      title: 'Choose Your Accommodation',
      body: designYourPackage.step3.body,
      image: designYourPackage.step3.image,
      link: designYourPackage.step3.link
    },
    {
      badge: 'Step 4',
      title: 'Let us do the rest!',
      body: 'We design the perfect itinerary, book your tee times, transfers and accommodation, and look after every detail from departure to your final round.',
      image:
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
      link: '#enquire'
    }
  ]

  return (
    <section
      id="design-package"
      aria-labelledby="design-package-title"
      className="relative bg-gs-green text-white"
    >
      {/* Small white tab hanging from the top edge into the blue, exactly
          like the source. */}
      <TriangleDivider fill="#ffffff" position="top" height={36} variant="tab" />

      <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-20 sm:px-8">
        <motion.div className="text-center" {...fadeUp}>
          <h2
            id="design-package-title"
            className="font-ge text-[1.95rem] font-extrabold leading-tight text-white sm:text-[2.4rem]"
          >
            {designYourPackage.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-ge text-base font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-sm">
            Choose your destination · Choose your golf course · Choose your accommodation
          </p>
          <p className="mt-2 font-ge text-base italic text-white/80">{designYourPackage.closer}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <motion.article
              key={step.badge}
              className="group relative flex flex-col overflow-hidden rounded-sm bg-white text-gs-dark shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(0,0,0,0.24)]"
              {...fadeUp}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-0 top-3 inline-flex min-h-[32px] items-center bg-gs-dark/85 px-3 py-1 font-ge text-sm font-bold uppercase tracking-[0.12em] text-white sm:text-[0.8rem]">
                  {step.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-ge text-[1.05rem] font-bold leading-snug text-gs-green">
                  {step.title}
                </h3>
                <p className="mt-2 line-clamp-4 font-ge text-base leading-6 text-ge-gray500 sm:text-[0.95rem]">
                  {step.body}
                </p>
                <a
                  href={step.link}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1 self-start font-ge text-base font-bold uppercase tracking-[0.12em] text-gs-green transition-colors hover:text-ge-orange sm:text-[0.85rem]"
                >
                  Read more →
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <TriangleDivider fill="#ffffff" position="bottom" height={70} variant="simple" />
    </section>
  )
}
