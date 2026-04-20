import { motion } from 'framer-motion'
import { Briefcase, Bus, Car, Compass, type LucideIcon } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import { extrasCopy } from '../data/copy'

interface Extra {
  readonly title: string
  readonly icon: LucideIcon
  readonly note?: string
}

const extras: readonly Extra[] = [
  { title: 'Golf Club Rental', icon: Briefcase, note: 'Costa del Sol Only' },
  { title: 'Transfers', icon: Bus },
  { title: 'Car Rental', icon: Car },
  { title: 'Excursions', icon: Compass }
]

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export function GeExtrasStrip() {
  return (
    <GeSection background="gray" id="extras" className="pt-16 pb-16">
      <div className="text-center">
        <h2 className="font-ge text-[1.85rem] font-extrabold uppercase tracking-[0.04em] text-gs-green sm:text-[2.2rem]">
          {extrasCopy.title}
        </h2>
        <p className="mt-2 font-ge text-base italic text-ge-gray500">{extrasCopy.subtitle}</p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
        {extras.map(({ title, icon: Icon, note }) => (
          <motion.div
            key={title}
            className="flex flex-col items-center text-center"
            {...fadeUp}
          >
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-gs-green bg-white text-gs-green shadow-[0_8px_24px_rgba(38,146,224,0.18)]">
              <Icon className="h-9 w-9" aria-hidden="true" />
            </span>
            <h4 className="mt-5 font-ge text-[1.05rem] font-bold uppercase tracking-[0.06em] text-gs-dark">
              {title}
            </h4>
            {note ? (
              <p className="mt-1 font-ge text-[0.78rem] uppercase tracking-[0.14em] text-gs-green">
                ({note})
              </p>
            ) : null}
          </motion.div>
        ))}
      </div>
    </GeSection>
  )
}
