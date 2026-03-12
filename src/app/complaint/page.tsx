import { Container } from '@/components/layout/Container';
import { ComplaintForm } from './ComplaintForm';

export const metadata = {
  title: 'Complaint | Golf Sol Ireland',
  description: 'Submit a complaint or feedback. We aim to respond within 3 business days.',
};

const CATEGORIES = ['Transfer', 'Accommodation', 'Golf Course', 'Tee Time', 'Payment', 'Other'] as const;

export default function ComplaintPage() {
  return (
    <>
      <section className="relative py-24 md:py-32 bg-primary text-white overflow-hidden" aria-labelledby="complaint-hero-heading">
        <Container className="relative z-10 text-center">
          <h1 id="complaint-hero-heading" className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
            Complaint or feedback
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            We take every complaint seriously. Please provide your booking reference and we&apos;ll respond within 3 business days.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="form-heading">
        <Container className="max-w-xl">
          <h2 id="form-heading" className="section-title text-primary mb-6">
            Submit a complaint
          </h2>
          <ComplaintForm categories={CATEGORIES} />
        </Container>
      </section>
    </>
  );
}
