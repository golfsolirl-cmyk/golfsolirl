import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Download, Palette, RotateCcw, Settings2, Shuffle } from 'lucide-react'
import { cx } from '../lib/utils'

type FontChoice = 'Rubik' | 'Open Sans' | 'Inter' | 'Manrope' | 'System UI'
export type DividerStyle = 'classic' | 'swoop' | 'crest'

export interface SiteThemeConfig {
  readonly colors: {
    readonly dark: string
    readonly green: string
    readonly accent: string
    readonly gold: string
    readonly goldSoft: string
    readonly orange: string
    readonly background: string
    readonly surface: string
  }
  readonly typography: {
    readonly displayFont: FontChoice
    readonly bodyFont: FontChoice
    readonly geFont: FontChoice
    readonly scale: number
    readonly displayWeight: number
    readonly bodyWeight: number
  }
  readonly buttons: {
    readonly radius: number
    readonly paddingX: number
    readonly paddingY: number
  }
  readonly layout: {
    readonly sectionSpacing: number
    readonly density: number
    readonly cardRadius: number
    readonly shadowDepth: number
  }
  readonly dividers: {
    readonly style: DividerStyle
    readonly speed: number
  }
}

type ThemeContextValue = {
  readonly config: SiteThemeConfig
  readonly setConfig: Dispatch<SetStateAction<SiteThemeConfig>>
  readonly randomize: () => void
  readonly reset: () => void
  readonly exportConfig: () => void
  readonly panelEnabled: boolean
}

const STORAGE_KEY = 'gsol-design-theme-v1'
const panelEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DESIGN_PANEL !== 'false'

const defaultTheme: SiteThemeConfig = {
  colors: {
    dark: '#063B2A',
    green: '#0B6B45',
    accent: '#1ED760',
    gold: '#FFC72C',
    goldSoft: '#FFE27A',
    orange: '#ff5b2d',
    background: '#F4F7F5',
    surface: '#F7F9F5'
  },
  typography: {
    displayFont: 'Rubik',
    bodyFont: 'Rubik',
    geFont: 'Open Sans',
    scale: 1,
    displayWeight: 800,
    bodyWeight: 400
  },
  buttons: {
    radius: 999,
    paddingX: 1.65,
    paddingY: 0.95
  },
  layout: {
    sectionSpacing: 7,
    density: 1,
    cardRadius: 28,
    shadowDepth: 1
  },
  dividers: {
    style: 'classic',
    speed: 12
  }
}

const themePresets: readonly SiteThemeConfig[] = [
  defaultTheme,
  {
    colors: {
      dark: '#072E24',
      green: '#0E7B55',
      accent: '#33D98F',
      gold: '#EFBF52',
      goldSoft: '#F7D98A',
      orange: '#F07A3C',
      background: '#F3F7F2',
      surface: '#FBFCF9'
    },
    typography: {
      displayFont: 'Manrope',
      bodyFont: 'Inter',
      geFont: 'Inter',
      scale: 1.02,
      displayWeight: 800,
      bodyWeight: 400
    },
    buttons: {
      radius: 28,
      paddingX: 1.55,
      paddingY: 0.92
    },
    layout: {
      sectionSpacing: 7.3,
      density: 0.98,
      cardRadius: 30,
      shadowDepth: 1.08
    },
    dividers: {
      style: 'swoop',
      speed: 10
    }
  },
  {
    colors: {
      dark: '#062E33',
      green: '#0C6457',
      accent: '#19C7A1',
      gold: '#F0BB45',
      goldSoft: '#F8DD8D',
      orange: '#F06D45',
      background: '#F2F7F7',
      surface: '#F9FCFC'
    },
    typography: {
      displayFont: 'Inter',
      bodyFont: 'Inter',
      geFont: 'Open Sans',
      scale: 0.99,
      displayWeight: 800,
      bodyWeight: 400
    },
    buttons: {
      radius: 22,
      paddingX: 1.5,
      paddingY: 0.88
    },
    layout: {
      sectionSpacing: 6.8,
      density: 1.02,
      cardRadius: 24,
      shadowDepth: 0.92
    },
    dividers: {
      style: 'crest',
      speed: 14
    }
  }
] as const

const fontValueMap: Record<FontChoice, string> = {
  Rubik: '"Rubik"',
  'Open Sans': '"Open Sans"',
  Inter: '"Inter"',
  Manrope: '"Manrope"',
  'System UI': 'system-ui'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '').trim()
  const normalized = value.length === 3 ? value.split('').map((char) => `${char}${char}`).join('') : value
  const parsed = Number.parseInt(normalized, 16)

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255
  }
}

function toRgbVariable(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

function toRgbaTuple(rgbVariable: string) {
  return rgbVariable.split(' ').join(', ')
}

function mix(hexA: string, hexB: string, ratio: number) {
  const left = hexToRgb(hexA)
  const right = hexToRgb(hexB)
  const weight = clamp(ratio, 0, 1)
  const convert = (a: number, b: number) => Math.round(a + (b - a) * weight)

  return `#${[convert(left.r, right.r), convert(left.g, right.g), convert(left.b, right.b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`
}

function mergeTheme(source: unknown): SiteThemeConfig {
  if (!isObject(source)) {
    return defaultTheme
  }

  const colors = isObject(source.colors) ? source.colors : {}
  const typography = isObject(source.typography) ? source.typography : {}
  const buttons = isObject(source.buttons) ? source.buttons : {}
  const layout = isObject(source.layout) ? source.layout : {}
  const dividers = isObject(source.dividers) ? source.dividers : {}

  return {
    colors: {
      dark: typeof colors.dark === 'string' ? colors.dark : defaultTheme.colors.dark,
      green: typeof colors.green === 'string' ? colors.green : defaultTheme.colors.green,
      accent: typeof colors.accent === 'string' ? colors.accent : defaultTheme.colors.accent,
      gold: typeof colors.gold === 'string' ? colors.gold : defaultTheme.colors.gold,
      goldSoft: typeof colors.goldSoft === 'string' ? colors.goldSoft : defaultTheme.colors.goldSoft,
      orange: typeof colors.orange === 'string' ? colors.orange : defaultTheme.colors.orange,
      background: typeof colors.background === 'string' ? colors.background : defaultTheme.colors.background,
      surface: typeof colors.surface === 'string' ? colors.surface : defaultTheme.colors.surface
    },
    typography: {
      displayFont:
        typography.displayFont === 'Rubik' ||
        typography.displayFont === 'Open Sans' ||
        typography.displayFont === 'Inter' ||
        typography.displayFont === 'Manrope' ||
        typography.displayFont === 'System UI'
          ? typography.displayFont
          : defaultTheme.typography.displayFont,
      bodyFont:
        typography.bodyFont === 'Rubik' ||
        typography.bodyFont === 'Open Sans' ||
        typography.bodyFont === 'Inter' ||
        typography.bodyFont === 'Manrope' ||
        typography.bodyFont === 'System UI'
          ? typography.bodyFont
          : defaultTheme.typography.bodyFont,
      geFont:
        typography.geFont === 'Rubik' ||
        typography.geFont === 'Open Sans' ||
        typography.geFont === 'Inter' ||
        typography.geFont === 'Manrope' ||
        typography.geFont === 'System UI'
          ? typography.geFont
          : defaultTheme.typography.geFont,
      scale:
        typeof typography.scale === 'number'
          ? clamp(typography.scale, 0.92, 1.1)
          : defaultTheme.typography.scale,
      displayWeight:
        typeof typography.displayWeight === 'number'
          ? clamp(typography.displayWeight, 600, 900)
          : defaultTheme.typography.displayWeight,
      bodyWeight:
        typeof typography.bodyWeight === 'number'
          ? clamp(typography.bodyWeight, 300, 600)
          : defaultTheme.typography.bodyWeight
    },
    buttons: {
      radius:
        typeof buttons.radius === 'number' ? clamp(buttons.radius, 14, 999) : defaultTheme.buttons.radius,
      paddingX:
        typeof buttons.paddingX === 'number'
          ? clamp(buttons.paddingX, 1.1, 2)
          : defaultTheme.buttons.paddingX,
      paddingY:
        typeof buttons.paddingY === 'number'
          ? clamp(buttons.paddingY, 0.72, 1.25)
          : defaultTheme.buttons.paddingY
    },
    layout: {
      sectionSpacing:
        typeof layout.sectionSpacing === 'number'
          ? clamp(layout.sectionSpacing, 5.2, 8.8)
          : defaultTheme.layout.sectionSpacing,
      density:
        typeof layout.density === 'number' ? clamp(layout.density, 0.88, 1.12) : defaultTheme.layout.density,
      cardRadius:
        typeof layout.cardRadius === 'number'
          ? clamp(layout.cardRadius, 18, 36)
          : defaultTheme.layout.cardRadius,
      shadowDepth:
        typeof layout.shadowDepth === 'number'
          ? clamp(layout.shadowDepth, 0.72, 1.3)
          : defaultTheme.layout.shadowDepth
    },
    dividers: {
      style:
        dividers.style === 'classic' || dividers.style === 'swoop' || dividers.style === 'crest'
          ? dividers.style
          : defaultTheme.dividers.style,
      speed: typeof dividers.speed === 'number' ? clamp(dividers.speed, 8, 18) : defaultTheme.dividers.speed
    }
  }
}

function randomTheme() {
  const preset = themePresets[Math.floor(Math.random() * themePresets.length)] ?? defaultTheme

  return {
    ...preset,
    typography: {
      ...preset.typography,
      scale: clamp(Number((0.96 + Math.random() * 0.11).toFixed(2)), 0.92, 1.1)
    },
    buttons: {
      ...preset.buttons,
      radius: Math.round(preset.buttons.radius === 999 ? 999 : clamp(preset.buttons.radius + (Math.random() * 10 - 5), 14, 999)),
      paddingX: Number(clamp(preset.buttons.paddingX + (Math.random() * 0.22 - 0.11), 1.1, 2).toFixed(2)),
      paddingY: Number(clamp(preset.buttons.paddingY + (Math.random() * 0.12 - 0.06), 0.72, 1.25).toFixed(2))
    },
    layout: {
      ...preset.layout,
      sectionSpacing: Number(clamp(preset.layout.sectionSpacing + (Math.random() * 0.5 - 0.25), 5.2, 8.8).toFixed(2)),
      density: Number(clamp(preset.layout.density + (Math.random() * 0.08 - 0.04), 0.88, 1.12).toFixed(2)),
      cardRadius: Math.round(clamp(preset.layout.cardRadius + (Math.random() * 4 - 2), 18, 36)),
      shadowDepth: Number(clamp(preset.layout.shadowDepth + (Math.random() * 0.16 - 0.08), 0.72, 1.3).toFixed(2))
    },
    dividers: {
      style: (['classic', 'swoop', 'crest'] as const)[Math.floor(Math.random() * 3)] ?? preset.dividers.style,
      speed: Math.round(clamp(preset.dividers.speed + (Math.random() * 4 - 2), 8, 18))
    }
  } satisfies SiteThemeConfig
}

function applyThemeVariables(config: SiteThemeConfig) {
  const root = document.documentElement
  const { colors, typography, buttons, layout, dividers } = config

  const forest950 = mix(colors.dark, '#000000', 0.2)
  const forest800 = mix(colors.dark, colors.green, 0.22)
  const forest700 = mix(colors.dark, colors.green, 0.38)
  const forest600 = mix(colors.dark, colors.green, 0.54)
  const forest500 = mix(colors.green, colors.accent, 0.18)
  const forest400 = mix(colors.green, colors.accent, 0.34)
  const forest300 = mix(colors.surface, colors.green, 0.24)
  const forest200 = mix(colors.surface, colors.green, 0.18)
  const forest100 = mix(colors.surface, colors.green, 0.12)
  const forest50 = mix(colors.surface, colors.green, 0.06)
  const fairway700 = mix(colors.green, colors.dark, 0.35)
  const fairway600 = colors.green
  const fairway500 = mix(colors.green, colors.accent, 0.28)
  const fairway400 = mix(colors.green, colors.accent, 0.48)
  const fairway300 = mix(colors.surface, colors.accent, 0.36)
  const fairway200 = mix(colors.surface, colors.accent, 0.24)
  const fairway100 = mix(colors.surface, colors.accent, 0.14)
  const fairway50 = mix(colors.surface, colors.accent, 0.08)
  const gold700 = mix(colors.gold, colors.orange, 0.58)
  const gold600 = mix(colors.gold, colors.orange, 0.4)
  const gold500 = colors.gold
  const gold400 = colors.orange
  const gold300 = mix(colors.gold, colors.goldSoft, 0.4)
  const gold200 = mix(colors.surface, colors.gold, 0.22)
  const gold100 = mix(colors.surface, colors.goldSoft, 0.15)
  const gold50 = mix(colors.surface, colors.goldSoft, 0.08)
  const cream = mix(colors.surface, colors.goldSoft, 0.12)
  const offwhite = colors.surface
  const gsGreenLight = mix(colors.green, colors.accent, 0.52)

  const shadowAlpha = 0.12 * layout.shadowDepth
  const deepShadowAlpha = 0.2 * layout.shadowDepth
  const goldGlowAlpha = 0.18 * layout.shadowDepth
  const buttonGoldAlpha = 0.42 * layout.shadowDepth
  const buttonGreenAlpha = 0.32 * layout.shadowDepth

  root.style.setProperty('--theme-font-display', fontValueMap[typography.displayFont])
  root.style.setProperty('--theme-font-body', fontValueMap[typography.bodyFont])
  root.style.setProperty('--theme-font-ge', fontValueMap[typography.geFont])
  root.style.setProperty('--theme-font-scale', typography.scale.toString())
  root.style.setProperty('--theme-display-weight', typography.displayWeight.toString())
  root.style.setProperty('--theme-body-weight', typography.bodyWeight.toString())
  root.style.setProperty('--theme-button-radius', `${buttons.radius}px`)
  root.style.setProperty('--theme-button-padding-x', `${buttons.paddingX}rem`)
  root.style.setProperty('--theme-button-padding-y', `${buttons.paddingY}rem`)
  root.style.setProperty('--theme-card-radius', `${layout.cardRadius}px`)
  root.style.setProperty('--theme-card-radius-sm', `${Math.max(16, layout.cardRadius - 8)}px`)
  root.style.setProperty('--theme-card-radius-lg', `${layout.cardRadius + 8}px`)
  root.style.setProperty('--theme-section-spacing-mobile', `${(layout.sectionSpacing / 1.28).toFixed(2)}rem`)
  root.style.setProperty('--theme-section-spacing-desktop', `${layout.sectionSpacing.toFixed(2)}rem`)
  root.style.setProperty('--theme-density', layout.density.toString())
  root.style.setProperty('--theme-wave-speed', `${dividers.speed}s`)
  root.style.setProperty('--color-forest-950', toRgbVariable(forest950))
  root.style.setProperty('--color-forest-900', toRgbVariable(colors.dark))
  root.style.setProperty('--color-forest-800', toRgbVariable(forest800))
  root.style.setProperty('--color-forest-700', toRgbVariable(forest700))
  root.style.setProperty('--color-forest-600', toRgbVariable(forest600))
  root.style.setProperty('--color-forest-500', toRgbVariable(forest500))
  root.style.setProperty('--color-forest-400', toRgbVariable(forest400))
  root.style.setProperty('--color-forest-300', toRgbVariable(forest300))
  root.style.setProperty('--color-forest-200', toRgbVariable(forest200))
  root.style.setProperty('--color-forest-100', toRgbVariable(forest100))
  root.style.setProperty('--color-forest-50', toRgbVariable(forest50))
  root.style.setProperty('--color-fairway-700', toRgbVariable(fairway700))
  root.style.setProperty('--color-fairway-600', toRgbVariable(fairway600))
  root.style.setProperty('--color-fairway-500', toRgbVariable(fairway500))
  root.style.setProperty('--color-fairway-400', toRgbVariable(fairway400))
  root.style.setProperty('--color-fairway-300', toRgbVariable(fairway300))
  root.style.setProperty('--color-fairway-200', toRgbVariable(fairway200))
  root.style.setProperty('--color-fairway-100', toRgbVariable(fairway100))
  root.style.setProperty('--color-fairway-50', toRgbVariable(fairway50))
  root.style.setProperty('--color-gold-700', toRgbVariable(gold700))
  root.style.setProperty('--color-gold-600', toRgbVariable(gold600))
  root.style.setProperty('--color-gold-500', toRgbVariable(gold500))
  root.style.setProperty('--color-gold-400', toRgbVariable(gold400))
  root.style.setProperty('--color-gold-300', toRgbVariable(gold300))
  root.style.setProperty('--color-gold-200', toRgbVariable(gold200))
  root.style.setProperty('--color-gold-100', toRgbVariable(gold100))
  root.style.setProperty('--color-gold-50', toRgbVariable(gold50))
  root.style.setProperty('--color-cream', toRgbVariable(cream))
  root.style.setProperty('--color-offwhite', toRgbVariable(offwhite))
  root.style.setProperty('--color-gs-green', toRgbVariable(colors.green))
  root.style.setProperty('--color-gs-green-light', toRgbVariable(gsGreenLight))
  root.style.setProperty('--color-gs-dark', toRgbVariable(colors.dark))
  root.style.setProperty('--color-gs-electric', toRgbVariable(colors.accent))
  root.style.setProperty('--color-gs-gold', toRgbVariable(colors.gold))
  root.style.setProperty('--color-gs-gold-light', toRgbVariable(colors.goldSoft))
  root.style.setProperty('--color-gs-bg', toRgbVariable(colors.background))
  root.style.setProperty('--shadow-glow', `0 24px 80px rgba(${toRgbaTuple(toRgbVariable(colors.orange))}, ${goldGlowAlpha.toFixed(2)})`)
  root.style.setProperty('--shadow-soft', `0 18px 60px rgba(${toRgbaTuple(toRgbVariable(colors.dark))}, ${shadowAlpha.toFixed(2)})`)
  root.style.setProperty(
    '--shadow-gs-gold',
    `0 8px 22px rgba(${toRgbaTuple(toRgbVariable(colors.gold))}, ${buttonGoldAlpha.toFixed(2)})`
  )
  root.style.setProperty(
    '--shadow-gs-gold-hover',
    `0 10px 28px rgba(${toRgbaTuple(toRgbVariable(colors.gold))}, ${(buttonGoldAlpha + 0.2).toFixed(2)})`
  )
  root.style.setProperty(
    '--shadow-gs-green',
    `0 8px 22px rgba(${toRgbaTuple(toRgbVariable(colors.green))}, ${buttonGreenAlpha.toFixed(2)})`
  )
  root.style.setProperty(
    '--theme-panel-shadow',
    `0 24px 80px rgba(${toRgbaTuple(toRgbVariable(colors.dark))}, ${deepShadowAlpha.toFixed(2)})`
  )
}

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return defaultTheme
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? mergeTheme(JSON.parse(stored)) : defaultTheme
  } catch {
    return defaultTheme
  }
}

function ControlSection({
  title,
  defaultOpen = false,
  children
}: {
  readonly title: string
  readonly defaultOpen?: boolean
  readonly children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-[1.2rem] border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-white/86">{title}</span>
        <ChevronDown className={cx('h-4 w-4 text-gold-300 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/10 px-4 py-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function ColorField({
  label,
  value,
  onChange
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-white/76">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-10 cursor-pointer rounded-full border border-white/20 bg-transparent"
        />
        <span className="min-w-[76px] text-right font-mono text-xs text-white/55">{value.toUpperCase()}</span>
      </div>
    </label>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange
}: {
  readonly label: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step: number
  readonly suffix?: string
  readonly onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm text-white/76">{label}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#ffc72c]"
      />
    </label>
  )
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  readonly label: string
  readonly value: T
  readonly options: readonly T[]
  readonly onChange: (value: T) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/76">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 w-full rounded-xl border border-white/12 bg-white/8 px-3 text-sm text-white outline-none transition focus:border-gold-300 focus:ring-2 focus:ring-gold-300/25"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-forest-950 text-white">
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function DesignControlPanel() {
  const theme = useSiteTheme()
  const { config, setConfig } = theme

  const updateConfig = useCallback(
    <K extends keyof SiteThemeConfig, P extends keyof SiteThemeConfig[K]>(
      section: K,
      key: P,
      value: SiteThemeConfig[K][P]
    ) => {
      setConfig((current) => ({
        ...current,
        [section]: {
          ...current[section],
          [key]: value
        }
      }))
    },
    [setConfig]
  )

  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cx(
        'fixed bottom-4 right-4 z-[80] w-[min(92vw,24rem)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-forest-950/94 text-white shadow-[var(--theme-panel-shadow)] backdrop-blur-xl',
        collapsed && 'w-auto'
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-gold-300">
            <Settings2 className="h-5 w-5" aria-hidden="true" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">Design Lab</p>
              <p className="text-xs text-white/60">Dev-only global controls</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/82 transition hover:border-gold-300/45 hover:text-gold-300"
          aria-label={collapsed ? 'Expand design panel' : 'Collapse design panel'}
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {!collapsed ? (
        <div className="max-h-[78vh] space-y-4 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={theme.randomize}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/12"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              Random
            </button>
            <button
              type="button"
              onClick={theme.reset}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/12"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={theme.exportConfig}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gold-400/18 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-200 transition hover:bg-gold-400/26"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export
            </button>
          </div>

          <ControlSection defaultOpen title="Colors">
            <ColorField label="Dark surface" value={config.colors.dark} onChange={(value) => updateConfig('colors', 'dark', value)} />
            <ColorField label="Primary green" value={config.colors.green} onChange={(value) => updateConfig('colors', 'green', value)} />
            <ColorField label="Accent green" value={config.colors.accent} onChange={(value) => updateConfig('colors', 'accent', value)} />
            <ColorField label="Gold" value={config.colors.gold} onChange={(value) => updateConfig('colors', 'gold', value)} />
            <ColorField label="Gold light" value={config.colors.goldSoft} onChange={(value) => updateConfig('colors', 'goldSoft', value)} />
            <ColorField label="Orange" value={config.colors.orange} onChange={(value) => updateConfig('colors', 'orange', value)} />
            <ColorField label="Background" value={config.colors.background} onChange={(value) => updateConfig('colors', 'background', value)} />
            <ColorField label="Surface" value={config.colors.surface} onChange={(value) => updateConfig('colors', 'surface', value)} />
          </ControlSection>

          <ControlSection title="Typography">
            <SelectField
              label="Display font"
              value={config.typography.displayFont}
              options={['Rubik', 'Inter', 'Manrope', 'Open Sans', 'System UI']}
              onChange={(value) => updateConfig('typography', 'displayFont', value)}
            />
            <SelectField
              label="Body font"
              value={config.typography.bodyFont}
              options={['Rubik', 'Inter', 'Manrope', 'Open Sans', 'System UI']}
              onChange={(value) => updateConfig('typography', 'bodyFont', value)}
            />
            <SelectField
              label="Marketing font"
              value={config.typography.geFont}
              options={['Open Sans', 'Rubik', 'Inter', 'Manrope', 'System UI']}
              onChange={(value) => updateConfig('typography', 'geFont', value)}
            />
            <RangeField
              label="Font scale"
              value={config.typography.scale}
              min={0.92}
              max={1.1}
              step={0.01}
              onChange={(value) => updateConfig('typography', 'scale', Number(value.toFixed(2)))}
            />
            <RangeField
              label="Display weight"
              value={config.typography.displayWeight}
              min={600}
              max={900}
              step={50}
              onChange={(value) => updateConfig('typography', 'displayWeight', value)}
            />
            <RangeField
              label="Body weight"
              value={config.typography.bodyWeight}
              min={300}
              max={600}
              step={50}
              onChange={(value) => updateConfig('typography', 'bodyWeight', value)}
            />
          </ControlSection>

          <ControlSection title="Buttons">
            <RangeField
              label="Radius"
              value={config.buttons.radius}
              min={14}
              max={999}
              step={1}
              suffix="px"
              onChange={(value) => updateConfig('buttons', 'radius', value)}
            />
            <RangeField
              label="Horizontal padding"
              value={config.buttons.paddingX}
              min={1.1}
              max={2}
              step={0.05}
              suffix="rem"
              onChange={(value) => updateConfig('buttons', 'paddingX', Number(value.toFixed(2)))}
            />
            <RangeField
              label="Vertical padding"
              value={config.buttons.paddingY}
              min={0.72}
              max={1.25}
              step={0.02}
              suffix="rem"
              onChange={(value) => updateConfig('buttons', 'paddingY', Number(value.toFixed(2)))}
            />
          </ControlSection>

          <ControlSection title="Layout">
            <RangeField
              label="Section spacing"
              value={config.layout.sectionSpacing}
              min={5.2}
              max={8.8}
              step={0.1}
              suffix="rem"
              onChange={(value) => updateConfig('layout', 'sectionSpacing', Number(value.toFixed(2)))}
            />
            <RangeField
              label="Visual density"
              value={config.layout.density}
              min={0.88}
              max={1.12}
              step={0.01}
              onChange={(value) => updateConfig('layout', 'density', Number(value.toFixed(2)))}
            />
            <RangeField
              label="Card radius"
              value={config.layout.cardRadius}
              min={18}
              max={36}
              step={1}
              suffix="px"
              onChange={(value) => updateConfig('layout', 'cardRadius', value)}
            />
            <RangeField
              label="Shadow depth"
              value={config.layout.shadowDepth}
              min={0.72}
              max={1.3}
              step={0.01}
              onChange={(value) => updateConfig('layout', 'shadowDepth', Number(value.toFixed(2)))}
            />
          </ControlSection>

          <ControlSection title="Dividers">
            <SelectField
              label="Wave style"
              value={config.dividers.style}
              options={['classic', 'swoop', 'crest']}
              onChange={(value) => updateConfig('dividers', 'style', value)}
            />
            <RangeField
              label="Animation speed"
              value={config.dividers.speed}
              min={8}
              max={18}
              step={1}
              suffix="s"
              onChange={(value) => updateConfig('dividers', 'speed', value)}
            />
          </ControlSection>
        </div>
      ) : null}
    </motion.aside>
  )
}

export function SiteThemeProvider({ children }: { readonly children: ReactNode }) {
  const [config, setConfig] = useState<SiteThemeConfig>(readStoredTheme)

  useEffect(() => {
    applyThemeVariables(config)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // Ignore persistence errors in restrictive environments.
    }
  }, [config])

  const randomize = useCallback(() => {
    setConfig(randomTheme())
  }, [])

  const reset = useCallback(() => {
    setConfig(defaultTheme)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore persistence errors in restrictive environments.
    }
  }, [])

  const exportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'golfsol-theme-config.json'
    anchor.click()
    window.URL.revokeObjectURL(url)
  }, [config])

  const value = useMemo<ThemeContextValue>(
    () => ({
      config,
      setConfig,
      randomize,
      reset,
      exportConfig,
      panelEnabled
    }),
    [config, exportConfig, randomize, reset]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {panelEnabled ? <DesignControlPanel /> : null}
    </ThemeContext.Provider>
  )
}

export function useSiteTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useSiteTheme must be used within SiteThemeProvider.')
  }
  return context
}

export { defaultTheme as defaultSiteTheme }
