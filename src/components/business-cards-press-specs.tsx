/**

 * Golf Sol Ireland — foil luxury business cards (Martin Kelly + Greg McDonald).

 * Exact reference mockup: brand front, split contact + QR back.

 */

import { m, useReducedMotion } from 'framer-motion'

import type { BusinessCardRenderMode, BusinessCardSpec } from '../lib/business-cards-catalog-types'

import type { BusinessCardPersonBlurb } from '../lib/business-cards-config'

import { businessCardPerson, businessCardPersonGreg } from '../lib/business-cards-config'

import { GOLFSOL_BRAND_LOGO_HOSTED } from '../lib/brand-logo-assets'

import {

  FOIL_CARD_LH,

  FOIL_CARD_LW,

  FOIL_CARD_PH,

  FOIL_CARD_PW,

  FoilExactBack,

  FoilExactFront,

  FoilPrintCardFigure,

  foilPersonFromContact

} from './business-cards-foil-exact'



function FoilCardFront({

  mode,

  orientation

}: {

  readonly mode: BusinessCardRenderMode

  readonly orientation: 'landscape' | 'portrait'

}) {

  const reduce = useReducedMotion()

  const isPdf = mode === 'pdf'



  return (

    <FoilPrintCardFigure mode={mode} orientation={orientation}>

      <m.div

        className="absolute inset-0"

        initial={reduce || isPdf ? false : { opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ duration: 0.4 }}

      >

        <FoilExactFront mode={mode} orientation={orientation} />

      </m.div>

      <figcaption className="sr-only">{orientation} front — Golf Sol Ireland</figcaption>

    </FoilPrintCardFigure>

  )

}



function FoilCardBack({

  mode,

  orientation,

  person

}: {

  readonly mode: BusinessCardRenderMode

  readonly orientation: 'landscape' | 'portrait'

  readonly person: BusinessCardPersonBlurb

}) {

  const reduce = useReducedMotion()

  const isPdf = mode === 'pdf'

  const foilPerson = foilPersonFromContact(person, {

    location: person.corridorLine.includes('Dublin') ? 'Costa del Sol, Spain' : person.corridorLine

  })



  return (

    <FoilPrintCardFigure mode={mode} orientation={orientation}>

      <m.div

        className="absolute inset-0"

        initial={reduce || isPdf ? false : { opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ duration: 0.4 }}

      >

        <FoilExactBack mode={mode} orientation={orientation} person={foilPerson} />

      </m.div>

      <figcaption className="sr-only">

        {orientation} back — {person.name}

      </figcaption>

    </FoilPrintCardFigure>

  )

}



function specsForPerson(

  person: BusinessCardPersonBlurb,

  ids: readonly [string, string, string, string]

): readonly BusinessCardSpec[] {

  const [idPf, idPb, idLf, idLb] = ids

  const short = person.name.split(' ')[0] ?? person.name



  return [

    {

      id: idPf,

      title: `Portrait front — ${short}`,

      subtitle: 'Foil luxury — centred crest, GOLF SOL IRELAND, taglines, Mercedes + shamrock.',

      orientation: 'portrait',

      side: 'front',

      imageSrc: GOLFSOL_BRAND_LOGO_HOSTED,

      width: FOIL_CARD_PW,

      height: FOIL_CARD_PH,

      render: (mode = 'preview') => <FoilCardFront mode={mode} orientation="portrait" />

    },

    {

      id: idPb,

      title: `Portrait back — ${short}`,

      subtitle: 'Contact column · QR with crest · SCAN TO BOOK · service footer.',

      orientation: 'portrait',

      side: 'back',

      imageSrc: GOLFSOL_BRAND_LOGO_HOSTED,

      width: FOIL_CARD_PW,

      height: FOIL_CARD_PH,

      render: (mode = 'preview') => <FoilCardBack mode={mode} person={person} orientation="portrait" />

    },

    {

      id: idLf,

      title: `Landscape front — ${short}`,

      subtitle: 'Exact mockup front — forest texture, gold foil type, corner Celtic accents.',

      orientation: 'landscape',

      side: 'front',

      imageSrc: GOLFSOL_BRAND_LOGO_HOSTED,

      width: FOIL_CARD_LW,

      height: FOIL_CARD_LH,

      render: (mode = 'preview') => <FoilCardFront mode={mode} orientation="landscape" />

    },

    {

      id: idLb,

      title: `Landscape back — ${short}`,

      subtitle: 'Exact mockup back — split layout, watermark crest, QR + footer services.',

      orientation: 'landscape',

      side: 'back',

      imageSrc: GOLFSOL_BRAND_LOGO_HOSTED,

      width: FOIL_CARD_LW,

      height: FOIL_CARD_LH,

      render: (mode = 'preview') => <FoilCardBack mode={mode} person={person} orientation="landscape" />

    }

  ] as const

}



/** Eight faces — Martin Kelly + Greg McDonald. */

export const BUSINESS_CARD_PRESS_SPECS: readonly BusinessCardSpec[] = [

  ...specsForPerson(businessCardPerson, ['portrait-front', 'portrait-back', 'landscape-front', 'landscape-back']),

  ...specsForPerson(businessCardPersonGreg, [

    'greg-portrait-front',

    'greg-portrait-back',

    'greg-landscape-front',

    'greg-landscape-back'

  ])

]


