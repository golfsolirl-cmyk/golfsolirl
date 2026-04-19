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
      950: '#26120e',
      900: '#3a1d16',
      800: '#5a2e20',
      700: '#7a3f26',
      600: '#a04f2c',
      500: '#c86434',
      100: '#eadccf',
      50: '#f8efe7'
    },
    fairway: {
      700: '#3b341f',
      600: '#544a2a',
      500: '#6d5d35',
      400: '#917944',
      200: '#d8c79a',
      100: '#ede2c5',
      50: '#f8f2df'
    },
    gold: {
      600: '#be3f2c',
      500: '#d94a32',
      400: '#ef5b3c',
      300: '#f7b167',
      50: '#fff2de'
    },
    sky: {
      muted: '#f6eddc',
      section: '#f1e4cd',
      light: '#fbf4e7'
    },
    neutral: {
      cream: '#f3ede0',
      offwhite: '#f7f2ea'
    },
    heroOverlay: {
      start: '#26120e',
      mid: '#3a1d16',
      end: '#7a3f26',
      bottomStart: '#3a1d16',
      bottomEnd: '#26120e'
    }
  },
  sections: {
    home: 'linear-gradient(130deg, #f5efdf 0%, #f3e5c8 56%, #f0d7b0 100%)',
    'transfer-showcase': 'linear-gradient(145deg, #f9f2e2 0%, #f4e5c7 62%, #f9dfbf 100%)',
    trust: 'linear-gradient(180deg, #f7f2ea 0%, #f2e9d8 100%)',
    packages: 'linear-gradient(180deg, #f8f2e7 0%, #f5ead5 100%)',
    costa: 'linear-gradient(180deg, #f4e9d4 0%, #f1e0bf 100%)',
    momentum: 'linear-gradient(180deg, #f3ddbc 0%, #efd2a8 100%)',
    courses: 'linear-gradient(180deg, #f6ecd8 0%, #f2e2c4 100%)',
    hotels: 'linear-gradient(180deg, #f4e7cf 0%, #f0ddba 100%)',
    transfers: 'linear-gradient(145deg, #3a1d16 0%, #5a2e20 45%, #7a3f26 100%)',
    plan: '#f7f2ea',
    testimonials: '#f5ecdd',
    contact: 'linear-gradient(150deg, #3a1d16 0%, #5a2e20 55%, #7a3f26 100%)'
  },
  typography: {
    fontFamilyDisplay: 'Sora',
    fontFamilyBody: 'Inter',
    scale: 1.04,
    headingWeight: 800,
    bodyWeight: 500
  },
  buttons: {
    radius: 26,
    paddingX: 2,
    paddingY: 1.05,
    shadowOpacity: 0.2
  },
  density: {
    sectionSpacing: 1.08,
    cardRadius: 1.16,
    surfaceShadowOpacity: 0.18
  },
  dividers: {
    amplitude: 44,
    curve: 58,
    drift: 12,
    fillPrimary: '#f7f2ea',
    fillSecondary: '#f1e4cd',
    fillDark: '#5a2e20'
  }
}

const storageKey = 'gsol-design-theme-v2'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const randomPalettes: readonly ThemePalette[] = [
  defaultTheme.palette,
  {
    forest: {
      950: '#25140f',
      900: '#3a2118',
      800: '#542d1f',
      700: '#7a3f25',
      600: '#9f542d',
      500: '#c96b33',
      100: '#ecdcc7',
      50: '#faefe2'
    },
    fairway: {
      700: '#383521',
      600: '#4e482c',
      500: '#685e35',
      400: '#8a7a45',
      200: '#d7c79f',
      100: '#efe3c7',
      50: '#faf3e4'
    },
    gold: {
      600: '#b93f2b',
      500: '#d24d32',
      400: '#ea6140',
      300: '#f5b66f',
      50: '#fff3df'
    },
    sky: {
      muted: '#f7ecd8',
      section: '#f1e2c4',
      light: '#fbf2e1'
    },
    neutral: {
      cream: '#f5ecda',
      offwhite: '#fbf3e4'
    },
    heroOverlay: {
      start: '#25140f',
      mid: '#3a2118',
      end: '#7a3f25',
      bottomStart: '#3a2118',
      bottomEnd: '#25140f'
    }
  },
  {
    forest: {
      950: '#2a1511',
      900: '#40231a',
      800: '#5e3322',
      700: '#824629',
      600: '#a95b30',
      500: '#d17333',
      100: '#efdcc5',
      50: '#fbf0e1'
    },
    fairway: {
      700: '#36341f',
      600: '#4e4729',
      500: '#685d33',
      400: '#887643',
      200: '#d7c49a',
      100: '#efe1c2',
      50: '#fbf2e1'
    },
    gold: {
      600: '#bd402a',
      500: '#d85031',
      400: '#ef6840',
      300: '#f8b66d',
      50: '#fff4df'
    },
    sky: {
      muted: '#f8ecd6',
      section: '#f4e3c2',
      light: '#fcf2df'
    },
    neutral: {
      cream: '#f6ecd9',
      offwhite: '#fcf3e3'
    },
    heroOverlay: {
      start: '#2a1511',
      mid: '#40231a',
      end: '#824629',
      bottomStart: '#40231a',
      bottomEnd: '#2a1511'
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
        home: `linear-gradient(130deg, ${palette.neutral.offwhite} 0%, ${palette.sky.light} 54%, ${palette.gold[50]} 100%)`,
        'transfer-showcase': `linear-gradient(145deg, ${palette.neutral.offwhite} 0%, ${palette.sky.section} 60%, ${palette.gold[50]} 100%)`,
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
