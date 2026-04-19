export const DESIGN_THEME_STORAGE_KEY = 'gsol-design-theme-v1'

export type WaveVariant = 'classic' | 'crest' | 'calm'

export type SectionThemeKey =
  | 'home'
  | 'packages'
  | 'costa'
  | 'courses'
  | 'hotels'
  | 'transfers'
  | 'plan'
  | 'testimonials'
  | 'footer'

export interface DesignThemeConfig {
  readonly palette: {
    readonly appBg: string
    readonly surface: string
    readonly textPrimary: string
    readonly textMuted: string
    readonly accent: string
    readonly accentStrong: string
  }
  readonly sections: Record<SectionThemeKey, string>
  readonly typography: {
    readonly displayFamily: string
    readonly bodyFamily: string
    readonly scale: number
    readonly displayWeight: number
    readonly bodyWeight: number
  }
  readonly buttons: {
    readonly radiusPx: number
    readonly paddingXRem: number
    readonly paddingYRem: number
    readonly shadowStrength: number
  }
  readonly density: {
    readonly sectionScale: number
    readonly cardBlurPx: number
  }
  readonly wave: {
    readonly variant: WaveVariant
    readonly heightPx: number
    readonly driftSeconds: number
  }
}

export const defaultDesignTheme: DesignThemeConfig = {
  palette: {
    appBg: '#f7f9f5',
    surface: '#ffffff',
    textPrimary: '#163a13',
    textMuted: '#355a31',
    accent: '#fdba74',
    accentStrong: '#dc5801'
  },
  sections: {
    home: '#163a13',
    packages: '#f7f9f5',
    costa: '#f2f5ef',
    courses: '#e8f4fb',
    hotels: '#f0f7ee',
    transfers: '#163a13',
    plan: '#ffffff',
    testimonials: '#ffffff',
    footer: '#0a2008'
  },
  typography: {
    displayFamily: '"Rubik", system-ui, sans-serif',
    bodyFamily: '"Rubik", system-ui, sans-serif',
    scale: 1,
    displayWeight: 800,
    bodyWeight: 400
  },
  buttons: {
    radiusPx: 999,
    paddingXRem: 1.75,
    paddingYRem: 1,
    shadowStrength: 0.26
  },
  density: {
    sectionScale: 1,
    cardBlurPx: 18
  },
  wave: {
    variant: 'classic',
    heightPx: 72,
    driftSeconds: 12
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const palettePool = ['#163a13', '#0f2e13', '#1f571a', '#14532d', '#312e81', '#0f172a']
const surfacePool = ['#ffffff', '#f8fafc', '#f8faf5', '#f5f7fb', '#fffaf4']
const accentPool = ['#fdba74', '#f59e0b', '#f97316', '#22c55e', '#38bdf8', '#a78bfa']
const sectionPool = ['#ffffff', '#f7f9f5', '#f2f5ef', '#e8f4fb', '#edf7ff', '#eef8ee', '#f6f5ff']
const waveVariants: readonly WaveVariant[] = ['classic', 'crest', 'calm']

export function randomizeDesignTheme(base: DesignThemeConfig): DesignThemeConfig {
  const pick = <T>(values: readonly T[]) => values[Math.floor(Math.random() * values.length)]
  const sectionColor = () => pick(sectionPool)

  return {
    ...base,
    palette: {
      ...base.palette,
      textPrimary: pick(palettePool),
      textMuted: pick(palettePool),
      surface: pick(surfacePool),
      accent: pick(accentPool),
      accentStrong: pick(accentPool)
    },
    sections: {
      home: sectionColor(),
      packages: sectionColor(),
      costa: sectionColor(),
      courses: sectionColor(),
      hotels: sectionColor(),
      transfers: sectionColor(),
      plan: sectionColor(),
      testimonials: sectionColor(),
      footer: pick(palettePool)
    },
    typography: {
      ...base.typography,
      scale: Number((0.94 + Math.random() * 0.2).toFixed(2)),
      displayWeight: Math.round(clamp(680 + Math.random() * 260, 650, 900)),
      bodyWeight: Math.round(clamp(360 + Math.random() * 180, 350, 550))
    },
    buttons: {
      radiusPx: Math.round(clamp(18 + Math.random() * 980, 16, 999)),
      paddingXRem: Number(clamp(1.2 + Math.random() * 1.8, 1.2, 3).toFixed(2)),
      paddingYRem: Number(clamp(0.75 + Math.random() * 0.65, 0.72, 1.4).toFixed(2)),
      shadowStrength: Number(clamp(0.1 + Math.random() * 0.38, 0.1, 0.48).toFixed(2))
    },
    density: {
      sectionScale: Number(clamp(0.86 + Math.random() * 0.34, 0.82, 1.24).toFixed(2)),
      cardBlurPx: Math.round(clamp(10 + Math.random() * 26, 8, 40))
    },
    wave: {
      variant: pick(waveVariants),
      heightPx: Math.round(clamp(58 + Math.random() * 36, 56, 96)),
      driftSeconds: Number(clamp(8 + Math.random() * 9, 8, 18).toFixed(1))
    }
  }
}

export function applyThemeToDocument(theme: DesignThemeConfig) {
  const root = document.documentElement

  root.style.setProperty('--gsol-app-bg', theme.palette.appBg)
  root.style.setProperty('--gsol-surface-bg', theme.palette.surface)
  root.style.setProperty('--gsol-text-primary', theme.palette.textPrimary)
  root.style.setProperty('--gsol-text-muted', theme.palette.textMuted)
  root.style.setProperty('--gsol-accent', theme.palette.accent)
  root.style.setProperty('--gsol-accent-strong', theme.palette.accentStrong)

  root.style.setProperty('--gsol-section-home-bg', theme.sections.home)
  root.style.setProperty('--gsol-section-packages-bg', theme.sections.packages)
  root.style.setProperty('--gsol-section-costa-bg', theme.sections.costa)
  root.style.setProperty('--gsol-section-courses-bg', theme.sections.courses)
  root.style.setProperty('--gsol-section-hotels-bg', theme.sections.hotels)
  root.style.setProperty('--gsol-section-transfers-bg', theme.sections.transfers)
  root.style.setProperty('--gsol-section-plan-bg', theme.sections.plan)
  root.style.setProperty('--gsol-section-testimonials-bg', theme.sections.testimonials)
  root.style.setProperty('--gsol-section-footer-bg', theme.sections.footer)

  root.style.setProperty('--gsol-font-display', theme.typography.displayFamily)
  root.style.setProperty('--gsol-font-body', theme.typography.bodyFamily)
  root.style.setProperty('--gsol-font-scale', String(theme.typography.scale))
  root.style.setProperty('--gsol-font-display-weight', String(theme.typography.displayWeight))
  root.style.setProperty('--gsol-font-body-weight', String(theme.typography.bodyWeight))

  root.style.setProperty('--gsol-button-radius', `${theme.buttons.radiusPx}px`)
  root.style.setProperty('--gsol-button-px', `${theme.buttons.paddingXRem}rem`)
  root.style.setProperty('--gsol-button-py', `${theme.buttons.paddingYRem}rem`)
  root.style.setProperty(
    '--gsol-button-shadow',
    `0 16px 42px color-mix(in oklab, ${theme.palette.accentStrong} ${Math.round(theme.buttons.shadowStrength * 100)}%, transparent)`
  )

  root.style.setProperty('--gsol-density-scale', String(theme.density.sectionScale))
  root.style.setProperty('--gsol-card-blur', `${theme.density.cardBlurPx}px`)

  root.style.setProperty('--gsol-wave-height', `${theme.wave.heightPx}px`)
  root.style.setProperty('--gsol-wave-drift', `${theme.wave.driftSeconds}s`)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mergeTheme(candidate: unknown): DesignThemeConfig {
  if (!isObject(candidate)) {
    return defaultDesignTheme
  }

  const next = candidate as Partial<DesignThemeConfig>

  return {
    palette: {
      ...defaultDesignTheme.palette,
      ...(isObject(next.palette) ? next.palette : {})
    },
    sections: {
      ...defaultDesignTheme.sections,
      ...(isObject(next.sections) ? next.sections : {})
    },
    typography: {
      ...defaultDesignTheme.typography,
      ...(isObject(next.typography) ? next.typography : {})
    },
    buttons: {
      ...defaultDesignTheme.buttons,
      ...(isObject(next.buttons) ? next.buttons : {})
    },
    density: {
      ...defaultDesignTheme.density,
      ...(isObject(next.density) ? next.density : {})
    },
    wave: {
      ...defaultDesignTheme.wave,
      ...(isObject(next.wave) ? next.wave : {})
    }
  }
}
