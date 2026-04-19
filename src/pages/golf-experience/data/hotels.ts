export interface GeHotel {
  readonly name: string
  readonly area: string
  readonly image: string
  readonly href: string
}

export const hotelsSpain: readonly GeHotel[] = [
  {
    name: 'El Fuerte Marbella',
    area: 'Marbella',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Puente Romano Marbella',
    area: 'Marbella',
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Senator Banus Spa Hotel',
    area: 'Estepona',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Gran Melia Don Pepe',
    area: 'Marbella',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Westin La Quinta Golf',
    area: 'Marbella',
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  }
] as const

export const hotelsPortugal: readonly GeHotel[] = [
  {
    name: 'Tivoli Marina Algarve',
    area: 'Algarve Resort',
    image:
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'Vila Galé Cerro Alagoa',
    area: 'Albufeira',
    image:
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  },
  {
    name: 'The Lake Resort',
    area: 'Vilamoura',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    href: '#'
  }
] as const
