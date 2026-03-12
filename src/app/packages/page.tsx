import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Packages | Golf Sol Ireland',
  description: 'Costa del Sol golf packages: Starter, Classic, Premium. From €895 pp. 4–8 people, transfers included.',
};

const PACKAGES = [
  {
    id: 'starter',
    name: 'Costa del Sol Starter',
    tag: null,
    nights: 4,
    rounds: 3,
    hotel: '3-star hotel (TBC)',
    points: ['Transfers from Málaga Airport', 'Early morning tee times guaranteed', 'Min 4 / Max 8 people'],
    fromPrice: 895,
    href: '/booking?package=starter',
  },
  {
    id: 'classic',
    name: 'Costa del Sol Classic',
    tag: 'MOST POPULAR',
    nights: 6,
    rounds: 4,
    hotel: '4-star hotel (TBC)',
    points: ['Transfers from Málaga Airport', 'Early morning tee times guaranteed', '1 premium course (Valderrama / Finca Cortesín etc.)', 'Min 4 / Max 8 people'],
    fromPrice: 1195,
    href: '/booking?package=classic',
  },
  {
    id: 'premium',
    name: 'Costa del Sol Premium',
    tag: null,
    nights: 7,
    rounds: 5,
    hotel: '5-star resort (TBC)',
    points: ['Transfers from Málaga Airport', '2 premium courses included', 'Early morning tee times guaranteed', 'Caddie/buggy options available', 'Min 4 / Max 8 people'],
    fromPrice: 1795,
    href: '/booking?package=premium',
  },
];

export default function PackagesPage() {
  return (
    <>
      <section className="relative py-24 md:py-32 bg-primary text-white overflow-hidden" aria-labelledby="packages-hero-heading">
        <Container className="relative z-10 text-center">
          <h1 id="packages-hero-heading" className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
            Golf packages
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            Costa del Sol only. Tailor-made for 4–8 people. Transfers and tee times included.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="tiers-heading">
        <Container>
          <h2 id="tiers-heading" className="sr-only">
            Package tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {PACKAGES.map((pkg) => (
              <article
                key={pkg.id}
                className={`relative rounded-2xl border-2 overflow-hidden bg-background shadow-card transition-all hover:shadow-cardHover ${
                  pkg.tag ? 'border-primary md:scale-[1.02]' : 'border-border'
                }`}
              >
                {pkg.tag && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                    ⭐ {pkg.tag}
                  </span>
                )}
                <div className="p-6 md:p-8">
                  <h3 className="font-display font-bold text-primary text-xl md:text-2xl">
                    {pkg.name}
                  </h3>
                  <p className="mt-2 text-muted text-sm">
                    {pkg.nights} nights / {pkg.rounds} rounds of golf
                  </p>
                  <p className="mt-1 text-body-readable text-sm">{pkg.hotel}</p>
                  <ul className="mt-6 space-y-2 text-sm text-muted">
                    {pkg.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="text-primary">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 font-display font-black text-2xl text-primary">
                    From €{pkg.fromPrice} <span className="text-base font-semibold text-muted">pp</span>
                  </p>
                  <div className="mt-6">
                    <Button href={pkg.href} variant="primary" size="md">
                      Book now
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
