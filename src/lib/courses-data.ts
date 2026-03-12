/** Costa del Sol golf courses for map and booking (Master Plan 4.2) */
export type CourseMapItem = {
  name: string;
  lat: number;
  lng: number;
  par: number;
  holes: number;
  town: string;
};

export const COURSES_MAP: CourseMapItem[] = [
  { name: 'Real Club Valderrama', lat: 36.2938, lng: -5.1566, par: 71, holes: 18, town: 'Sotogrande' },
  { name: 'La Zagaleta New Course', lat: 36.4823, lng: -5.0123, par: 70, holes: 18, town: 'Benahavís' },
  { name: 'Flamingos Golf Club', lat: 36.4789, lng: -5.0987, par: 72, holes: 18, town: 'Estepona' },
  { name: 'Finca Cortesín', lat: 36.3912, lng: -5.2341, par: 72, holes: 18, town: 'Casares' },
  { name: 'La Cala Resort (Asia)', lat: 36.5012, lng: -4.9876, par: 73, holes: 18, town: 'Mijas' },
  { name: 'La Cala Resort (America)', lat: 36.5023, lng: -4.9854, par: 71, holes: 18, town: 'Mijas' },
  { name: 'La Cala Resort (Europa)', lat: 36.5034, lng: -4.9841, par: 72, holes: 18, town: 'Mijas' },
  { name: 'Marbella Club Golf Resort', lat: 36.5341, lng: -4.9765, par: 71, holes: 18, town: 'Marbella' },
  { name: 'Aloha Golf Club', lat: 36.4945, lng: -4.9876, par: 72, holes: 18, town: 'Nueva Andalucía' },
  { name: 'Los Naranjos Golf Club', lat: 36.4912, lng: -4.9812, par: 72, holes: 18, town: 'Nueva Andalucía' },
  { name: 'La Quinta Golf', lat: 36.4834, lng: -5.0123, par: 71, holes: 18, town: 'Benahavís' },
  { name: 'Marbella Golf & Country Club', lat: 36.5123, lng: -4.9234, par: 72, holes: 18, town: 'Marbella' },
  { name: 'Golf El Paraíso', lat: 36.4398, lng: -5.1456, par: 71, holes: 18, town: 'Estepona' },
  { name: 'Estepona Golf', lat: 36.4123, lng: -5.1678, par: 72, holes: 18, town: 'Estepona' },
  { name: 'Real Club de Golf Guadalhorce', lat: 36.6789, lng: -4.5432, par: 72, holes: 18, town: 'Málaga' },
  { name: 'Torrequebrada Golf', lat: 36.5567, lng: -4.6234, par: 72, holes: 18, town: 'Benalmádena' },
  { name: 'Cabopino Golf Marbella', lat: 36.5023, lng: -4.7654, par: 71, holes: 18, town: 'Marbella East' },
  { name: 'Lauro Golf Resort', lat: 36.6012, lng: -4.6789, par: 72, holes: 18, town: 'Alhaurín de la Torre' },
  { name: 'Golf Antequera', lat: 37.0123, lng: -4.5678, par: 72, holes: 18, town: 'Antequera' },
  { name: 'Mijas Golf (Los Lagos)', lat: 36.5234, lng: -4.8956, par: 71, holes: 18, town: 'Mijas' },
];

export const AREA_FILTERS = ['Marbella', 'Estepona', 'Sotogrande', 'Málaga', 'Mijas'] as const;
