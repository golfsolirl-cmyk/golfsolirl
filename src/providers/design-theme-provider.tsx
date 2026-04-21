import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type PropsWithChildren,
  type ReactNode
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Download,
  Palette,
  RefreshCcw,
  SlidersHorizontal,
  Type,
  WandSparkles,
  Waves
} from 'lucide-react'

type FontChoice = 'Rubik' | 'Open Sans' | 'Inter' | 'Manrope' | 'DM Sans' | 'Poppins'
type WaveStyle = 'classic' | 'soft' | 'crest'

interface DesignThemeConfig {
  readonly colors: {
    readonly canvas: string
    readonly section: string
    readonly surface: string
    readonly gsGreen: string
    readonly gsDark: string
    readonly gsElectric: string
    readonly gsGold: string
    readonly geOrange: string
  }
  readonly typography: {
    readonly displayFont: FontChoice
    readonly bodyFont: FontChoice
    readonly geFont: FontChoice
    readonly baseScale: number
  }
  readonly buttons: {
    readonly radius: number
    readonly paddingX: number
    readonly paddingY: number
    readonly shadowStrength: number
  }
  readonly surfaces: {
    readonly cardRadius: number
    readonly cardShadow: number
    readonly sectionSpacing: number
    readonly density: number
  }
  readonly dividers: {
    readonly waveStyle: WaveStyle
    readonly waveHeight: number
    readonly waveMotion: number
  }
}

interface DesignThemeContextValue {
  readonly config: DesignThemeConfig
  readonly designPanelEnabled: boolean
  readonly updateConfig: (updater: (current: DesignThemeConfig) => DesignThemeConfig) => void
  readonly resetConfig: () => void
  readonly randomizeConfig: () => void
  readonly exportConfig: () => void
}

const STORAGE_KEY = 'gsi-design-theme-config'
const fontChoices: readonly FontChoice[] = ['Rubik', 'Open Sans', 'Inter', 'Manrope', 'DM Sans', 'Poppins']

const defaultThemeConfig: DesignThemeConfig = {
  colors: {
    canvas: '#f4f7f5',
    section: '#edf5f0',
    surface: '#ffffff',
    gsGreen: '#0B6B45',
    gsDark: '#063B2A',
    gsElectric: '#1ED760',
    gsGold: '#FFC72C',
    geOrange: '#ff5b2d'
  },
  typography: {
    displayFont: 'Rubik',
    bodyFont: 'Rubik',
    geFont: 'Open Sans',
    baseScale: 17.2
  },
  buttons: {
    radius: 999,
    paddingX: 28,
    paddingY: 16,
    shadowStrength: 0.48
  },
  surfaces: {
    cardRadius: 28,
    cardShadow: 0.18,
    sectionSpacing: 112,
    density: 1
  },
  dividers: {
    waveStyle: 'classic',
    waveHeight: 1,
    waveMotion: 1
  }
}

const DesignThemeContext = createContext<DesignThemeContextValue | null>(null)

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeHex(input: string) {
  const value = input.trim()
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value.toLowerCase()
  }
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
  }
  return '#000000'
}

function hexToRgbTuple(hex: string) {
  const value = normalizeHex(hex).slice(1)
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  }
}

function rgbTupleToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b]
    .map((part) => clamp(Math.round(part), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

function mixHex(base: string, target: string, amount: number) {
  const start = hexToRgbTuple(base)
  const end = hexToRgbTuple(target)
  const ratio = clamp(amount, 0, 1)
  return rgbTupleToHex({
    r: start.r + (end.r - start.r) * ratio,
    g: start.g + (end.g - start.g) * ratio,
    b: start.b + (end.b - start.b) * ratio
  })
}

function lighten(hex: string, amount: number) {
  return mixHex(hex, '#ffffff', amount)
}

function darken(hex: string, amount: number) {
  return mixHex(hex, '#000000', amount)
}

function rgbVar(hex: string) {
  const { r, g, b } = hexToRgbTuple(hex)
  return `${r} ${g} ${b}`
}

function buildShadow(rgb: string, y: number, blur: number, alpha: number) {
  return `0 ${Math.round(y)}px ${Math.round(blur)}px rgba(${rgb.split(' ').join(',')}, ${alpha.toFixed(2)})`
}

function applyThemeToDocument(config: DesignThemeConfig) {
  const root = document.documentElement
  const { colors, typography, buttons, surfaces, dividers } = config

  const forest950 = darken(colors.gsDark, 0.18)
  const forest900 = darken(colors.gsGreen, 0.14)
  const forest800 = darken(colors.gsGreen, 0.08)
  const forest700 = darken(colors.gsGreen, 0.02)
  const forest600 = colors.gsGreen
  const forest500 = lighten(colors.gsGreen, 0.1)
  const forest100 = lighten(colors.gsGreen, 0.78)
  const forest50 = lighten(colors.gsGreen, 0.9)

  const fairway700 = darken(colors.gsGreen, 0.18)
  const fairway600 = darken(colors.gsGreen, 0.1)
  const fairway500 = colors.gsGreen
  const fairway400 = lighten(colors.gsGreen, 0.14)
  const fairway200 = lighten(colors.gsGreen, 0.54)
  const fairway100 = lighten(colors.gsGreen, 0.7)
  const fairway50 = lighten(colors.gsGreen, 0.84)

  const gold600 = darken(colors.gsGold, 0.2)
  const gold500 = darken(colors.gsGold, 0.08)
  const gold400 = colors.geOrange
  const gold300 = lighten(colors.gsGold, 0.24)
  const gold200 = lighten(colors.gsGold, 0.4)
  const gold50 = lighten(colors.gsGold, 0.86)

  const geInk = darken(colors.gsDark, 0.18)
  const geGray700 = mixHex(geInk, '#ffffff', 0.18)
  const geGray500 = mixHex(geInk, '#ffffff', 0.32)
  const geGray300 = mixHex(geInk, '#ffffff', 0.68)
  const geGray200 = mixHex(geInk, '#ffffff', 0.82)
  const geGray100 = mixHex(geInk, '#ffffff', 0.9)
  const geGray50 = mixHex(colors.section, '#ffffff', 0.45)
  const geTeal = colors.gsGreen
  const geTealDark = darken(colors.gsGreen, 0.2)
  const geTealLight = lighten(colors.gsGreen, 0.28)
  const geBlue = mixHex(colors.gsGreen, '#2692E0', 0.48)
  const geBlueLight = mixHex('#7EBEC5', colors.section, 0.22)

  const skyMuted = mixHex(colors.section, '#cfe6f3', 0.32)
  const skySection = mixHex(colors.section, '#bfe1f0', 0.44)
  const skyLight = mixHex(colors.section, '#dbeafe', 0.55)
  const cream = mixHex(colors.section, '#f3efe7', 0.4)
  const offwhite = mixHex(colors.canvas, '#ffffff', 0.2)

  const darkRgb = rgbVar(colors.gsDark)
  const greenRgb = rgbVar(colors.gsGreen)
  const goldRgb = rgbVar(colors.gsGold)

  const buttonShadow = buildShadow(goldRgb, 12, 32, 0.16 + buttons.shadowStrength * 0.38)
  const cardShadow = buildShadow(darkRgb, 24, 72, 0.08 + surfaces.cardShadow * 0.2)
  const softShadow = buildShadow(darkRgb, 18, 60, 0.08 + surfaces.cardShadow * 0.18)
  const greenShadow = buildShadow(greenRgb, 8, 22, 0.18 + buttons.shadowStrength * 0.28)

  const variableMap = {
    '--gsi-color-forest-950': rgbVar(forest950),
    '--gsi-color-forest-900': rgbVar(forest900),
    '--gsi-color-forest-800': rgbVar(forest800),
    '--gsi-color-forest-700': rgbVar(forest700),
    '--gsi-color-forest-600': rgbVar(forest600),
    '--gsi-color-forest-500': rgbVar(forest500),
    '--gsi-color-forest-100': rgbVar(forest100),
    '--gsi-color-forest-50': rgbVar(forest50),
    '--gsi-color-fairway-700': rgbVar(fairway700),
    '--gsi-color-fairway-600': rgbVar(fairway600),
    '--gsi-color-fairway-500': rgbVar(fairway500),
    '--gsi-color-fairway-400': rgbVar(fairway400),
    '--gsi-color-fairway-200': rgbVar(fairway200),
    '--gsi-color-fairway-100': rgbVar(fairway100),
    '--gsi-color-fairway-50': rgbVar(fairway50),
    '--gsi-color-gold-600': rgbVar(gold600),
    '--gsi-color-gold-500': rgbVar(gold500),
    '--gsi-color-gold-400': rgbVar(gold400),
    '--gsi-color-gold-300': rgbVar(gold300),
    '--gsi-color-gold-200': rgbVar(gold200),
    '--gsi-color-gold-50': rgbVar(gold50),
    '--gsi-color-sky-muted': rgbVar(skyMuted),
    '--gsi-color-sky-section': rgbVar(skySection),
    '--gsi-color-sky-light': rgbVar(skyLight),
    '--gsi-color-cream': rgbVar(cream),
    '--gsi-color-offwhite': rgbVar(offwhite),
    '--gsi-color-gs-green': rgbVar(colors.gsGreen),
    '--gsi-color-gs-dark': rgbVar(colors.gsDark),
    '--gsi-color-gs-electric': rgbVar(colors.gsElectric),
    '--gsi-color-gs-gold': rgbVar(colors.gsGold),
    '--gsi-color-gs-gold-light': rgbVar(lighten(colors.gsGold, 0.22)),
    '--gsi-color-gs-bg': rgbVar(colors.canvas),
    '--gsi-color-ge-teal': rgbVar(geTeal),
    '--gsi-color-ge-teal-dark': rgbVar(geTealDark),
    '--gsi-color-ge-teal-light': rgbVar(geTealLight),
    '--gsi-color-ge-blue': rgbVar(geBlue),
    '--gsi-color-ge-blue-light': rgbVar(geBlueLight),
    '--gsi-color-ge-orange': rgbVar(colors.geOrange),
    '--gsi-color-ge-orange-hover': rgbVar(darken(colors.geOrange, 0.08)),
    '--gsi-color-ge-purple': '97 17 93',
    '--gsi-color-ge-ink': rgbVar(geInk),
    '--gsi-color-ge-gray700': rgbVar(geGray700),
    '--gsi-color-ge-gray500': rgbVar(geGray500),
    '--gsi-color-ge-gray300': rgbVar(geGray300),
    '--gsi-color-ge-gray200': rgbVar(geGray200),
    '--gsi-color-ge-gray100': rgbVar(geGray100),
    '--gsi-color-ge-gray50': rgbVar(geGray50),
    '--gsi-font-display': typography.displayFont,
    '--gsi-font-body': typography.bodyFont,
    '--gsi-font-ge': typography.geFont,
    '--gsi-root-font-size': `${typography.baseScale}px`,
    '--gsi-button-radius': `${buttons.radius}px`,
    '--gsi-button-padding-x': `${buttons.paddingX}px`,
    '--gsi-button-padding-y': `${buttons.paddingY}px`,
    '--gsi-card-radius': `${surfaces.cardRadius}px`,
    '--gsi-section-spacing': `${surfaces.sectionSpacing}px`,
    '--gsi-density-scale': String(surfaces.density),
    '--gsi-wave-height-scale': String(dividers.waveHeight),
    '--gsi-wave-motion-scale': String(dividers.waveMotion),
    '--gsi-shadow-glow': buttonShadow,
    '--gsi-shadow-soft': softShadow,
    '--gsi-shadow-gs-gold': buttonShadow,
    '--gsi-shadow-gs-gold-hover': buildShadow(goldRgb, 14, 36, 0.24 + buttons.shadowStrength * 0.42),
    '--gsi-shadow-gs-green': greenShadow,
    '--gsi-shadow-card': cardShadow
  } as const

  Object.entries(variableMap).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  root.dataset.gsiWaveStyle = dividers.waveStyle
}

function readStoredConfig() {
  if (typeof window === 'undefined') {
    return defaultThemeConfig
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultThemeConfig
    }
    const parsed = JSON.parse(raw) as DesignThemeConfig
    return {
      ...defaultThemeConfig,
      ...parsed,
      colors: { ...defaultThemeConfig.colors, ...parsed.colors },
      typography: { ...defaultThemeConfig.typography, ...parsed.typography },
      buttons: { ...defaultThemeConfig.buttons, ...parsed.buttons },
      surfaces: { ...defaultThemeConfig.surfaces, ...parsed.surfaces },
      dividers: { ...defaultThemeConfig.dividers, ...parsed.dividers }
    }
  } catch {
    return defaultThemeConfig
  }
}

function randomFromRange(min: number, max: number, precision = 0) {
  const value = min + Math.random() * (max - min)
  return precision === 0 ? Math.round(value) : Number(value.toFixed(precision))
}

function randomChoice<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function buildRandomConfig(current: DesignThemeConfig): DesignThemeConfig {
  const gsGreen = randomChoice(['#0B6B45', '#156f53', '#1d7a5f', '#0d6e5b'])
  const gsDark = randomChoice(['#063B2A', '#092f29', '#102f35', '#102a28'])
  const gsGold = randomChoice(['#FFC72C', '#f7c948', '#ffb703', '#f6c453'])
  const geOrange = randomChoice(['#ff5b2d', '#f97316', '#f15a24', '#ff6b35'])

  return {
    colors: {
      canvas: randomChoice(['#f4f7f5', '#f6f7f2', '#f2f6f4', '#f7f6f1']),
      section: randomChoice(['#edf5f0', '#eef3f1', '#f0f4ef', '#edf2f3']),
      surface: '#ffffff',
      gsGreen,
      gsDark,
      gsElectric: randomChoice(['#1ED760', lighten(gsGreen, 0.28), '#3fe08a', '#4ade80']),
      gsGold,
      geOrange
    },
    typography: {
      displayFont: randomChoice(fontChoices),
      bodyFont: randomChoice(fontChoices),
      geFont: randomChoice(fontChoices),
      baseScale: randomFromRange(16.4, 18.4, 1)
    },
    buttons: {
      radius: randomChoice([18, 22, 28, 32, 999]),
      paddingX: randomFromRange(22, 34),
      paddingY: randomFromRange(13, 18),
      shadowStrength: randomFromRange(0.22, 0.72, 2)
    },
    surfaces: {
      cardRadius: randomFromRange(20, 34),
      cardShadow: randomFromRange(0.12, 0.34, 2),
      sectionSpacing: randomFromRange(88, 136),
      density: randomFromRange(0.9, 1.08, 2)
    },
    dividers: {
      waveStyle: randomChoice(['classic', 'soft', 'crest'] as const),
      waveHeight: randomFromRange(0.8, 1.26, 2),
      waveMotion: randomFromRange(0.65, 1.2, 2)
    }
  }
}

function PanelSection({
  title,
  icon,
  children,
  defaultOpen = true
}: {
  readonly title: string
  readonly icon: ReactNode
  readonly children: ReactNode
  readonly defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-black/5 bg-white/80">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-gs-dark">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gs-dark text-gs-gold">{icon}</span>
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gs-dark transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function DesignPanel({ context }: { readonly context: DesignThemeContextValue }) {
  const { config, updateConfig, resetConfig, randomizeConfig, exportConfig } = context
  const [open, setOpen] = useState(false)

  const updateColor =
    (key: keyof DesignThemeConfig['colors']) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateConfig((current) => ({
        ...current,
        colors: {
          ...current.colors,
          [key]: event.target.value
        }
      }))
    }

  const updateTypography =
    <K extends keyof DesignThemeConfig['typography']>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        key === 'baseScale' ? Number(event.target.value) : (event.target.value as DesignThemeConfig['typography'][K])
      updateConfig((current) => ({
        ...current,
        typography: {
          ...current.typography,
          [key]: value
        }
      }))
    }

  const updateButtons =
    <K extends keyof DesignThemeConfig['buttons']>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateConfig((current) => ({
        ...current,
        buttons: {
          ...current.buttons,
          [key]: Number(event.target.value)
        }
      }))
    }

  const updateSurfaces =
    <K extends keyof DesignThemeConfig['surfaces']>(key: K) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateConfig((current) => ({
        ...current,
        surfaces: {
          ...current.surfaces,
          [key]: Number(event.target.value)
        }
      }))
    }

  const updateDividers =
    <K extends keyof DesignThemeConfig['dividers']>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateConfig((current) => ({
        ...current,
        dividers: {
          ...current.dividers,
          [key]: key === 'waveStyle' ? (event.target.value as WaveStyle) : Number(event.target.value)
        }
      }))
    }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] hidden max-w-[360px] md:block">
      <div className="pointer-events-auto">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.aside
              key="panel"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mb-3 max-h-[78vh] overflow-auto rounded-[2rem] border border-white/40 bg-white/92 p-4 shadow-[0_24px_90px_rgba(6,59,42,0.28)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ge-orange">Dev only</p>
                  <h2 className="mt-2 text-lg font-extrabold text-gs-dark">Global design control panel</h2>
                  <p className="mt-1 text-sm leading-6 text-ge-gray500">Live theme tokens update instantly and persist locally.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gs-dark"
                >
                  Close
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={randomizeConfig}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gs-dark px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
                >
                  <WandSparkles className="h-4 w-4" />
                  Randomize
                </button>
                <button
                  type="button"
                  onClick={resetConfig}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gs-dark"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={exportConfig}
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ffc72c_0%,#ffe27a_100%)] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gs-dark"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </button>
              </div>

              <div className="space-y-3">
                <PanelSection title="Colors" icon={<Palette className="h-4 w-4" />}>
                  <ColorField label="Canvas" value={config.colors.canvas} onChange={updateColor('canvas')} />
                  <ColorField label="Section" value={config.colors.section} onChange={updateColor('section')} />
                  <ColorField label="Surface" value={config.colors.surface} onChange={updateColor('surface')} />
                  <ColorField label="Primary green" value={config.colors.gsGreen} onChange={updateColor('gsGreen')} />
                  <ColorField label="Dark green" value={config.colors.gsDark} onChange={updateColor('gsDark')} />
                  <ColorField label="Electric accent" value={config.colors.gsElectric} onChange={updateColor('gsElectric')} />
                  <ColorField label="Gold accent" value={config.colors.gsGold} onChange={updateColor('gsGold')} />
                  <ColorField label="Orange accent" value={config.colors.geOrange} onChange={updateColor('geOrange')} />
                </PanelSection>

                <PanelSection title="Typography" icon={<Type className="h-4 w-4" />}>
                  <SelectField label="Display font" value={config.typography.displayFont} onChange={updateTypography('displayFont')} options={fontChoices} />
                  <SelectField label="Body font" value={config.typography.bodyFont} onChange={updateTypography('bodyFont')} options={fontChoices} />
                  <SelectField label="Editorial font" value={config.typography.geFont} onChange={updateTypography('geFont')} options={fontChoices} />
                  <RangeField
                    label="Base scale"
                    value={config.typography.baseScale}
                    min={16}
                    max={18.6}
                    step={0.1}
                    onChange={updateTypography('baseScale')}
                  />
                </PanelSection>

                <PanelSection title="Buttons" icon={<SlidersHorizontal className="h-4 w-4" />}>
                  <RangeField label="Radius" value={config.buttons.radius} min={16} max={999} step={1} onChange={updateButtons('radius')} />
                  <RangeField label="Padding X" value={config.buttons.paddingX} min={18} max={36} step={1} onChange={updateButtons('paddingX')} />
                  <RangeField label="Padding Y" value={config.buttons.paddingY} min={12} max={20} step={1} onChange={updateButtons('paddingY')} />
                  <RangeField
                    label="Shadow strength"
                    value={config.buttons.shadowStrength}
                    min={0.1}
                    max={0.9}
                    step={0.01}
                    onChange={updateButtons('shadowStrength')}
                  />
                </PanelSection>

                <PanelSection title="Surfaces" icon={<Palette className="h-4 w-4" />}>
                  <RangeField label="Card radius" value={config.surfaces.cardRadius} min={18} max={40} step={1} onChange={updateSurfaces('cardRadius')} />
                  <RangeField label="Card shadow" value={config.surfaces.cardShadow} min={0.08} max={0.38} step={0.01} onChange={updateSurfaces('cardShadow')} />
                  <RangeField
                    label="Section spacing"
                    value={config.surfaces.sectionSpacing}
                    min={76}
                    max={144}
                    step={1}
                    onChange={updateSurfaces('sectionSpacing')}
                  />
                  <RangeField label="Visual density" value={config.surfaces.density} min={0.88} max={1.1} step={0.01} onChange={updateSurfaces('density')} />
                </PanelSection>

                <PanelSection title="Dividers" icon={<Waves className="h-4 w-4" />}>
                  <SelectField
                    label="Wave style"
                    value={config.dividers.waveStyle}
                    onChange={updateDividers('waveStyle')}
                    options={['classic', 'soft', 'crest']}
                  />
                  <RangeField label="Wave height" value={config.dividers.waveHeight} min={0.7} max={1.35} step={0.01} onChange={updateDividers('waveHeight')} />
                  <RangeField label="Wave motion" value={config.dividers.waveMotion} min={0} max={1.2} step={0.01} onChange={updateDividers('waveMotion')} />
                </PanelSection>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/40 bg-gs-dark px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_rgba(6,59,42,0.28)]"
        >
          <Palette className="h-4 w-4 text-gs-gold" />
          Design panel
        </button>
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ge-gray500">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-3 py-2.5">
        <input type="color" value={value} onChange={onChange} className="h-9 w-10 rounded-md border-0 bg-transparent p-0" />
        <input value={value} onChange={onChange} className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-gs-dark outline-none" />
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
  onChange
}: {
  readonly label: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step: number
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ge-gray500">
        <span>{label}</span>
        <span className="text-gs-dark">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
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
  readonly onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ge-gray500">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-2xl border border-black/5 bg-white px-3 py-3 text-sm font-medium text-gs-dark outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function DesignThemeProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<DesignThemeConfig>(() => readStoredConfig())

  const designPanelEnabled =
    import.meta.env.DEV && String(import.meta.env.VITE_ENABLE_DESIGN_PANEL ?? 'true').toLowerCase() !== 'false'

  useEffect(() => {
    applyThemeToDocument(config)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      /* ignore storage failures */
    }
  }, [config])

  const updateConfig = useCallback((updater: (current: DesignThemeConfig) => DesignThemeConfig) => {
    setConfig((current) => updater(current))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(defaultThemeConfig)
  }, [])

  const randomizeConfig = useCallback(() => {
    setConfig((current) => buildRandomConfig(current))
  }, [])

  const exportConfig = useCallback(() => {
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'golfsol-design-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [config])

  const value = useMemo<DesignThemeContextValue>(
    () => ({
      config,
      designPanelEnabled,
      updateConfig,
      resetConfig,
      randomizeConfig,
      exportConfig
    }),
    [config, designPanelEnabled, exportConfig, randomizeConfig, resetConfig, updateConfig]
  )

  return (
    <DesignThemeContext.Provider value={value}>
      {children}
      {designPanelEnabled ? <DesignPanel context={value} /> : null}
    </DesignThemeContext.Provider>
  )
}

export function useDesignTheme() {
  const context = useContext(DesignThemeContext)
  if (!context) {
    throw new Error('useDesignTheme must be used within DesignThemeProvider')
  }
  return context
}
