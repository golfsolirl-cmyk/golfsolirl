export type CourseTier = 'value' | 'premium' | 'luxury'

export interface CoastalCourse {
  readonly id: string
  readonly name: string
  readonly region: string
  readonly lat: number
  readonly lng: number
  readonly rating: number
  readonly tier: CourseTier
}

export interface NearbyHotel {
  readonly name: string
  readonly stars: 3 | 4 | 5
  readonly rating: number
  readonly dist: string
  readonly lat: number
  readonly lng: number
}

export const COURSES: readonly CoastalCourse[] = [
  { id: 'torrequebrada', name: 'Golf Torrequebrada', region: 'Benalmádena', lat: 36.5886, lng: -4.5518, rating: 4.4, tier: 'value' },
  { id: 'lauro', name: 'Lauro Golf Resort', region: 'Alhaurín de la Torre', lat: 36.6513, lng: -4.6308, rating: 4.4, tier: 'value' },
  { id: 'chaparral', name: 'Chaparral Golf Club', region: 'Mijas Costa', lat: 36.5138, lng: -4.6609, rating: 4.7, tier: 'premium' },
  { id: 'lacala', name: 'La Cala Golf Resort', region: 'Mijas', lat: 36.542, lng: -4.72, rating: 4.8, tier: 'premium' },
  { id: 'cabopino', name: 'Cabopino Golf Marbella', region: 'Marbella East', lat: 36.494, lng: -4.7403, rating: 4.3, tier: 'value' },
  { id: 'santamaria', name: 'Santa Maria Golf Club', region: 'Marbella', lat: 36.4999, lng: -4.7676, rating: 4.1, tier: 'value' },
  { id: 'santaclara', name: 'Santa Clara Golf Marbella', region: 'Marbella', lat: 36.5083, lng: -4.8165, rating: 4.4, tier: 'value' },
  { id: 'higueron', name: 'Higueron Marbella Golf', region: 'Marbella', lat: 36.5133, lng: -4.8129, rating: 4.3, tier: 'value' },
  { id: 'lasbrisas', name: 'Real Club Las Brisas', region: 'Nueva Andalucía', lat: 36.5104, lng: -4.9699, rating: 4.6, tier: 'premium' },
  { id: 'losnaranjos', name: 'Los Naranjos Golf Club', region: 'Nueva Andalucía', lat: 36.5098, lng: -4.9803, rating: 4.4, tier: 'premium' },
  { id: 'elparaiso', name: 'El Paraíso Golf', region: 'Estepona', lat: 36.4766, lng: -5.0348, rating: 4.5, tier: 'value' },
  { id: 'valleromano', name: 'Valle Romano Golf', region: 'Estepona', lat: 36.4313, lng: -5.195, rating: 4.4, tier: 'value' },
  { id: 'fincacortesin', name: 'Finca Cortesin', region: 'Casares', lat: 36.3978, lng: -5.2232, rating: 4.8, tier: 'luxury' },
  { id: 'valderrama', name: 'Real Club Valderrama', region: 'Sotogrande', lat: 36.2831, lng: -5.3274, rating: 4.6, tier: 'luxury' },
  { id: 'sotogrande', name: 'Sotogrande Old Course', region: 'Sotogrande', lat: 36.2755, lng: -5.2852, rating: 4.7, tier: 'luxury' },
  { id: 'sanroque', name: 'San Roque Golf Club', region: 'San Roque', lat: 36.266, lng: -5.336, rating: 4.4, tier: 'premium' },
  { id: 'lahacienda', name: 'La Hacienda Links', region: 'San Roque', lat: 36.2471, lng: -5.3228, rating: 4.5, tier: 'premium' }
]

export const NEARBY_HOTELS: Readonly<Record<string, readonly NearbyHotel[]>> = {
  torrequebrada: [
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '12 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '18 min', lat: 36.4976, lng: -4.9424 },
    { name: 'Puente Romano Marbella', stars: 5, rating: 4.7, dist: '25 min', lat: 36.5036, lng: -4.9259 }
  ],
  lauro: [
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '30 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '35 min', lat: 36.4976, lng: -4.9424 },
    { name: 'H10 Estepona Palace', stars: 4, rating: 4.3, dist: '45 min', lat: 36.4173, lng: -5.173 }
  ],
  chaparral: [
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '8 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '14 min', lat: 36.4976, lng: -4.9424 },
    { name: 'Puente Romano Marbella', stars: 5, rating: 4.7, dist: '20 min', lat: 36.5036, lng: -4.9259 },
    { name: 'Marbella Club Hotel', stars: 5, rating: 4.7, dist: '22 min', lat: 36.5067, lng: -4.9192 }
  ],
  lacala: [
    { name: 'La Cala Resort Hotel', stars: 4, rating: 4.8, dist: 'On-site', lat: 36.542, lng: -4.72 },
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '15 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '20 min', lat: 36.4976, lng: -4.9424 }
  ],
  cabopino: [
    { name: 'Rio Real Golf & Hotel', stars: 4, rating: 4.4, dist: '8 min', lat: 36.5128, lng: -4.8442 },
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '13 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '19 min', lat: 36.4976, lng: -4.9424 },
    { name: 'Puente Romano Marbella', stars: 5, rating: 4.7, dist: '24 min', lat: 36.5036, lng: -4.9259 }
  ],
  santamaria: [
    { name: 'Rio Real Golf & Hotel', stars: 4, rating: 4.4, dist: '10 min', lat: 36.5128, lng: -4.8442 },
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '14 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '19 min', lat: 36.4976, lng: -4.9424 }
  ],
  santaclara: [
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '5 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '9 min', lat: 36.4976, lng: -4.9424 },
    { name: 'Puente Romano Marbella', stars: 5, rating: 4.7, dist: '13 min', lat: 36.5036, lng: -4.9259 },
    { name: 'Marbella Club Hotel', stars: 5, rating: 4.7, dist: '14 min', lat: 36.5067, lng: -4.9192 }
  ],
  higueron: [
    { name: 'Rio Real Golf & Hotel', stars: 4, rating: 4.4, dist: '5 min', lat: 36.5128, lng: -4.8442 },
    { name: 'Hotel Amare Marbella', stars: 4, rating: 4.6, dist: '7 min', lat: 36.5083, lng: -4.8811 },
    { name: 'Iberostar Coral Beach', stars: 5, rating: 4.8, dist: '11 min', lat: 36.4976, lng: -4.9424 },
    { name: 'Marbella Club Hotel', stars: 5, rating: 4.7, dist: '16 min', lat: 36.5067, lng: -4.9192 }
  ],
  lasbrisas: [
    { name: 'The Westin La Quinta', stars: 5, rating: 4.5, dist: '5 min', lat: 36.5129, lng: -4.9946 },
    { name: 'ME Marbella', stars: 5, rating: 4.8, dist: '8 min', lat: 36.4953, lng: -4.9469 },
    { name: 'Puente Romano Marbella', stars: 5, rating: 4.7, dist: '10 min', lat: 36.5036, lng: -4.9259 },
    { name: 'Marbella Club Hotel', stars: 5, rating: 4.7, dist: '12 min', lat: 36.5067, lng: -4.9192 }
  ],
  losnaranjos: [
    { name: 'The Westin La Quinta', stars: 5, rating: 4.5, dist: '6 min', lat: 36.5129, lng: -4.9946 },
    { name: 'ME Marbella', stars: 5, rating: 4.8, dist: '7 min', lat: 36.4953, lng: -4.9469 },
    { name: 'Puente Romano Marbella', stars: 5, rating: 4.7, dist: '11 min', lat: 36.5036, lng: -4.9259 }
  ],
  elparaiso: [
    { name: 'THE FLAG Costa del Sol', stars: 4, rating: 4.7, dist: '8 min', lat: 36.4603, lng: -5.0457 },
    { name: 'Elba Estepona Gran Hotel', stars: 5, rating: 4.5, dist: '10 min', lat: 36.4087, lng: -5.186 },
    { name: 'H10 Estepona Palace', stars: 4, rating: 4.3, dist: '15 min', lat: 36.4173, lng: -5.173 },
    { name: 'Hotel Estepona Plaza', stars: 4, rating: 4.9, dist: '18 min', lat: 36.4273, lng: -5.1407 }
  ],
  valleromano: [
    { name: 'THE FLAG Costa del Sol', stars: 4, rating: 4.7, dist: '6 min', lat: 36.4603, lng: -5.0457 },
    { name: 'Elba Estepona Gran Hotel', stars: 5, rating: 4.5, dist: '8 min', lat: 36.4087, lng: -5.186 },
    { name: 'H10 Estepona Palace', stars: 4, rating: 4.3, dist: '12 min', lat: 36.4173, lng: -5.173 },
    { name: 'Hotel Estepona Plaza', stars: 4, rating: 4.9, dist: '20 min', lat: 36.4273, lng: -5.1407 }
  ],
  fincacortesin: [
    { name: 'Elba Estepona Gran Hotel', stars: 5, rating: 4.5, dist: '20 min', lat: 36.4087, lng: -5.186 },
    { name: 'SO/ Sotogrande Resort', stars: 5, rating: 4.6, dist: '25 min', lat: 36.2753, lng: -5.3519 },
    { name: 'THE FLAG Costa del Sol', stars: 4, rating: 4.7, dist: '18 min', lat: 36.4603, lng: -5.0457 },
    { name: 'Hotel Piedra Paloma', stars: 3, rating: 4.3, dist: '10 min', lat: 36.3915, lng: -5.2049 }
  ],
  valderrama: [
    { name: 'SO/ Sotogrande Resort', stars: 5, rating: 4.6, dist: '5 min', lat: 36.2753, lng: -5.3519 },
    { name: 'MiM Sotogrande', stars: 4, rating: 4.7, dist: '10 min', lat: 36.2906, lng: -5.2709 },
    { name: 'Inmood San Roque', stars: 4, rating: 4.2, dist: '8 min', lat: 36.2658, lng: -5.3355 },
    { name: 'Hotel Piedra Paloma', stars: 3, rating: 4.3, dist: '22 min', lat: 36.3915, lng: -5.2049 }
  ],
  sotogrande: [
    { name: 'SO/ Sotogrande Resort', stars: 5, rating: 4.6, dist: '3 min', lat: 36.2753, lng: -5.3519 },
    { name: 'MiM Sotogrande', stars: 4, rating: 4.7, dist: '8 min', lat: 36.2906, lng: -5.2709 },
    { name: 'Inmood San Roque', stars: 4, rating: 4.2, dist: '10 min', lat: 36.2658, lng: -5.3355 }
  ],
  sanroque: [
    { name: 'SO/ Sotogrande Resort', stars: 5, rating: 4.6, dist: '8 min', lat: 36.2753, lng: -5.3519 },
    { name: 'MiM Sotogrande', stars: 4, rating: 4.7, dist: '12 min', lat: 36.2906, lng: -5.2709 },
    { name: 'Inmood San Roque', stars: 4, rating: 4.2, dist: '5 min', lat: 36.2658, lng: -5.3355 },
    { name: 'Hotel Piedra Paloma', stars: 3, rating: 4.3, dist: '15 min', lat: 36.3915, lng: -5.2049 }
  ],
  lahacienda: [
    { name: 'SO/ Sotogrande Resort', stars: 5, rating: 4.6, dist: '10 min', lat: 36.2753, lng: -5.3519 },
    { name: 'Inmood San Roque', stars: 4, rating: 4.2, dist: '6 min', lat: 36.2658, lng: -5.3355 },
    { name: 'Hotel Piedra Paloma', stars: 3, rating: 4.3, dist: '12 min', lat: 36.3915, lng: -5.2049 }
  ]
}

export type CourseHotelPickerValue = {
  readonly selectedCourse: string | null
  readonly selectedHotel: NearbyHotel | null
}

const courseIds = new Set(COURSES.map((c) => c.id))

/** Parse `courseId` / `hotelName` from a URL search string (e.g. `window.location.search`). */
export const parseCourseHotelSearch = (search: string): CourseHotelPickerValue => {
  const sp = new URLSearchParams(search)
  const courseId = sp.get('courseId')

  if (!courseId || !courseIds.has(courseId)) {
    return { selectedCourse: null, selectedHotel: null }
  }

  const hotelName = sp.get('hotelName')
  const list = NEARBY_HOTELS[courseId] ?? []
  const selectedHotel = hotelName ? (list.find((h) => h.name === hotelName) ?? null) : null

  return { selectedCourse: courseId, selectedHotel }
}

const LANDING_MAP_SESSION_KEY = 'gsol-landing-course-hotel'

export const readLandingMapFromSessionStorage = (): CourseHotelPickerValue => {
  try {
    const raw = sessionStorage.getItem(LANDING_MAP_SESSION_KEY)
    if (!raw) {
      return { selectedCourse: null, selectedHotel: null }
    }
    const o = JSON.parse(raw) as { selectedCourse?: unknown; selectedHotel?: unknown }
    const sc = typeof o.selectedCourse === 'string' && courseIds.has(o.selectedCourse) ? o.selectedCourse : null
    let sh: NearbyHotel | null = null
    if (sc && o.selectedHotel && typeof o.selectedHotel === 'object' && o.selectedHotel !== null) {
      const name = (o.selectedHotel as { name?: unknown }).name
      if (typeof name === 'string') {
        sh = (NEARBY_HOTELS[sc] ?? []).find((h) => h.name === name) ?? null
      }
    }
    return { selectedCourse: sc, selectedHotel: sh }
  } catch {
    return { selectedCourse: null, selectedHotel: null }
  }
}

export const writeLandingMapToSessionStorage = (value: CourseHotelPickerValue) => {
  try {
    sessionStorage.setItem(
      LANDING_MAP_SESSION_KEY,
      JSON.stringify({ selectedCourse: value.selectedCourse, selectedHotel: value.selectedHotel })
    )
  } catch {
    /* ignore quota / private mode */
  }
}
