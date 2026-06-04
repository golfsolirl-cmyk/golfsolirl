/**
 * Portrait foil luxury card — same reference system, vertical layout.
 */
import { businessCardPerson, type BusinessCardPersonBlurb } from '../lib/business-cards-config'
import type { CardRenderMode } from './tokens'
import {
  FoilExactBack,
  FoilExactFront,
  FoilPrintCardFigure,
  foilPersonFromContact
} from '../components/business-cards-foil-exact'

export function PortraitCard({
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
    <FoilPrintCardFigure mode={mode} orientation="portrait">
      {side === 'front' ? (
        <FoilExactFront mode={mode} orientation="portrait" />
      ) : (
        <FoilExactBack mode={mode} orientation="portrait" person={foilPerson} nameScale="hero" />
      )}
    </FoilPrintCardFigure>
  )
}
