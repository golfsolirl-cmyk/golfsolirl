import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface WaveDividerProps {
  readonly fill?: string
  readonly flip?: boolean
}

export function WaveDivider({ fill = 'var(--wave-fill-primary)', flip = false }: WaveDividerProps) {
  const { waveDrift, wavePath } = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement)
    const waveAmplitude = Number.parseInt(rootStyles.getPropertyValue('--wave-amplitude') || '42', 10)
    const waveCurve = Number.parseInt(rootStyles.getPropertyValue('--wave-curve') || '56', 10)
    const drift = Number.parseInt(rootStyles.getPropertyValue('--wave-drift') || '12', 10)
    const pathStart = Math.max(8, waveAmplitude)
    const pathCurve = Math.max(24, waveCurve)
    const pathDrift = Math.max(4, drift)
    const generatedPath = `M0 ${pathStart}C78 ${pathStart + pathDrift} 157 ${pathStart + pathCurve} 240 ${pathStart + pathCurve + 5}C348 ${pathStart + pathCurve + 12} 409 ${pathStart + pathDrift} 511 ${pathStart + pathDrift + 3}C635 ${pathStart + pathDrift + 7} 708 ${pathStart + pathCurve + 48} 825 ${pathStart + pathCurve + 49}C942 ${pathStart + pathCurve + 50} 1011 ${pathStart + pathDrift + 4} 1125 ${pathStart - 2}C1243 ${pathStart - 14} 1343 ${pathStart + 5} 1440 ${pathStart + 24}V120H0V${pathStart}Z`

    return {
      waveDrift: pathDrift,
      wavePath: generatedPath
    }
  }, [])

  return (
    <motion.div
      animate={{ x: [0, -waveDrift, 0], y: [0, 2, 0] }}
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
        <path d={wavePath} fill={fill} />
      </motion.svg>
    </motion.div>
  )
}
