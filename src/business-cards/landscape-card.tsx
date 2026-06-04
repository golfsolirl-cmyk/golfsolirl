/**
 * Landscape foil luxury card — matches reference mockup (forest texture, gold foil, split back).
 */
import { businessCardPerson, type BusinessCardPersonBlurb } from '../lib/business-cards-config'
import type { CardRenderMode } from './tokens'
import {
  FoilExactBack,
  FoilExactFront,
  FoilPrintCardFigure,
  foilPersonFromContact
} from '../components/business-cards-foil-exact'

export function LandscapeCard({
  mode,
  side,
  person = businessCardPerson
}: {
  readonly mode: CardRenderMode
  readonly side: 'back' | 'front'
  readonly person?: BusinessCardPersonBlurb
}) {
  const foilPerson = foilPersonFromContact(person)

  return (
    <FoilPrintCardFigure mode={mode} orientation="landscape">
      {side === 'front' ? (
        <FoilExactFront mode={mode} orientation="landscape" />
      ) : (
        <FoilExactBack mode={mode} orientation="landscape" person={foilPerson} nameScale="hero" />
      )}
    </FoilPrintCardFigure>
  )
}
