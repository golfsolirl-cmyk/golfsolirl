import { Download, Palette, RotateCcw, Shuffle, SlidersHorizontal, Type, Waves } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { cx } from '../../lib/utils'
import { useTheme } from '../../providers/theme-provider'

type PanelSectionId = 'colors' | 'typography' | 'buttons' | 'density' | 'dividers'

const panelSections: readonly {
  readonly id: PanelSectionId
  readonly label: string
  readonly icon: typeof Palette
}[] = [
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'buttons', label: 'Buttons', icon: SlidersHorizontal },
  { id: 'density', label: 'Density', icon: SlidersHorizontal },
  { id: 'dividers', label: 'Dividers', icon: Waves }
]

function LabeledSlider({
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
  readonly step?: number
  readonly onChange: (nextValue: number) => void
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-900/70">
        <span>{label}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-forest-900/65">{value}</span>
      </div>
      <input
        className="w-full accent-fairway-500"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step ?? 1}
        type="range"
        value={value}
      />
    </label>
  )
}

function LabeledColorInput({
  label,
  value,
  onChange
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (nextValue: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-900/70">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-2">
        <input className="h-7 w-8 rounded border border-forest-100" onChange={(event) => onChange(event.target.value)} type="color" value={value} />
        <input
          className="w-full bg-transparent text-sm font-medium text-forest-900 focus:outline-none"
          onChange={(event) => onChange(event.target.value)}
          type="text"
          value={value}
        />
      </div>
    </label>
  )
}

export function DesignControlPanel() {
  const { theme, updateTheme, randomizeTheme, resetTheme, exportThemeJson } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<PanelSectionId>('colors')
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied'>('idle')

  const activeSectionMeta = useMemo(
    () => panelSections.find((section) => section.id === activeSection) ?? panelSections[0],
    [activeSection]
  )

  const handleCopyTheme = async () => {
    const rawJson = exportThemeJson()
    await navigator.clipboard.writeText(rawJson)
    setCopyFeedback('copied')
    window.setTimeout(() => setCopyFeedback('idle'), 1200)
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex items-end justify-end">
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.aside
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-auto mb-3 w-[min(92vw,360px)] rounded-[1.5rem] border border-forest-100 bg-offwhite p-4 shadow-[0_24px_80px_rgba(5,11,26,0.2)]"
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">Design Lab (dev-only)</p>
                <p className="text-sm font-semibold text-forest-900">Global styling controls</p>
              </div>
              <button
                className="rounded-full border border-forest-100 bg-white px-3 py-1.5 text-xs font-semibold text-forest-900 transition hover:border-fairway-400 hover:text-fairway-700"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mb-3 grid grid-cols-5 gap-2">
              {panelSections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={cx(
                    'rounded-xl border px-2 py-2 text-center text-[11px] font-semibold transition',
                    activeSection === id
                      ? 'border-fairway-500 bg-fairway-500 text-white'
                      : 'border-forest-100 bg-white text-forest-900 hover:border-fairway-300'
                  )}
                  onClick={() => setActiveSection(id)}
                  type="button"
                >
                  <Icon className="mx-auto mb-1 h-3.5 w-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-forest-100 bg-white p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-forest-900/68">{activeSectionMeta.label}</p>

              {activeSection === 'colors' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabeledColorInput
                    label="Primary dark"
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        palette: { ...current.palette, forest: { ...current.palette.forest, 900: nextValue } }
                      }))
                    }
                    value={theme.palette.forest[900]}
                  />
                  <LabeledColorInput
                    label="Primary accent"
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        palette: { ...current.palette, fairway: { ...current.palette.fairway, 500: nextValue } }
                      }))
                    }
                    value={theme.palette.fairway[500]}
                  />
                  <LabeledColorInput
                    label="CTA accent"
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        palette: { ...current.palette, gold: { ...current.palette.gold, 400: nextValue } }
                      }))
                    }
                    value={theme.palette.gold[400]}
                  />
                  <LabeledColorInput
                    label="Page wash"
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        palette: { ...current.palette, neutral: { ...current.palette.neutral, offwhite: nextValue } }
                      }))
                    }
                    value={theme.palette.neutral.offwhite}
                  />
                </div>
              ) : null}

              {activeSection === 'typography' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-900/70">
                      <span>Display font</span>
                      <select
                        className="w-full rounded-lg border border-forest-100 bg-white px-2 py-2 text-sm font-medium uppercase text-forest-900"
                        onChange={(event) =>
                          updateTheme((current) => ({
                            ...current,
                            typography: { ...current.typography, fontFamilyDisplay: event.target.value as 'Manrope' | 'Inter' | 'Sora' | 'Rubik' }
                          }))
                        }
                        value={theme.typography.fontFamilyDisplay}
                      >
                        <option value="Sora">Sora</option>
                        <option value="Manrope">Manrope</option>
                        <option value="Inter">Inter</option>
                        <option value="Rubik">Rubik</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-900/70">
                      <span>Body font</span>
                      <select
                        className="w-full rounded-lg border border-forest-100 bg-white px-2 py-2 text-sm font-medium uppercase text-forest-900"
                        onChange={(event) =>
                          updateTheme((current) => ({
                            ...current,
                            typography: { ...current.typography, fontFamilyBody: event.target.value as 'Manrope' | 'Inter' | 'Sora' | 'Rubik' }
                          }))
                        }
                        value={theme.typography.fontFamilyBody}
                      >
                        <option value="Manrope">Manrope</option>
                        <option value="Inter">Inter</option>
                        <option value="Sora">Sora</option>
                        <option value="Rubik">Rubik</option>
                      </select>
                    </label>
                  </div>
                  <LabeledSlider
                    label="Type scale"
                    max={120}
                    min={90}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        typography: { ...current.typography, scale: Number((nextValue / 100).toFixed(2)) }
                      }))
                    }
                    value={Math.round(theme.typography.scale * 100)}
                  />
                  <LabeledSlider
                    label="Heading weight"
                    max={900}
                    min={640}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        typography: { ...current.typography, headingWeight: nextValue }
                      }))
                    }
                    value={theme.typography.headingWeight}
                  />
                </div>
              ) : null}

              {activeSection === 'buttons' ? (
                <div className="space-y-3">
                  <LabeledSlider
                    label="Radius"
                    max={999}
                    min={14}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        buttons: { ...current.buttons, radius: nextValue }
                      }))
                    }
                    value={theme.buttons.radius}
                  />
                  <LabeledSlider
                    label="Horizontal padding"
                    max={26}
                    min={10}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        buttons: { ...current.buttons, paddingX: Number((nextValue / 10).toFixed(2)) }
                      }))
                    }
                    value={Math.round(theme.buttons.paddingX * 10)}
                  />
                  <LabeledSlider
                    label="Shadow opacity"
                    max={40}
                    min={10}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        buttons: { ...current.buttons, shadowOpacity: Number((nextValue / 100).toFixed(2)) }
                      }))
                    }
                    value={Math.round(theme.buttons.shadowOpacity * 100)}
                  />
                </div>
              ) : null}

              {activeSection === 'density' ? (
                <div className="space-y-3">
                  <LabeledSlider
                    label="Section spacing"
                    max={130}
                    min={80}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        density: { ...current.density, sectionSpacing: Number((nextValue / 100).toFixed(2)) }
                      }))
                    }
                    value={Math.round(theme.density.sectionSpacing * 100)}
                  />
                  <LabeledSlider
                    label="Surface radius"
                    max={130}
                    min={70}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        density: { ...current.density, cardRadius: Number((nextValue / 100).toFixed(2)) }
                      }))
                    }
                    value={Math.round(theme.density.cardRadius * 100)}
                  />
                  <LabeledSlider
                    label="Surface shadow"
                    max={32}
                    min={8}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        density: { ...current.density, surfaceShadowOpacity: Number((nextValue / 100).toFixed(2)) }
                      }))
                    }
                    value={Math.round(theme.density.surfaceShadowOpacity * 100)}
                  />
                </div>
              ) : null}

              {activeSection === 'dividers' ? (
                <div className="space-y-3">
                  <LabeledSlider
                    label="Wave amplitude"
                    max={80}
                    min={18}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        dividers: { ...current.dividers, amplitude: nextValue }
                      }))
                    }
                    value={theme.dividers.amplitude}
                  />
                  <LabeledSlider
                    label="Wave curve"
                    max={90}
                    min={25}
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        dividers: { ...current.dividers, curve: nextValue }
                      }))
                    }
                    value={theme.dividers.curve}
                  />
                  <LabeledColorInput
                    label="Primary fill"
                    onChange={(nextValue) =>
                      updateTheme((current) => ({
                        ...current,
                        dividers: { ...current.dividers, fillPrimary: nextValue }
                      }))
                    }
                    value={theme.dividers.fillPrimary}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-fairway-400 bg-fairway-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-fairway-600"
                onClick={randomizeTheme}
                type="button"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                Randomize
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-forest-900 transition hover:border-gold-300 hover:text-gold-600"
                onClick={resetTheme}
                type="button"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-forest-900 transition hover:border-fairway-300 hover:text-fairway-700"
                onClick={handleCopyTheme}
                type="button"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {copyFeedback === 'copied' ? 'Copied JSON' : 'Export JSON'}
              </button>
              <button
                className="rounded-xl border border-forest-100 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-forest-900 transition hover:border-fairway-300 hover:text-fairway-700"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Collapse
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close design controls' : 'Open design controls'}
        className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full border border-fairway-500 bg-fairway-500 px-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(5,11,26,0.28)] transition hover:bg-fairway-600"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Palette className="h-4 w-4" aria-hidden="true" />
        Design Lab
      </button>
    </div>
  )
}
