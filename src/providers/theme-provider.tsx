import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type FontFamilyOption = 'Manrope' | 'Inter' | 'Sora' | 'Rubik'

type ThemePalette = {
  forest: {
    950: string
    900: string
    800: string
    700: string
    600: string
    500: string
    100: string
    50: string
  }
  fairway: {
    700: string
    600: string
    500: string
    400: string
    200: string
    100: string
    50: string
  }
  gold: {
    600: string
    500: string
    400: string
    300: string
    50: string
  }
  sky: {
    muted: string
    section: string
    light: string
  }
  neutral: {
    cream: string
    offwhite: string
  }
  heroOverlay: {
    start: string
    mid: string
    end: string
    bottomStart: string
    bottomEnd: string
  }
}

type SectionThemeKey =
  | 'home'
  | 'transfer-showcase'
  | 'trust'
  | 'packages'
  | 'costa'
  | 'momentum'
  | 'courses'
  | 'hotels'
  | 'transfers'
  | 'plan'
  | 'testimonials'
  | 'contact'

type DesignThemeConfig = {
  palette: ThemePalette
  sections: Record<SectionThemeKey, string>
  typography: {
    fontFamilyDisplay: FontFamilyOption
    fontFamilyBody: FontFamilyOption
    scale: number
    headingWeight: number
    bodyWeight: number
  }
  buttons: {
    radius: number
    paddingX: number
    paddingY: number
    shadowOpacity: number
  }
  density: {
    sectionSpacing: number
    cardRadius: number
    surfaceShadowOpacity: number
  }
  dividers: {
    amplitude: number
    curve: number
    drift: number
    fillPrimary: string
    fillSecondary: string
    fillDark: string
  }
}

type ThemeContextValue = {
  theme: DesignThemeConfig
  updateTheme: (updater: (current: DesignThemeConfig) => DesignThemeConfig) => void
  randomizeTheme: () => void
  resetTheme: () => void
  exportThemeJson: () => string
}

const defaultTheme: DesignThemeConfig = {
  palette: {
    forest: {
      950: '#050b1a',
      900: '#0d1d38',
      800: '#13284a',
      700: '#193762',
      600: '#215080',
      500: '#2d6ca6',
      100: '#dce8fa',
      50: '#f1f6ff'
    },
    fairway: {
      700: '#1f4f82',
      600: '#2a679f',
      500: '#3181bc',
      400: '#4a9ad4',
      200: '#bfdcf7',
      100: '#dff0ff',
      50: '#f3f9ff'
    },
    gold: {
      600: '#d45b38',
      500: '#ed7850',
      400: '#ff8f5b',
      300: '#ffc7a6',
      50: '#fff4ed'
    },
    sky: {
      muted: '#eaf1ff',
      section: '#dcebff',
      light: '#edf5ff'
    },
    neutral: {
      cream: '#f3f7ff',
      offwhite: '#f8fbff'
    },
    heroOverlay: {
      start: '#050b1a',
      mid: '#0d1d38',
      end: '#163461',
      bottomStart: '#0d1d38',
      bottomEnd: '#050b1a'
    }
  },
  sections: {
    home: 'linear-gradient(130deg, #0d1d38 0%, #13284a 46%, #1b3b69 100%)',
    'transfer-showcase': 'linear-gradient(145deg, #f8fbff 0%, #edf5ff 62%, #fff4ed 100%)',
    trust: 'linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)',
    packages: 'linear-gradient(180deg, #f8fbff 0%, #f0f6ff 100%)',
    costa: 'linear-gradient(180deg, #f2f7ff 0%, #e8f1ff 100%)',
    momentum: 'linear-gradient(180deg, #dcebff 0%, #e6f1ff 100%)',
    courses: 'linear-gradient(180deg, #edf5ff 0%, #f6faff 100%)',
    hotels: 'linear-gradient(180deg, #f4f8ff 0%, #fdf2ec 100%)',
    transfers: 'linear-gradient(145deg, #0d1d38 0%, #13284a 45%, #193762 100%)',
    plan: '#ffffff',
    testimonials: '#f8fbff',
    contact: 'linear-gradient(150deg, #0d1d38 0%, #13284a 55%, #193762 100%)'
  },
  typography: {
    fontFamilyDisplay: 'Sora',
    fontFamilyBody: 'Manrope',
    scale: 1,
    headingWeight: 780,
    bodyWeight: 500
  },
  buttons: {
    radius: 999,
    paddingX: 1.75,
    paddingY: 0.95,
    shadowOpacity: 0.24
  },
  density: {
    sectionSpacing: 1,
    cardRadius: 1,
    surfaceShadowOpacity: 0.15
  },
  dividers: {
    amplitude: 42,
    curve: 56,
    drift: 12,
    fillPrimary: '#ffffff',
    fillSecondary: '#edf5ff',
    fillDark: '#0d1d38'
  }
}

const storageKey = 'gsol-design-theme-v2'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const randomPalettes: readonly ThemePalette[] = [
  defaultTheme.palette,
  {
    forest: {
      950: '#121021',
      900: '#1f1a37',
      800: '#2b2350',
      700: '#3c2f6f',
      600: '#56459a',
      500: '#6e5fc1',
      100: '#e8e2ff',
      50: '#f6f4ff'
    },
    fairway: {
      700: '#2c3f93',
      600: '#3a52b4',
      500: '#4d66d8',
      400: '#667ef2',
      200: '#cad6ff',
      100: '#e5ecff',
      50: '#f5f8ff'
    },
    gold: {
      600: '#c15a75',
      500: '#d86f8c',
      400: '#f887a6',
      300: '#ffc2d3',
      50: '#fff2f7'
    },
    sky: {
      muted: '#f1eeff',
      section: '#e7e1ff',
      light: '#f5f2ff'
    },
    neutral: {
      cream: '#f8f5ff',
      offwhite: '#fcfaff'
    },
    heroOverlay: {
      start: '#121021',
      mid: '#1f1a37',
      end: '#3c2f6f',
      bottomStart: '#1f1a37',
      bottomEnd: '#121021'
    }
  },
  {
    forest: {
      950: '#102227',
      900: '#17333a',
      800: '#1d444d',
      700: '#285b65',
      600: '#357882',
      500: '#4497a2',
      100: '#d8edf1',
      50: '#eef7f9'
    },
    fairway: {
      700: '#1f6670',
      600: '#2b7f89',
      500: '#399ba6',
      400: '#4eb6c2',
      200: '#bde7ed',
      100: '#ddf4f7',
      50: '#f0fbfc'
    },
    gold: {
      600: '#d1692f',
      500: '#eb7f3f',
      400: '#ff9854',
      300: '#ffcfad',
      50: '#fff5ec'
    },
    sky: {
      muted: '#e8f8fb',
      section: '#d9f0f6',
      light: '#ecf9fc'
    },
    neutral: {
      cream: '#f3fbfc',
      offwhite: '#f8fcfd'
    },
    heroOverlay: {
      start: '#102227',
      mid: '#17333a',
      end: '#285b65',
      bottomStart: '#17333a',
      bottomEnd: '#102227'
    }
  }
]

const sectionKeys: readonly SectionThemeKey[] = [
  'home',
  'transfer-showcase',
  'trust',
  'packages',
  'costa',
  'momentum',
  'courses',
  'hotels',
  'transfers',
  'plan',
  'testimonials',
  'contact'
]

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const hexToRgbChannels = (hex: string): string => {
  const normalized = hex.trim().replace('#', '')
  const validHex = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized

  if (!/^[0-9a-fA-F]{6}$/.test(validHex)) {
    return '0 0 0'
  }

  const numeric = Number.parseInt(validHex, 16)
  const r = (numeric >> 16) & 255
  const g = (numeric >> 8) & 255
  const b = numeric & 255

  return `${r} ${g} ${b}`
}

const applyThemeToDocument = (theme: DesignThemeConfig) => {
  const root = document.documentElement
  const { palette, typography, buttons, density, dividers } = theme

  root.style.setProperty('--color-forest-950', hexToRgbChannels(palette.forest[950]))
  root.style.setProperty('--color-forest-900', hexToRgbChannels(palette.forest[900]))
  root.style.setProperty('--color-forest-800', hexToRgbChannels(palette.forest[800]))
  root.style.setProperty('--color-forest-700', hexToRgbChannels(palette.forest[700]))
  root.style.setProperty('--color-forest-600', hexToRgbChannels(palette.forest[600]))
  root.style.setProperty('--color-forest-500', hexToRgbChannels(palette.forest[500]))
  root.style.setProperty('--color-forest-100', hexToRgbChannels(palette.forest[100]))
  root.style.setProperty('--color-forest-50', hexToRgbChannels(palette.forest[50]))

  root.style.setProperty('--color-fairway-700', hexToRgbChannels(palette.fairway[700]))
  root.style.setProperty('--color-fairway-600', hexToRgbChannels(palette.fairway[600]))
  root.style.setProperty('--color-fairway-500', hexToRgbChannels(palette.fairway[500]))
  root.style.setProperty('--color-fairway-400', hexToRgbChannels(palette.fairway[400]))
  root.style.setProperty('--color-fairway-200', hexToRgbChannels(palette.fairway[200]))
  root.style.setProperty('--color-fairway-100', hexToRgbChannels(palette.fairway[100]))
  root.style.setProperty('--color-fairway-50', hexToRgbChannels(palette.fairway[50]))

  root.style.setProperty('--color-gold-600', hexToRgbChannels(palette.gold[600]))
  root.style.setProperty('--color-gold-500', hexToRgbChannels(palette.gold[500]))
  root.style.setProperty('--color-gold-400', hexToRgbChannels(palette.gold[400]))
  root.style.setProperty('--color-gold-300', hexToRgbChannels(palette.gold[300]))
  root.style.setProperty('--color-gold-50', hexToRgbChannels(palette.gold[50]))

  root.style.setProperty('--color-sky-muted', hexToRgbChannels(palette.sky.muted))
  root.style.setProperty('--color-sky-section', hexToRgbChannels(palette.sky.section))
  root.style.setProperty('--color-sky-light', hexToRgbChannels(palette.sky.light))
  root.style.setProperty('--color-cream', hexToRgbChannels(palette.neutral.cream))
  root.style.setProperty('--color-offwhite', hexToRgbChannels(palette.neutral.offwhite))

  root.style.setProperty('--hero-overlay-start', hexToRgbChannels(palette.heroOverlay.start))
  root.style.setProperty('--hero-overlay-mid', hexToRgbChannels(palette.heroOverlay.mid))
  root.style.setProperty('--hero-overlay-end', hexToRgbChannels(palette.heroOverlay.end))
  root.style.setProperty('--hero-bottom-start', hexToRgbChannels(palette.heroOverlay.bottomStart))
  root.style.setProperty('--hero-bottom-end', hexToRgbChannels(palette.heroOverlay.bottomEnd))

  root.style.setProperty('--font-family-display', typography.fontFamilyDisplay)
  root.style.setProperty('--font-family-body', typography.fontFamilyBody)
  root.style.setProperty('--type-scale', typography.scale.toFixed(2))
  root.style.setProperty('--heading-weight', String(typography.headingWeight))
  root.style.setProperty('--body-weight', String(typography.bodyWeight))

  root.style.setProperty('--button-radius', `${buttons.radius}px`)
  root.style.setProperty('--button-padding-x', `${buttons.paddingX}rem`)
  root.style.setProperty('--button-padding-y', `${buttons.paddingY}rem`)
  root.style.setProperty('--button-shadow', `0 20px 48px rgba(5, 11, 26, ${buttons.shadowOpacity.toFixed(2)})`)

  root.style.setProperty('--section-spacing-multiplier', density.sectionSpacing.toFixed(2))
  root.style.setProperty('--surface-radius', `${(28 * density.cardRadius).toFixed(0)}px`)
  root.style.setProperty(
    '--surface-shadow',
    `0 20px 52px rgba(5, 11, 26, ${density.surfaceShadowOpacity.toFixed(2)})`
  )

  root.style.setProperty('--wave-amplitude', String(Math.round(dividers.amplitude)))
  root.style.setProperty('--wave-curve', String(Math.round(dividers.curve)))
  root.style.setProperty('--wave-drift', String(Math.round(dividers.drift)))
  root.style.setProperty('--wave-fill-primary', dividers.fillPrimary)
  root.style.setProperty('--wave-fill-secondary', dividers.fillSecondary)
  root.style.setProperty('--wave-fill-dark', dividers.fillDark)

  sectionKeys.forEach((sectionKey) => {
    root.style.setProperty(`--section-${sectionKey}-bg`, theme.sections[sectionKey])
  })
}

const parseStoredTheme = (rawValue: string | null): DesignThemeConfig | null => {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as DesignThemeConfig
    return parsed
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<DesignThemeConfig>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme
    }

    return parseStoredTheme(window.localStorage.getItem(storageKey)) ?? defaultTheme
  })

  useEffect(() => {
    applyThemeToDocument(theme)
    window.localStorage.setItem(storageKey, JSON.stringify(theme))
  }, [theme])

  const updateTheme = useCallback((updater: (current: DesignThemeConfig) => DesignThemeConfig) => {
    setTheme((currentTheme) => updater(currentTheme))
  }, [])

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme)
  }, [])

  const randomizeTheme = useCallback(() => {
    const palette = randomPalettes[Math.floor(Math.random() * randomPalettes.length)] ?? defaultTheme.palette

    setTheme((currentTheme) => {
      const randomizedTypographyScale = clampNumber(0.96 + Math.random() * 0.16, 0.9, 1.2)
      const randomizedHeadingWeight = Math.round(clampNumber(680 + Math.random() * 220, 640, 900))
      const randomizedButtonRadius = Math.round(clampNumber(18 + Math.random() * 40, 16, 999))
      const randomizedWaveAmplitude = Math.round(clampNumber(22 + Math.random() * 40, 18, 80))
      const randomizedWaveCurve = Math.round(clampNumber(35 + Math.random() * 45, 25, 90))
      const randomizedSectionSpacing = clampNumber(0.94 + Math.random() * 0.26, 0.8, 1.3)

      const withPalette = {
        ...currentTheme,
        palette
      }

      const withRandomizedSections: Record<SectionThemeKey, string> = {
        ...withPalette.sections,
        home: `linear-gradient(130deg, ${palette.forest[900]} 0%, ${palette.forest[800]} 50%, ${palette.forest[700]} 100%)`,
        'transfer-showcase': `linear-gradient(145deg, ${palette.neutral.offwhite} 0%, ${palette.sky.light} 60%, ${palette.gold[50]} 100%)`,
        transfers: `linear-gradient(145deg, ${palette.forest[900]} 0%, ${palette.forest[800]} 45%, ${palette.forest[700]} 100%)`,
        contact: `linear-gradient(145deg, ${palette.forest[900]} 0%, ${palette.forest[800]} 45%, ${palette.forest[700]} 100%)`
      }

      return {
        ...withPalette,
        sections: withRandomizedSections,
        typography: {
          ...withPalette.typography,
          scale: randomizedTypographyScale,
          headingWeight: randomizedHeadingWeight
        },
        buttons: {
          ...withPalette.buttons,
          radius: randomizedButtonRadius,
          shadowOpacity: clampNumber(0.16 + Math.random() * 0.18, 0.1, 0.4)
        },
        density: {
          ...withPalette.density,
          sectionSpacing: randomizedSectionSpacing,
          cardRadius: clampNumber(0.84 + Math.random() * 0.32, 0.75, 1.25)
        },
        dividers: {
          ...withPalette.dividers,
          amplitude: randomizedWaveAmplitude,
          curve: randomizedWaveCurve,
          drift: Math.round(clampNumber(8 + Math.random() * 14, 4, 24)),
          fillPrimary: palette.neutral.offwhite,
          fillSecondary: palette.sky.light,
          fillDark: palette.forest[900]
        }
      }
    })
  }, [])

  const exportThemeJson = useCallback(() => JSON.stringify(theme, null, 2), [theme])

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      updateTheme,
      randomizeTheme,
      resetTheme,
      exportThemeJson
    }),
    [exportThemeJson, randomizeTheme, resetTheme, theme, updateTheme]
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
