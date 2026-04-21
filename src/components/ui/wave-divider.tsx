import { motion } from 'framer-motion'
import { useSiteTheme } from '../../providers/site-theme-provider'

interface WaveDividerProps {
  readonly fill: string
  readonly flip?: boolean
}

export function WaveDivider({ fill, flip = false }: WaveDividerProps) {
  const {
    config: {
      dividers: { style, speed }
    }
  } = useSiteTheme()

  const pathByStyle = {
    classic: 'M0 18C78 40 157 62 240 67C348 74 409 32 511 35C635 39 708 104 825 105C942 106 1011 40 1125 27C1243 14 1343 37 1440 56V120H0V18Z',
    swoop: 'M0 52C120 72 213 86 312 78C437 67 520 19 638 18C798 17 890 82 1028 87C1168 92 1286 48 1440 22V120H0V52Z',
    crest: 'M0 26C77 16 155 18 229 34C304 50 380 82 456 83C561 84 646 27 749 18C841 10 919 38 1003 58C1088 79 1171 92 1262 84C1326 79 1386 58 1440 38V120H0V26Z'
  } as const

  return (
    <motion.div
      animate={{ x: [0, -10, 0], y: [0, 2, 0] }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] leading-none"
      transition={{ duration: speed, ease: 'easeInOut', repeat: Infinity }}
    >
      <motion.svg
        aria-hidden="true"
        className={flip ? 'block h-16 w-full rotate-180 md:h-20' : 'block h-16 w-full md:h-20'}
        initial={{ scaleX: 1.01 }}
        preserveAspectRatio="none"
        transition={{ duration: speed, ease: 'easeInOut', repeat: Infinity }}
        viewBox="0 0 1440 120"
        animate={{ scaleX: [1.01, 1.018, 1.01] }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={pathByStyle[style]}
          fill={fill}
        />
      </motion.svg>
    </motion.div>
  )
}
