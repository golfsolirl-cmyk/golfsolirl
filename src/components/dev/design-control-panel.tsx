import { AnimatePresence, motion } from 'framer-motion'
import { Download, Palette, RefreshCw, SlidersHorizontal, Sparkles, Type } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDesignTheme } from '../../theme/design-theme-provider'
import type { SectionThemeKey } from '../../theme/design-theme'

type PanelSection = 'colors' | 'typography' | 'buttons' | 'dividers'

const panelSections: readonly {
  readonly key: PanelSection
  readonly label: string
  readonly icon: typeof Palette
}[] = [
  { key: 'colors', label: 'Colors', icon: Palette },
  { key: 'typography', label: 'Typography', icon: Type },
  { key: 'buttons', label: 'Buttons & Density', icon: SlidersHorizontal },
  { key: 'dividers', label: 'Dividers', icon: Sparkles }
]

const sectionLabels: readonly { readonly key: SectionThemeKey; readonly label: string }[] = [
  { key: 'home', label: 'Home / Hero' },
  { key: 'packages', label: 'Packages' },
  { key: 'costa', label: 'Costa' },
  { key: 'courses', label: 'Courses' },
  { key: 'hotels', label: 'Hotels' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'plan', label: 'Trip Planner' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'footer', label: 'Footer' }
]

export function DesignControlPanel() {
  const { isDesignPanelEnabled, theme, setTheme, randomizeTheme, resetTheme } = useDesignTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<PanelSection, boolean>>({
    colors: true,
    typography: true,
    buttons: true,
    dividers: true
  })
  const [exportFeedback, setExportFeedback] = useState('')

  const prettyJson = useMemo(() => JSON.stringify(theme, null, 2), [theme])

  if (!isDesignPanelEnabled) {
    return null
  }

  const toggleSection = (section: PanelSection) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section]
    }))
  }

  const exportAsFile = () => {
    const blob = new Blob([prettyJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'gsol-design-theme.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setExportFeedback('Exported JSON')
    window.setTimeout(() => setExportFeedback(''), 1800)
  }

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(prettyJson)
      setExportFeedback('Copied config')
      window.setTimeout(() => setExportFeedback(''), 1800)
    } catch {
      setExportFeedback('Copy failed')
      window.setTimeout(() => setExportFeedback(''), 1800)
    }
  }

  return (
    <>
      <motion.button
        aria-expanded={isOpen}
        aria-label="Toggle design control panel"
        className="fixed bottom-4 left-4 z-[80] inline-flex items-center gap-2 rounded-full border border-white/15 bg-forest-950/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-2xl backdrop-blur-md"
        onClick={() => setIsOpen((current) => !current)}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Palette className="h-4 w-4 text-[var(--gsol-accent)]" aria-hidden="true" />
        <span>Design Lab</span>
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="fixed inset-y-3 left-3 z-[85] w-[min(94vw,430px)] overflow-y-auto rounded-[1.6rem] border border-white/12 bg-[#071407]/95 p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            exit={{ opacity: 0, x: -26 }}
            initial={{ opacity: 0, x: -26 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gsol-accent)]">Dev-only controls</p>
                <h3 className="font-display text-2xl font-black">Global Design Panel</h3>
              </div>
              <button
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {panelSections.map(({ key, label, icon: Icon }) => (
                <section key={key} className="rounded-2xl border border-white/10 bg-white/5">
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => toggleSection(key)}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-[var(--gsol-accent)]" aria-hidden="true" />
                      {label}
                    </span>
                    <span className="text-xs text-white/65">{expandedSections[key] ? 'Hide' : 'Show'}</span>
                  </button>

                  {expandedSections[key] ? (
                    <div className="space-y-3 border-t border-white/10 px-4 py-4">
                      {key === 'colors' ? (
                        <>
                          <ColorField
                            label="App background"
                            value={theme.palette.appBg}
                            onChange={(value) =>
                              setTheme((current) => ({ ...current, palette: { ...current.palette, appBg: value } }))
                            }
                          />
                          <ColorField
                            label="Primary text"
                            value={theme.palette.textPrimary}
                            onChange={(value) =>
                              setTheme((current) => ({ ...current, palette: { ...current.palette, textPrimary: value } }))
                            }
                          />
                          <ColorField
                            label="Muted text"
                            value={theme.palette.textMuted}
                            onChange={(value) =>
                              setTheme((current) => ({ ...current, palette: { ...current.palette, textMuted: value } }))
                            }
                          />
                          <ColorField
                            label="Accent"
                            value={theme.palette.accent}
                            onChange={(value) =>
                              setTheme((current) => ({ ...current, palette: { ...current.palette, accent: value } }))
                            }
                          />
                          <ColorField
                            label="Accent strong"
                            value={theme.palette.accentStrong}
                            onChange={(value) =>
                              setTheme((current) => ({ ...current, palette: { ...current.palette, accentStrong: value } }))
                            }
                          />

                          <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/72">Section backgrounds</p>
                            <div className="grid gap-2">
                              {sectionLabels.map((section) => (
                                <ColorField
                                  key={section.key}
                                  label={section.label}
                                  value={theme.sections[section.key]}
                                  onChange={(value) =>
                                    setTheme((current) => ({
                                      ...current,
                                      sections: {
                                        ...current.sections,
                                        [section.key]: value
                                      }
                                    }))
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      ) : null}

                      {key === 'typography' ? (
                        <>
                          <TextField
                            label="Display font-family"
                            value={theme.typography.displayFamily}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                typography: { ...current.typography, displayFamily: value }
                              }))
                            }
                          />
                          <TextField
                            label="Body font-family"
                            value={theme.typography.bodyFamily}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                typography: { ...current.typography, bodyFamily: value }
                              }))
                            }
                          />
                          <RangeField
                            label="Type scale"
                            max={1.2}
                            min={0.88}
                            step={0.01}
                            value={theme.typography.scale}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                typography: { ...current.typography, scale: value }
                              }))
                            }
                          />
                          <RangeField
                            label="Display weight"
                            max={900}
                            min={650}
                            step={10}
                            value={theme.typography.displayWeight}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                typography: { ...current.typography, displayWeight: Math.round(value) }
                              }))
                            }
                          />
                          <RangeField
                            label="Body weight"
                            max={550}
                            min={350}
                            step={10}
                            value={theme.typography.bodyWeight}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                typography: { ...current.typography, bodyWeight: Math.round(value) }
                              }))
                            }
                          />
                        </>
                      ) : null}

                      {key === 'buttons' ? (
                        <>
                          <RangeField
                            label="Button radius"
                            max={999}
                            min={16}
                            step={1}
                            value={theme.buttons.radiusPx}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                buttons: { ...current.buttons, radiusPx: Math.round(value) }
                              }))
                            }
                          />
                          <RangeField
                            label="Button horizontal padding"
                            max={3}
                            min={1.2}
                            step={0.01}
                            value={theme.buttons.paddingXRem}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                buttons: { ...current.buttons, paddingXRem: value }
                              }))
                            }
                          />
                          <RangeField
                            label="Button vertical padding"
                            max={1.4}
                            min={0.72}
                            step={0.01}
                            value={theme.buttons.paddingYRem}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                buttons: { ...current.buttons, paddingYRem: value }
                              }))
                            }
                          />
                          <RangeField
                            label="Button shadow strength"
                            max={0.48}
                            min={0.1}
                            step={0.01}
                            value={theme.buttons.shadowStrength}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                buttons: { ...current.buttons, shadowStrength: value }
                              }))
                            }
                          />
                          <RangeField
                            label="Section spacing density"
                            max={1.24}
                            min={0.82}
                            step={0.01}
                            value={theme.density.sectionScale}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                density: { ...current.density, sectionScale: value }
                              }))
                            }
                          />
                          <RangeField
                            label="Card blur"
                            max={40}
                            min={8}
                            step={1}
                            value={theme.density.cardBlurPx}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                density: { ...current.density, cardBlurPx: Math.round(value) }
                              }))
                            }
                          />
                        </>
                      ) : null}

                      {key === 'dividers' ? (
                        <>
                          <label className="block space-y-1.5 text-xs text-white/75">
                            <span className="font-medium">Wave style</span>
                            <select
                              className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white"
                              onChange={(event) =>
                                setTheme((current) => ({
                                  ...current,
                                  wave: {
                                    ...current.wave,
                                    variant: event.currentTarget.value as typeof current.wave.variant
                                  }
                                }))
                              }
                              value={theme.wave.variant}
                            >
                              <option value="classic">Classic</option>
                              <option value="crest">Crest</option>
                              <option value="calm">Calm</option>
                            </select>
                          </label>
                          <RangeField
                            label="Wave height"
                            max={96}
                            min={56}
                            step={1}
                            value={theme.wave.heightPx}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                wave: { ...current.wave, heightPx: Math.round(value) }
                              }))
                            }
                          />
                          <RangeField
                            label="Wave drift speed"
                            max={18}
                            min={8}
                            step={0.1}
                            value={theme.wave.driftSeconds}
                            onChange={(value) =>
                              setTheme((current) => ({
                                ...current,
                                wave: { ...current.wave, driftSeconds: Number(value.toFixed(1)) }
                              }))
                            }
                          />
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                  onClick={randomizeTheme}
                  type="button"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[var(--gsol-accent)]" aria-hidden="true" />
                  Randomize
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                  onClick={resetTheme}
                  type="button"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[var(--gsol-accent)]" aria-hidden="true" />
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                  onClick={copyJson}
                  type="button"
                >
                  Copy JSON
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/12"
                  onClick={exportAsFile}
                  type="button"
                >
                  <Download className="h-3.5 w-3.5 text-[var(--gsol-accent)]" aria-hidden="true" />
                  Export
                </button>
              </div>
              {exportFeedback ? <p className="text-center text-xs text-[var(--gsol-accent)]">{exportFeedback}</p> : null}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
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
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/80">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <input
          aria-label={label}
          className="h-8 w-8 cursor-pointer rounded-md border border-white/15 bg-transparent p-0"
          onChange={(event) => onChange(event.currentTarget.value)}
          type="color"
          value={normalizeColor(value)}
        />
        <input
          className="w-24 rounded-md border border-white/20 bg-black/30 px-2 py-1 text-[11px] uppercase text-white"
          onChange={(event) => onChange(event.currentTarget.value)}
          value={value}
        />
      </div>
    </label>
  )
}

function TextField({
  label,
  value,
  onChange
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-1.5 text-xs text-white/75">
      <span className="font-medium">{label}</span>
      <input
        className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white"
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      />
    </label>
  )
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  readonly label: string
  readonly min: number
  readonly max: number
  readonly step: number
  readonly value: number
  readonly onChange: (value: number) => void
}) {
  return (
    <label className="block space-y-1.5 text-xs text-white/75">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-white/60">{value}</span>
      </div>
      <input
        className="w-full accent-[var(--gsol-accent)]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  )
}

function normalizeColor(value: string) {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value
  }

  return '#163a13'
}
