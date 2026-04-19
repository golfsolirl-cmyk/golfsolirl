import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useDesignTheme } from '../../theme/design-theme-provider'

interface WaveDividerProps {
  readonly fill: string
  readonly flip?: boolean
}

export function WaveDivider({ fill, flip = false }: WaveDividerProps) {
  const {
    theme: { wave }
  } = useDesignTheme()
  const path = useMemo(() => {
    if (wave.variant === 'crest') {
      return 'M0 24C88 58 166 82 262 84C362 86 447 42 548 39C663 35 742 97 856 96C974 94 1041 36 1158 23C1264 12 1352 30 1440 54V120H0V24Z'
    }

    if (wave.variant === 'calm') {
      return 'M0 35C84 47 161 63 254 68C353 74 441 56 538 52C643 48 733 57 832 60C938 63 1036 52 1138 45C1245 37 1344 39 1440 49V120H0V35Z'
    }

    return 'M0 18C78 40 157 62 240 67C348 74 409 32 511 35C635 39 708 104 825 105C942 106 1011 40 1125 27C1243 14 1343 37 1440 56V120H0V18Z'
  }, [wave.variant])

  return (
    <motion.div
      animate={{ x: [0, -10, 0], y: [0, 2, 0] }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] leading-none"
      transition={{ duration: wave.driftSeconds, ease: 'easeInOut', repeat: Infinity }}
    >
      <motion.svg
        aria-hidden="true"
        className={flip ? 'block w-full rotate-180' : 'block w-full'}
        initial={{ scaleX: 1.01 }}
        preserveAspectRatio="none"
        style={{ height: 'var(--gsol-wave-height)' }}
        transition={{ duration: wave.driftSeconds, ease: 'easeInOut', repeat: Infinity }}
        viewBox="0 0 1440 120"
        animate={{ scaleX: [1.01, 1.018, 1.01] }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} fill={fill} />
      </motion.svg>
    </motion.div>
  )
}
