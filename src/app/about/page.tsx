import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { CONTACT, SITE_NAME } from '@/lib/constants';

export const metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: 'Who we are, why Costa del Sol only, our Irish identity. Meet the team at Golf Sol Ireland.',
};

const WHY_US = [
  'Early morning tee times guaranteed',
  'Irish-speaking team',
  '40+ years combined experience',
  'Fully insured transfers',
];

const TRUST_BADGES = ['Fully insured', 'Irish-owned', 'Costa del Sol specialists'];

export default function AboutPage() {
  return (
    <>
      <section className="relative py-24 md:py-32 bg-primary text-white overflow-hidden" aria-labelledby="about-hero-heading">
        <div className="absolute inset-0 bg-[url('/image.png')] bg-cover bg-center opacity-30" aria-hidden />
        <Container className="relative z-10 text-center">
          <h1 id="about-hero-heading" className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
            About Golf Sol Ireland
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            Your Costa del Sol golf holiday, built by Irish people who know the game and the coast.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="story-heading">
        <Container>
          <h2 id="story-heading" className="section-title text-primary mb-6">
            Our story
          </h2>
          <p className="text-body-readable max-w-3xl mb-6">
            We focus on one thing: golf holidays on the Costa del Sol for Irish golfers. No spreadsheets of every
            destination — just the best courses, the best weather, and a team that speaks your language.
          </p>
          <p className="text-body-readable max-w-3xl mb-6">
            Why Costa del Sol only? Because it works. Málaga Airport is your gateway. The coast has 70+ courses,
            from Valderrama to hidden gems. We arrange tee times, accommodation, and door-to-door transfers so
            you can focus on the round.
          </p>
          <p className="text-body-readable max-w-3xl">
            Our Irish identity means we get what you want: early tee times, no fuss, and a driver who knows the
            craic. We&apos;re here to make your trip seamless.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-surface-alt" aria-labelledby="team-heading">
        <Container>
          <h2 id="team-heading" className="section-title text-primary mb-8">
            Meet the team
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-6 shadow-card border border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xl">
                MK
              </div>
              <h3 className="font-display font-bold text-primary mt-4">{CONTACT.name}</h3>
              <p className="text-muted text-sm mt-1">Founder &amp; your main contact</p>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-card border border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xl">
                ?
              </div>
              <h3 className="font-display font-bold text-primary mt-4">Our drivers</h3>
              <p className="text-muted text-sm mt-1">Irish drivers — more coming soon</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="why-heading">
        <Container>
          <h2 id="why-heading" className="section-title text-primary mb-8">
            Why us
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {WHY_US.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-primary mt-0.5" aria-hidden>✓</span>
                <span className="text-body-readable">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-primary text-white" aria-labelledby="trust-heading">
        <Container>
          <h2 id="trust-heading" className="section-title mb-8 text-white">
            Trust
          </h2>
          <div className="flex flex-wrap gap-4">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="px-4 py-2 rounded-lg bg-white/15 text-sm font-semibold uppercase tracking-wider"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-12">
            <Button href="/booking" variant="white" size="md">
              Book your trip
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
