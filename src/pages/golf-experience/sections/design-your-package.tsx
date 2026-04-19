import { motion } from 'framer-motion'
import { GeSection } from '../components/ge-section'
import { designYourPackage } from '../data/copy'

interface StepCard {
  readonly eyebrow: string
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
  const steps: readonly StepCard[] = [
    designYourPackage.step1,
    designYourPackage.step2,
    designYourPackage.step3
  ]

  return (
    <GeSection background="white" className="pt-20 pb-12">
      <div className="text-center">
        <h2 className="font-ge text-[1.95rem] font-extrabold uppercase tracking-[0.04em] text-ge-teal sm:text-[2.4rem]">
          {designYourPackage.title}
        </h2>
        <p className="mt-3 font-ge text-[0.95rem] font-semibold uppercase tracking-[0.18em] text-ge-gray500">
          {designYourPackage.step1Tag} <span className="text-ge-orange">·</span>{' '}
          {designYourPackage.step2Tag} <span className="text-ge-orange">·</span>{' '}
          {designYourPackage.step3Tag}
        </p>
        <p className="mt-2 font-ge text-base italic text-ge-orange">{designYourPackage.closer}</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <motion.article
            key={step.eyebrow}
            className="group flex flex-col overflow-hidden rounded-sm border border-ge-gray100 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]"
            {...fadeUp}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={step.image}
                alt={step.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-orange">
                {step.eyebrow}
              </p>
              <h3 className="mt-2 font-ge text-[1.3rem] font-bold leading-snug text-ge-teal">
                {step.title}
              </h3>
              <p className="mt-3 font-ge text-[0.95rem] leading-7 text-ge-gray500">{step.body}</p>
              <a
                href={step.link}
                className="mt-5 inline-flex items-center gap-1 self-start font-ge text-[0.8rem] font-bold uppercase tracking-[0.14em] text-ge-teal transition-colors hover:text-ge-orange"
              >
                Read more →
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </GeSection>
  )
}
