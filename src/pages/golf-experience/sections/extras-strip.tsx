import { motion } from 'framer-motion'
import { Briefcase, Bus, Car, type LucideIcon } from 'lucide-react'
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
  { title: 'Car Rental', icon: Car }
]

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' }
} as const

export function GeExtrasStrip() {
  return (
    <GeSection background="gray" id="extras" className="pt-20 pb-20 sm:pt-24 sm:pb-24">
      <div className="text-center">
        <h2 className="font-ge text-[2rem] font-extrabold uppercase tracking-[0.04em] text-gs-green sm:text-[2.4rem]">
          {extrasCopy.title}
        </h2>
        <p className="mt-3 font-ge text-[1.05rem] italic leading-7 text-ge-gray500 sm:text-[1.1rem]">{extrasCopy.subtitle}</p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {extras.map(({ title, icon: Icon, note }) => (
          <motion.div
            key={title}
            className="flex flex-col items-center text-center"
            {...fadeUp}
          >
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-gs-green bg-white text-gs-green shadow-[0_8px_24px_rgba(38,146,224,0.18)] sm:h-24 sm:w-24">
              <Icon className="h-9 w-9" aria-hidden="true" />
            </span>
            <h4 className="mt-5 font-ge text-[1.2rem] font-bold uppercase tracking-[0.06em] text-gs-dark sm:text-[1.05rem]">
              {title}
            </h4>
            {note ? (
              <p className="mt-1 font-ge text-sm uppercase tracking-[0.12em] text-gs-green sm:text-[0.85rem]">
                ({note})
              </p>
            ) : null}
          </motion.div>
        ))}
      </div>
    </GeSection>
  )
}
