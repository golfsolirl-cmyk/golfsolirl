export interface GeCourse {
  readonly name: string
  readonly description: string
  readonly image: string
  readonly href: string
}

export const coursesSpain: readonly GeCourse[] = [
  {
    name: 'Real Club Valderrama',
    description:
      'Officially voted Europe’s No. 1 Golf Course. Home to the Volvo Masters and host to the 1997 Ryder Cup. You may return home shell shocked but should be content with the thought that you are one of the lucky few to have played here.',
    image:
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Zagaleta New Course',
    description:
      'A splendid array of green tongues. This par-70 course inaugurated in 2005 really does merge golf with nature, assimilating the playing experience with the gorgeous nature that envelopes it.',
    image:
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Flamingos Golf Club',
    description:
      'Flamingos Golf Club is located at Cancelada, between the towns of Marbella and Estepona. A challenging course noted for its breathtaking views of the Mediterranean Sea, North Africa and Gibraltar.',
    image:
      'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  }
] as const

export const coursesPortugal: readonly GeCourse[] = [
  {
    name: 'Dunas Golf Comporta',
    description:
      'After a few years of construction, Comporta Dunas presents itself as one of the best places for golf in Europe. Designed by David McLay-Kidd in a setting that already inspires reverence among players.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Quinta da Ria / Quinta da Cima',
    description:
      'Quinta da Ria Resort, situated on the Eastern Coast, is a well-known golf attraction in the Algarve. It includes two spectacular 18-hole golf courses set into a mature, scenic landscape.',
    image:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Vale do Lobo Royal',
    description:
      'Vale do Lobo is the Algarve’s most senior golf resort, founded in 1962 and currently the largest luxury resort in Portugal. Much has happened at the Vale since Sir Henry Cotton laid out the first holes.',
    image:
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  }
] as const
