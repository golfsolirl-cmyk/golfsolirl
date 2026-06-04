import { CinematicSection } from './cinematic-section'

const BLOCKS = [
  {
    kicker: 'Arrival',
    title: 'Málaga met. Luggage handled. Tee times waiting.',
    body: 'Your driver meets you in arrivals with a name board, golf bags stowed with care, and a quiet Mercedes cabin to decompress after the flight. No queues, no guesswork — just the start of a proper week.',
    imageKey: 'transfers' as const,
    imageRight: false
  },
  {
    kicker: 'Fairways',
    title: 'Courses chosen for Irish golfers, not brochure filler.',
    body: 'We route your rounds around travel time, challenge, and the kind of golf you actually want to play — from iconic resort tracks to quieter gems the crowds skip.',
    imageKey: 'courses' as const,
    imageRight: true
  },
  {
    kicker: 'Stay',
    title: 'Resorts and hotels that feel worth the flight.',
    body: 'Curated stays near the fairways — from crisp resort rooms to villas that suit your fourball. Package-ready when you want simplicity; bespoke when you want control.',
    imageKey: 'resorts' as const,
    imageRight: false
  },
  {
    kicker: 'Fleet',
    title: 'Mercedes throughout — E-Class, V-Class, Sprinter when the group grows.',
    body: 'Air-conditioned, professionally presented, and sized for clubs plus luggage. The fleet is the physical promise of how seriously we take the service.',
    imageKey: 'fleet' as const,
    imageRight: true
  },
  {
    kicker: 'Gear',
    title: 'Golf-bag friendly by design, not as an afterthought.',
    body: 'Long-wheelbase options, careful loading, and drivers who understand that your clubs are not “just another suitcase”.',
    imageKey: 'bags' as const,
    imageRight: false
  },
  {
    kicker: 'Rest',
    title: 'Accommodation that anchors the trip.',
    body: 'We align where you sleep with where you play — less time in transit, more time on the terrace with the sun dropping behind the hills.',
    imageKey: 'stay' as const,
    imageRight: true
  },
  {
    kicker: 'Irish desk',
    title: 'Irish coordinators who pick up the phone.',
    body: 'Direct lines to people who know the coast, the courses, and how Irish groups like to travel. You are not ticketing a call centre.',
    imageKey: 'support' as const,
    imageRight: false
  },
  {
    kicker: 'Whole week',
    title: 'Premium golf weeks, orchestrated end to end.',
    body: 'Packages, custom builds, societies, and celebrations — one itinerary, one team, one standard of care from first enquiry to last transfer home.',
    imageKey: 'experience' as const,
    imageRight: true
  }
] as const

export function CinematicTopicSections() {
  return (
    <div className="relative bg-gradient-to-b from-forest-950 via-[#0d1f12] to-forest-950">

      {BLOCKS.map((b, index) => (
        <CinematicSection
          key={b.title}
          id={index === 0 ? 'cin-story' : undefined}
          kicker={b.kicker}
          title={b.title}
          body={b.body}
          imageKey={b.imageKey}
          imageRight={b.imageRight}
        />
      ))}
    </div>
  )
}
