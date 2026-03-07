import type { NavItem, GolfPackage, Course, Accommodation, Testimonial, Step } from '@/types';

export const SITE_NAME = 'Golf Sol Ireland';
export const SITE_DESCRIPTION = 'Premium golf holidays in Costa del Sol for Irish golfers. Tailor-made packages, tee times, accommodation & transfers. Costa del Sol only.';

export const CONTACT = {
  name: 'Martin Kelly',
  companyName: 'Golf Sol Ireland',
  phone: '086 600 6202',
  phoneE164: '+353 86 600 6202',
};

/** Social links — replace with real URLs when available. WhatsApp uses CONTACT.phoneE164. */
export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
  { label: 'WhatsApp', href: `https://wa.me/${CONTACT.phoneE164.replace(/\D/g, '')}`, icon: 'whatsapp' },
] as const;

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/#hero' },
  { label: 'Golf Packages', href: '/#packages' },
  { label: 'Golf Courses', href: '/#courses' },
  { label: 'Accommodation', href: '/#accommodation' },
  { label: 'Plan Your Trip', href: '/#how-it-works' },
  { label: 'Contact', href: '/#contact' },
];

/* Golf Experience–style packages: Costa del Sol only, Irish audience. Images: Unsplash. */
export const PACKAGES: GolfPackage[] = [
  {
    id: 'weekend',
    label: 'Weekend',
    title: 'Short break',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=85',
    imageAlt: 'Golf course with sea view, Costa del Sol',
    href: '/#contact',
  },
  {
    id: '4day',
    label: '4 days',
    title: 'Costa del Sol golf trip',
    image: 'https://images.unsplash.com/photo-1593111774240-d529f12bb716?w=600&q=85',
    imageAlt: 'Fairway and green, Costa del Sol',
    href: '/#contact',
  },
  {
    id: 'luxury',
    label: '7 days',
    title: 'Week in the sun',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=85',
    imageAlt: 'Golfer on course, sunny Costa del Sol',
    href: '/#contact',
  },
  {
    id: 'custom',
    label: 'Tailor-made',
    title: 'Your perfect itinerary',
    image: 'https://images.unsplash.com/photo-1514939775309-a8bb013b2f2d?w=600&q=85',
    imageAlt: 'Tailor-made golf holiday Costa del Sol',
    href: '/#contact',
  },
];

export const COURSES: Course[] = [
  { name: 'Real Club Valderrama', description: 'Europe\'s No. 1 course. Home to the Volvo Masters and host of the 1997 Ryder Cup. A must-play.' },
  { name: 'La Zagaleta (New Course)', description: 'Par-70 course that merges golf with nature. Stunning green tongues and gorgeous surroundings.' },
  { name: 'Flamingos Golf Club', description: 'Between Marbella and Estepona. Challenging layout with breathtaking Mediterranean and mountain views.' },
  { name: 'Finca Cortesín', description: 'Immaculate conditioning near Casares. Stunning design and championship standard.' },
  { name: 'La Cala Resort', description: 'Three 18-hole courses in one resort. Mountain and sea views. Popular with Irish societies.' },
  { name: 'Marbella Club Golf Resort', description: 'Classic resort golf with a relaxed, premium feel. Easy transfer from Málaga.' },
];

export const ACCOMMODATIONS: Accommodation[] = [
  {
    title: 'Golf & beach resorts',
    description: 'Stay and play at the best resorts on the Costa del Sol. Pools, spa, dining — we have preferential rates and better cancellation terms.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    imageAlt: 'Golf resort Costa del Sol',
  },
  {
    title: 'Beachfront hotels',
    description: 'Wake up to the Med. We arrange transfers to your chosen courses so you can combine beach and golf.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    imageAlt: 'Beachfront hotel Costa del Sol',
  },
  {
    title: 'Luxury golf resorts',
    description: 'Five-star stays with direct access to championship courses. Popular with Irish groups and societies.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
    imageAlt: 'Luxury golf resort Costa del Sol',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  { quote: 'Our tailor-made trip was spot on. Flights from Dublin, three courses, great hotel. Martin sorted everything — tee times, transfers, the lot. We just turned up and played.', author: 'David', location: 'Dublin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', stars: 5 },
  { quote: 'Our society had a brilliant week on the Costa del Sol. Valderrama was the highlight. Golf Sol Ireland made it stress-free from start to finish.', author: 'Sarah', location: 'Cork', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', stars: 5 },
  { quote: 'Exactly what we wanted — sun, golf, and no hassle. Booked from Galway, got a custom itinerary. Will use them again.', author: 'Michael', location: 'Galway', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', stars: 5 },
];

export const STEPS: Step[] = [
  { number: 1, title: 'Let\'s tee off — choose your dates' },
  { number: 2, title: 'Choose your Costa del Sol courses' },
  { number: 3, title: 'Choose your accommodation' },
  { number: 4, title: 'We send your itinerary — you fly and play' },
];
