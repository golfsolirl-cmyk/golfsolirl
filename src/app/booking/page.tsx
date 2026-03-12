import { Suspense } from 'react';
import { Container } from '@/components/layout/Container';
import { BookingForm } from '@/components/booking/BookingForm';

export const metadata = {
  title: 'Book Now | Golf Sol Ireland',
  description: 'Book your Costa del Sol golf holiday. 20% deposit, balance within 14 days. 4–8 people.',
};

export default function BookingPage() {
  return (
    <>
      <section className="relative py-16 md:py-24 bg-primary text-white overflow-hidden" aria-labelledby="booking-hero-heading">
        <Container className="relative z-10 text-center">
          <h1 id="booking-hero-heading" className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">
            Book your trip
          </h1>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            20% deposit today, 80% balance within 14 days. Min 4 / max 8 people.
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="form-heading">
        <Container className="max-w-2xl">
          <h2 id="form-heading" className="section-title text-primary mb-6">
            Booking form
          </h2>
          <Suspense fallback={<p className="text-muted">Loading form…</p>}>
            <BookingForm />
          </Suspense>
          <p className="mt-6 text-sm text-muted">
            Deposits are non-refundable except if cancelled within 48 hours of booking. Booking ID required for all cancellations.
          </p>
        </Container>
      </section>
    </>
  );
}
