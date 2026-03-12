import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Transfers | Golf Sol Ireland',
  description: 'Door-to-door Málaga Airport to the course. Mercedes vans, Irish drivers, fully insured. Included in every package.',
};

const BULLETS = [
  { icon: '🚐', title: 'Mercedes Vans', text: 'Comfortable, air-conditioned, premium vehicles' },
  { icon: '🇮🇪', title: 'Irish Drivers', text: 'Your driver is Irish, knows the craic' },
  { icon: '💬', title: 'Managed Tips Welcome', text: 'No awkward moments' },
  { icon: '🛡️', title: 'Fully Insured', text: 'Peace of mind from the moment you land' },
  { icon: '✈️', title: 'Málaga Airport Pickup & Drop-off', text: 'Included in every package' },
];

const STEPS = [
  'Land at Málaga (AGP)',
  'Your Irish driver meets you at arrivals',
  'Comfortable transfer to your hotel or course',
  'Same service for every round and for your return to the airport',
];

const FAQ = [
  { q: 'What if my flight is delayed?', a: 'We track your flight. Your driver will be there when you land — no extra charge for reasonable delays.' },
  { q: 'How many people fit in the van?', a: 'Our Mercedes vans take your group of 4–8 plus bags and clubs with room to spare.' },
  { q: 'Are tips included?', a: 'Tips are at your discretion. Many groups tip the driver; we’ll never add it automatically.' },
];

export default function TransfersPage() {
  return (
    <>
      <section className="relative py-24 md:py-32 bg-primary text-white overflow-hidden" aria-labelledby="transfers-hero-heading">
        <Container className="relative z-10 text-center">
          <h1 id="transfers-hero-heading" className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
            Transfers included
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto text-lg">
            Door to door — Málaga Airport to the course. Every package.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="included-heading">
        <Container>
          <h2 id="included-heading" className="section-title text-primary mb-10">
            What you get
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BULLETS.map((item) => (
              <li key={item.title} className="flex gap-4 items-start p-4 rounded-xl bg-surface border border-border/50">
                <span className="text-2xl flex-shrink-0" aria-hidden>{item.icon}</span>
                <div>
                  <h3 className="font-display font-bold text-primary">{item.title}</h3>
                  <p className="text-muted text-sm mt-1">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="font-script text-xl md:text-2xl text-primary mt-12 text-center">
            Land at Málaga. Your Irish driver is already waiting.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-surface-alt" aria-labelledby="process-heading">
        <Container>
          <h2 id="process-heading" className="section-title text-primary mb-8">
            Airport pickup process
          </h2>
          <ol className="list-decimal list-inside space-y-4 max-w-xl text-body-readable">
            {STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="faq-heading">
        <Container>
          <h2 id="faq-heading" className="section-title text-primary mb-8">
            FAQ
          </h2>
          <dl className="space-y-6 max-w-2xl">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-display font-bold text-primary">{item.q}</dt>
                <dd className="mt-2 text-muted text-body-readable">{item.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-primary text-white text-center">
        <Container>
          <p className="text-lg text-white/90 mb-6">Ready to book? Transfers are included in every package.</p>
          <Button href="/booking" variant="white" size="md">
            Book now
          </Button>
        </Container>
      </section>
    </>
  );
}
