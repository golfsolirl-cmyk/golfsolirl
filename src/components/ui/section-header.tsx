import { motion } from 'framer-motion'
import { cx } from '../../lib/utils'

interface SectionHeaderProps {
  readonly kicker: string
  readonly title: string
  readonly body: string
  readonly centered?: boolean
  readonly dark?: boolean
}

interface StepKickerParts {
  readonly stepNumber: string | null
  readonly label: string
}

const stepKickerPattern = /^Step\s+(\d+)\s+[—-]\s+(.+)$/

const getStepKickerParts = (kicker: string): StepKickerParts => {
  const match = kicker.match(stepKickerPattern)

  if (!match) {
    return {
      stepNumber: null,
      label: kicker
    }
  }

  return {
    stepNumber: match[1],
    label: match[2]
  }
}

export function AnimatedStepKicker({
  kicker,
  dark = false,
  centered = false,
  className
}: {
  readonly kicker: string
  readonly dark?: boolean
  readonly centered?: boolean
  readonly className?: string
}) {
  const { stepNumber, label } = getStepKickerParts(kicker)

  if (!stepNumber) {
    return (
      <p
        className={cx(
          'mb-3 text-[1rem] font-semibold uppercase tracking-[0.14em] md:text-[1.08rem]',
          dark
            ? 'text-gold-200 drop-shadow-[0_2px_16px_rgba(8,27,8,0.65)]'
            : 'text-forest-800',
          className
        )}
      >
        {label}
      </p>
    )
  }

  return (
    <motion.div
      className={cx('mb-4 flex flex-wrap items-center gap-3', centered && 'justify-center', className)}
      initial="hidden"
      transition={{ staggerChildren: 0.08, delayChildren: 0.06 }}
      viewport={{ once: true, amount: 0.45 }}
      whileInView="visible"
    >
      <motion.div
        className={cx(
          'flex items-center gap-3 rounded-full border px-4 py-3',
          centered && 'justify-center',
          dark ? 'border-white/10 bg-white/5 backdrop-blur-sm' : 'border-forest-100 bg-white/85 shadow-sm'
        )}
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 }
        }}
      >
        <span
          aria-hidden="true"
          className={cx(
            'font-display text-[1.3rem] font-black leading-none md:text-[1.68rem]',
            dark ? 'text-gold-300' : 'text-gold-500'
          )}
        >
          —
        </span>
        <span
          className={cx(
            'font-display text-[1.28rem] font-black tracking-[0.01em] md:text-[1.64rem]',
            dark ? 'text-white' : 'text-forest-900'
          )}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  )
}

export function SectionHeader({
  kicker,
  title,
  body,
  centered = false,
  dark = false
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cx(
        'mb-10 max-w-3xl md:mb-14',
        centered && 'mx-auto text-center',
        dark ? 'text-white' : 'text-forest-900'
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <AnimatedStepKicker centered={centered} dark={dark} kicker={kicker} />
      <h2 className={cx('mb-4 font-display text-[2.7rem] font-black leading-[1.03] tracking-[-0.024em] md:text-[3.45rem]', dark && 'text-white')}>
        {title}
      </h2>
      <p className={cx('max-w-2xl text-[1.08rem] leading-8 md:text-[1.16rem]', dark ? 'text-white/74' : 'text-forest-900/72', centered && 'mx-auto')}>
        {body}
      </p>
    </motion.div>
  )
}
