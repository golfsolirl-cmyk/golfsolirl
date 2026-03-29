import { useId } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { cx } from '../../lib/utils'

const toneClassMap = {
  hero: {
    primary:
      'bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.24),rgba(255,255,255,0.06)_34%,rgba(80,163,45,0.3)_58%,rgba(220,88,1,0.22)_82%,transparent)]',
    secondary:
      'bg-[linear-gradient(140deg,rgba(255,255,255,0.12),rgba(110,191,71,0.24),rgba(220,88,1,0.18))]'
  },
  light: {
    primary:
      'bg-[radial-gradient(circle_at_35%_30%,rgba(80,163,45,0.18),rgba(80,163,45,0.04)_36%,rgba(255,255,255,0.45)_58%,rgba(220,88,1,0.14)_82%,transparent)]',
    secondary:
      'bg-[linear-gradient(140deg,rgba(255,255,255,0.42),rgba(240,247,238,0.58),rgba(253,186,116,0.2))]'
  },
  cream: {
    primary:
      'bg-[radial-gradient(circle_at_32%_30%,rgba(255,255,255,0.36),rgba(255,255,255,0.12)_30%,rgba(204,232,244,0.34)_56%,rgba(245,158,11,0.16)_84%,transparent)]',
    secondary:
      'bg-[linear-gradient(140deg,rgba(255,255,255,0.36),rgba(204,232,244,0.3),rgba(245,158,11,0.12))]'
  },
  sky: {
    primary:
      'bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.32),rgba(255,255,255,0.1)_28%,rgba(204,232,244,0.36)_56%,rgba(80,163,45,0.14)_80%,transparent)]',
    secondary:
      'bg-[linear-gradient(140deg,rgba(255,255,255,0.34),rgba(204,232,244,0.38),rgba(80,163,45,0.12))]'
  },
  dark: {
    primary:
      'bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_28%,rgba(80,163,45,0.3)_58%,rgba(220,88,1,0.18)_82%,transparent)]',
    secondary:
      'bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(110,191,71,0.22),rgba(220,88,1,0.14))]'
  },
  footer: {
    primary:
      'bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_28%,rgba(80,163,45,0.2)_58%,rgba(220,88,1,0.16)_82%,transparent)]',
    secondary:
      'bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(80,163,45,0.18),rgba(220,88,1,0.1))]'
  }
} as const

const sizeClassMap = {
  sm: 'h-28 w-28 md:h-36 md:w-36',
  md: 'h-36 w-36 md:h-44 md:w-44',
  lg: 'h-44 w-44 md:h-56 md:w-56'
} as const

const golfBallDimpleRows = [
  {
    opacity: 0.34,
    dimples: [
      { cx: 84, cy: 62, rx: 8, ry: 6 },
      { cx: 106, cy: 56, rx: 8, ry: 6 },
      { cx: 130, cy: 55, rx: 8, ry: 6 },
      { cx: 154, cy: 60, rx: 8, ry: 6 }
    ]
  },
  {
    opacity: 0.32,
    dimples: [
      { cx: 67, cy: 81, rx: 8.5, ry: 6.4 },
      { cx: 91, cy: 76, rx: 8.5, ry: 6.4 },
      { cx: 117, cy: 73, rx: 8.5, ry: 6.4 },
      { cx: 143, cy: 74, rx: 8.5, ry: 6.4 },
      { cx: 168, cy: 79, rx: 8.5, ry: 6.4 }
    ]
  },
  {
    opacity: 0.28,
    dimples: [
      { cx: 53, cy: 104, rx: 9, ry: 6.8 },
      { cx: 79, cy: 98, rx: 9, ry: 6.8 },
      { cx: 106, cy: 95, rx: 9, ry: 6.8 },
      { cx: 134, cy: 95, rx: 9, ry: 6.8 },
      { cx: 161, cy: 98, rx: 9, ry: 6.8 },
      { cx: 187, cy: 105, rx: 9, ry: 6.8 }
    ]
  },
  {
    opacity: 0.24,
    dimples: [
      { cx: 48, cy: 130, rx: 9, ry: 7 },
      { cx: 76, cy: 124, rx: 9, ry: 7 },
      { cx: 104, cy: 121, rx: 9, ry: 7 },
      { cx: 133, cy: 121, rx: 9, ry: 7 },
      { cx: 162, cy: 124, rx: 9, ry: 7 },
      { cx: 190, cy: 131, rx: 9, ry: 7 }
    ]
  },
  {
    opacity: 0.2,
    dimples: [
      { cx: 60, cy: 156, rx: 8.6, ry: 6.6 },
      { cx: 88, cy: 151, rx: 8.6, ry: 6.6 },
      { cx: 118, cy: 148, rx: 8.6, ry: 6.6 },
      { cx: 148, cy: 150, rx: 8.6, ry: 6.6 },
      { cx: 176, cy: 157, rx: 8.6, ry: 6.6 }
    ]
  },
  {
    opacity: 0.16,
    dimples: [
      { cx: 82, cy: 178, rx: 8, ry: 6.2 },
      { cx: 109, cy: 174, rx: 8, ry: 6.2 },
      { cx: 137, cy: 174, rx: 8, ry: 6.2 },
      { cx: 164, cy: 179, rx: 8, ry: 6.2 }
    ]
  }
] as const

interface AmbientGolfBallProps {
  readonly className?: string
  readonly size?: keyof typeof sizeClassMap
  readonly tone?: keyof typeof toneClassMap
  readonly variant?: 'calm' | 'hero'
}

export function AmbientGolfBall({
  className,
  size = 'md',
  tone = 'hero',
  variant = 'calm'
}: AmbientGolfBallProps) {
  const uniqueId = useId().replace(/:/g, '')
  const { scrollYProgress } = useScroll()
  const toneClasses = toneClassMap[tone]
  const fillId = `ambient-golf-ball-fill-${uniqueId}`
  const highlightId = `ambient-golf-ball-highlight-${uniqueId}`
  const shadowId = `ambient-golf-ball-shadow-${uniqueId}`
  const clipId = `ambient-golf-ball-clip-${uniqueId}`
  const isHero = variant === 'hero'
  const heroScrollY = useSpring(useTransform(scrollYProgress, [0, 0.22], [0, -46]), {
    stiffness: 120,
    damping: 22,
    mass: 0.35
  })
  const heroScrollX = useSpring(useTransform(scrollYProgress, [0, 0.22], [0, 24]), {
    stiffness: 120,
    damping: 22,
    mass: 0.35
  })
  const heroScrollRotate = useSpring(useTransform(scrollYProgress, [0, 0.22], [0, -6]), {
    stiffness: 120,
    damping: 22,
    mass: 0.35
  })
  const heroScrollScale = useSpring(useTransform(scrollYProgress, [0, 0.22], [1, 0.94]), {
    stiffness: 120,
    damping: 22,
    mass: 0.35
  })
  const heroScrollOpacity = useSpring(useTransform(scrollYProgress, [0, 0.22], [1, 0.76]), {
    stiffness: 120,
    damping: 22,
    mass: 0.35
  })
  const heroWrapperStyle = isHero
    ? {
        y: heroScrollY,
        x: heroScrollX,
        rotate: heroScrollRotate,
        scale: heroScrollScale,
        opacity: heroScrollOpacity
      }
    : undefined

  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none absolute z-0 hidden items-center justify-center md:flex', className)}
    >
      <motion.div className={cx('relative', sizeClassMap[size])} style={heroWrapperStyle}>
        {isHero ? (
          <>
            <motion.div
              animate={{ scale: [0.94, 1.04, 0.98, 0.94], opacity: [0.2, 0.38, 0.22, 0.2] }}
              className="absolute inset-[-20%] rounded-full border border-white/18"
              transition={{ duration: 7.5, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1.02, 1], opacity: [0.1, 0.24, 0.12, 0.1] }}
              className="absolute inset-[-34%] rounded-full border border-gold-300/18"
              transition={{ duration: 9.5, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
              animate={{ rotate: [0, 360] }}
              className="absolute inset-[-26%]"
              transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
            >
              <div className="absolute inset-0 rounded-full border border-transparent border-t-white/20 border-r-fairway-300/25" />
            </motion.div>
            <motion.div
              animate={{ rotate: [360, 0] }}
              className="absolute inset-[-18%]"
              transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
            >
              <div className="absolute inset-0 rounded-full border border-transparent border-b-gold-300/24 border-l-white/14" />
            </motion.div>
          </>
        ) : null}
        <motion.div
          animate={{
            scale: isHero ? [1, 1.1, 0.96, 1] : [1, 1.06, 0.98, 1],
            rotate: isHero ? [0, 16, -12, 0] : [0, 10, -8, 0],
            x: isHero ? [0, 18, -12, 0] : [0, 10, -8, 0],
            y: isHero ? [0, -16, 10, 0] : [0, -10, 8, 0]
          }}
          className={cx('absolute inset-[-24%] rounded-full blur-3xl', toneClasses.primary)}
          transition={{ duration: isHero ? 16 : 14, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          animate={{
            scale: isHero ? [0.92, 1.08, 1] : [0.94, 1.04, 1],
            rotate: isHero ? [0, -20, 12, 0] : [0, -14, 9, 0],
            x: isHero ? [0, -20, 12, 0] : [0, -14, 8, 0],
            y: isHero ? [0, 16, -10, 0] : [0, 12, -8, 0]
          }}
          className={cx(
            'absolute inset-[-10%] rounded-[42%_58%_60%_40%/40%_44%_56%_60%] blur-[60px]',
            toneClasses.secondary
          )}
          transition={{ duration: isHero ? 14 : 12, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          animate={{
            y: isHero ? [0, -14, 0, 16, 0] : [0, -8, 0, 10, 0],
            x: isHero ? [0, -16, 20, -10, 0] : [0, -8, 10, -5, 0],
            rotate: isHero ? [0, -3.2, 3, 0] : [0, -1.1, 1, 0]
          }}
          className="relative h-full w-full"
          transition={{ duration: isHero ? 10 : 8, ease: 'easeInOut', repeat: Infinity }}
        >
          <div className="absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.26),rgba(255,255,255,0.02)_58%,transparent)] blur-2xl" />
          <motion.div
            animate={{
              x: isHero ? [0, -10, 12, -6, 0] : [0, -5, 6, -3, 0],
              scaleX: isHero ? [0.92, 1.08, 0.94, 0.92] : [1, 1.05, 0.98, 1],
              scaleY: isHero ? [0.92, 0.78, 0.9, 0.92] : [1, 0.92, 0.98, 1],
              opacity: isHero ? [0.22, 0.32, 0.24, 0.22] : [0.2, 0.25, 0.2]
            }}
            className="absolute bottom-[-9%] left-1/2 h-[18%] w-[72%] -translate-x-1/2 rounded-full bg-black/25 blur-[18px]"
            transition={{ duration: isHero ? 10 : 8, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.div
            animate={
              isHero
                ? {
                    rotate: [0, -18, 16, -10, 0],
                    scale: [1, 1.01, 0.995, 1],
                    x: [0, -8, 10, -5, 0]
                  }
                : {
                    rotate: [0, -9, 8, -4, 0],
                    x: [0, -4, 5, -2, 0]
                  }
            }
            className="relative h-full w-full drop-shadow-[0_34px_80px_rgba(0,0,0,0.24)]"
            transition={{ duration: isHero ? 15 : 12, ease: 'easeInOut', repeat: Infinity }}
          >
            <svg className="h-full w-full" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id={fillId} cx="32%" cy="24%" r="72%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="26%" stopColor="#fbfbfa" />
                  <stop offset="58%" stopColor="#e6ebef" />
                  <stop offset="82%" stopColor="#cfd6df" />
                  <stop offset="100%" stopColor="#aeb8c5" />
                </radialGradient>
                <radialGradient id={highlightId} cx="28%" cy="22%" r="42%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                  <stop offset="38%" stopColor="rgba(255,255,255,0.52)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <radialGradient id={shadowId} cx="70%" cy="76%" r="44%">
                  <stop offset="0%" stopColor="rgba(98,110,128,0.26)" />
                  <stop offset="100%" stopColor="rgba(98,110,128,0)" />
                </radialGradient>
                <clipPath id={clipId}>
                  <circle cx="120" cy="120" r="108" />
                </clipPath>
              </defs>

              <circle cx="120" cy="120" fill={`url(#${fillId})`} r="108" stroke="rgba(255,255,255,0.72)" strokeWidth="2.5" />
              <circle cx="120" cy="120" fill={`url(#${highlightId})`} r="108" />
              <circle cx="120" cy="120" fill={`url(#${shadowId})`} r="108" />
              <ellipse cx="120" cy="210" fill="rgba(30,41,59,0.14)" rx="62" ry="14" />

              <motion.g
                animate={
                  isHero
                    ? {
                        x: [10, -12, 14, -10, 10],
                        rotate: [4, -10, 12, -8, 4],
                        y: [-2, 1, -1, 2, -2]
                      }
                    : {
                        x: [5, -6, 7, -4, 5],
                        rotate: [2, -5, 6, -3, 2],
                        y: [-1, 0.5, -0.5, 1, -1]
                      }
                }
                clipPath={`url(#${clipId})`}
                style={{ transformOrigin: '120px 120px' }}
                transition={{ duration: isHero ? 7.2 : 8.6, ease: 'easeInOut', repeat: Infinity }}
              >
                {golfBallDimpleRows.map((row, rowIndex) => (
                  <g key={rowIndex} opacity={row.opacity}>
                    {row.dimples.map((dimple, dimpleIndex) => (
                      <ellipse
                        key={dimpleIndex}
                        cx={dimple.cx}
                        cy={dimple.cy}
                        fill="rgba(120,130,150,0.18)"
                        rx={dimple.rx}
                        ry={dimple.ry}
                        stroke="rgba(255,255,255,0.44)"
                        strokeWidth="0.65"
                      />
                    ))}
                  </g>
                ))}
              </motion.g>

              <circle cx="120" cy="120" fill="none" r="101" stroke="rgba(255,255,255,0.38)" strokeWidth="1.4" />
              <path
                d="M76 55C95 36 131 33 156 49"
                fill="none"
                opacity="0.85"
                stroke="rgba(255,255,255,0.82)"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <path
                d="M78 58C101 42 132 42 151 53"
                fill="none"
                opacity="0.45"
                stroke="rgba(255,255,255,0.98)"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            {isHero ? (
              <motion.div
                animate={{ x: ['-135%', '140%'] }}
                className="absolute inset-y-[10%] left-[-22%] w-[42%] rotate-[16deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.62),rgba(255,255,255,0.12),transparent)] blur-xl"
                transition={{ duration: 4.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.8 }}
              />
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
