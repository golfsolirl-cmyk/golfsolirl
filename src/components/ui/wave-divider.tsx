import { motion } from 'framer-motion'

interface WaveDividerProps {
  readonly fill: string
  readonly flip?: boolean
}

export function WaveDivider({ fill, flip = false }: WaveDividerProps) {
  return (
    <motion.div
      animate={{ x: [0, -10, 0], y: [0, 2, 0] }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] leading-none"
      transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
    >
      <motion.svg
        aria-hidden="true"
        className={flip ? 'block h-16 w-full rotate-180 md:h-20' : 'block h-16 w-full md:h-20'}
        initial={{ scaleX: 1.01 }}
        preserveAspectRatio="none"
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
        viewBox="0 0 1440 120"
        animate={{ scaleX: [1.01, 1.018, 1.01] }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 18C78 40 157 62 240 67C348 74 409 32 511 35C635 39 708 104 825 105C942 106 1011 40 1125 27C1243 14 1343 37 1440 56V120H0V18Z"
          fill={fill}
        />
      </motion.svg>
    </motion.div>
  )
}
