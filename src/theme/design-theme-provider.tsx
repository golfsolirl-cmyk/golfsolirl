import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react'
import {
  DESIGN_THEME_STORAGE_KEY,
  applyThemeToDocument,
  defaultDesignTheme,
  mergeTheme,
  randomizeDesignTheme,
  type DesignThemeConfig
} from './design-theme'

type ThemeUpdater = DesignThemeConfig | ((current: DesignThemeConfig) => DesignThemeConfig)

interface DesignThemeContextValue {
  readonly theme: DesignThemeConfig
  readonly isDesignPanelEnabled: boolean
  readonly setTheme: (updater: ThemeUpdater) => void
  readonly resetTheme: () => void
  readonly randomizeTheme: () => void
}

const DesignThemeContext = createContext<DesignThemeContextValue | null>(null)

function resolveDesignPanelFlag() {
  if (!import.meta.env.DEV) {
    return false
  }

  const raw = import.meta.env.VITE_ENABLE_DESIGN_PANEL
  if (typeof raw !== 'string') {
    return true
  }

  return raw.toLowerCase() !== 'false'
}

export function DesignThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<DesignThemeConfig>(() => {
    if (typeof window === 'undefined') {
      return defaultDesignTheme
    }

    const rawTheme = localStorage.getItem(DESIGN_THEME_STORAGE_KEY)
    if (!rawTheme) {
      return defaultDesignTheme
    }

    try {
      return mergeTheme(JSON.parse(rawTheme))
    } catch {
      return defaultDesignTheme
    }
  })

  const isDesignPanelEnabled = resolveDesignPanelFlag()

  const setTheme = useCallback((updater: ThemeUpdater) => {
    setThemeState((current) => (typeof updater === 'function' ? (updater as (value: DesignThemeConfig) => DesignThemeConfig)(current) : updater))
  }, [])

  const resetTheme = useCallback(() => {
    setThemeState(defaultDesignTheme)
  }, [])

  const randomizeTheme = useCallback(() => {
    setThemeState((current) => randomizeDesignTheme(current))
  }, [])

  useEffect(() => {
    applyThemeToDocument(theme)
    localStorage.setItem(DESIGN_THEME_STORAGE_KEY, JSON.stringify(theme))
  }, [theme])

  const value = useMemo<DesignThemeContextValue>(
    () => ({
      theme,
      isDesignPanelEnabled,
      setTheme,
      resetTheme,
      randomizeTheme
    }),
    [isDesignPanelEnabled, randomizeTheme, resetTheme, setTheme, theme]
  )

  return <DesignThemeContext.Provider value={value}>{children}</DesignThemeContext.Provider>
}

export function useDesignTheme() {
  const context = useContext(DesignThemeContext)
  if (!context) {
    throw new Error('useDesignTheme must be used inside a DesignThemeProvider.')
  }

  return context
}
