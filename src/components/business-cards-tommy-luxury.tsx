/**
 * Tommy O'Shea — exact foil luxury landscape card (reference mockup).
 */
import { m, useReducedMotion } from 'framer-motion'
import type { BusinessCardRenderMode, BusinessCardSpec } from '../lib/business-cards-catalog-types'
import { GOLFSOL_BRAND_LOGO_HOSTED } from '../lib/brand-logo-assets'
import {
  FOIL_CARD_LH,
  FOIL_CARD_LW,
  FoilExactBack,
  FoilExactFront,
  FoilPrintCardFigure,
  foilPersonTommy
} from './business-cards-foil-exact'

const T = foilPersonTommy()

function TommyLuxuryCardFront({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'

  return (
    <FoilPrintCardFigure mode={mode} orientation="landscape">
      <m.div
        className="absolute inset-0"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <FoilExactFront mode={mode} orientation="landscape" />
      </m.div>
      <figcaption className="sr-only">Tommy O'Shea — front</figcaption>
    </FoilPrintCardFigure>
  )
}

function TommyLuxuryCardBack({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'

  return (
    <FoilPrintCardFigure mode={mode} orientation="landscape">
      <m.div
        className="absolute inset-0"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <FoilExactBack mode={mode} orientation="landscape" person={T} />
      </m.div>
      <figcaption className="sr-only">Tommy O'Shea — back</figcaption>
    </FoilPrintCardFigure>
  )
}

export const TOMMY_LUXURY_CARD_SPECS: readonly BusinessCardSpec[] = [
  {
    id: 'tommy-luxury-front',
    title: "Landscape front — Tommy O'Shea",
    subtitle: 'Exact mockup — GOLF SOL IRELAND foil front (shared company face).',
    orientation: 'landscape',
    side: 'front',
    imageSrc: GOLFSOL_BRAND_LOGO_HOSTED,
    width: FOIL_CARD_LW,
    height: FOIL_CARD_LH,
    render: (mode = 'preview') => <TommyLuxuryCardFront mode={mode} />
  },
  {
    id: 'tommy-luxury-back',
    title: "Landscape back — Tommy O'Shea",
    subtitle: 'Exact mockup — TOMMY O\'SHEA contact, QR + crest, SCAN TO BOOK, service footer.',
    orientation: 'landscape',
    side: 'back',
    imageSrc: GOLFSOL_BRAND_LOGO_HOSTED,
    width: FOIL_CARD_LW,
    height: FOIL_CARD_LH,
    render: (mode = 'preview') => <TommyLuxuryCardBack mode={mode} />
  }
] as const

export { TommyLuxuryCardFront, TommyLuxuryCardBack }
