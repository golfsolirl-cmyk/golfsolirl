import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Booking confirmed | Golf Sol Ireland',
  description: 'Your deposit has been received. Balance due within 14 days.',
};

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function BookingConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id) {
    return (
      <Container className="py-24 max-w-xl">
        <h1 className="font-display font-black text-2xl text-primary uppercase">No session</h1>
        <p className="mt-4 text-muted">No checkout session found. If you just paid, wait a moment and refresh.</p>
        <Button href="/booking" variant="primary" size="md" className="mt-6">Back to booking</Button>
      </Container>
    );
  }

  let bookingRef = '';
  let email = '';

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['payment_intent'] });
      const bookingId = session.metadata?.bookingId ?? (session.client_reference_id as string | null);
      email = (session.customer_email as string) ?? (session.customer_details?.email ?? '');
      if (bookingId) {
        const b = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: { bookingRef: true, status: true },
        });
        if (b) bookingRef = b.bookingRef;
      }
    } catch {
      // session may not be available yet (webhook delay)
    }
  }

  return (
    <Container className="py-24 max-w-xl">
      <h1 className="font-display font-black text-3xl md:text-4xl text-primary uppercase">
        Booking confirmed
      </h1>
      <p className="mt-4 text-lg text-muted">
        Thank you. Your deposit has been received.
      </p>
      {bookingRef && (
        <p className="mt-4 p-4 rounded-xl bg-primary/10 text-primary font-mono font-bold">
          Booking reference: {bookingRef}
        </p>
      )}
      <p className="mt-6 text-muted">
        We&apos;ve sent a confirmation email to {email || 'you'} with your booking reference and balance due date (within 14 days).
      </p>
      <p className="mt-4 text-sm text-muted">
        Deposits are non-refundable except if cancelled within 48 hours of booking. Keep your booking ID for any changes or complaints.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button href="/user" variant="primary" size="md">View my bookings</Button>
        <Button href="/" variant="outline" size="md">Back to home</Button>
      </div>
    </Container>
  );
}
