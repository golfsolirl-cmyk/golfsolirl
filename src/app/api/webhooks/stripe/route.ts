import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId ?? (session.client_reference_id as string | null);
    if (!bookingId) {
      return NextResponse.json({ error: 'No booking id in session' }, { status: 400 });
    }
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'DEPOSIT_PAID',
        depositPaidAt: new Date(),
        stripePaymentId: paymentIntentId ?? undefined,
      },
    });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (booking && process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com';
      const balanceDue = booking.balanceDueDate.toLocaleDateString('en-IE', { dateStyle: 'long' });
      try {
        const { render } = await import('@react-email/render');
        const { BookingConfirmation } = await import('@/emails/BookingConfirmation');
        const html = await render(
          BookingConfirmation({
            bookingRef: booking.bookingRef,
            fullName: booking.fullName,
            departureDate: booking.departureDate.toLocaleDateString('en-IE'),
            returnDate: booking.returnDate.toLocaleDateString('en-IE'),
            packageType: booking.packageType,
            numGolfers: booking.numGolfers,
            depositEur: String(Number(booking.depositAmount)),
            balanceEur: String(Number(booking.balanceAmount)),
            balanceDueDate: balanceDue,
          })
        );
        await resend.emails.send({
          from,
          to: booking.email,
          subject: `Booking confirmed — ${booking.bookingRef} | Golf Sol Ireland`,
          html,
        });
        await resend.emails.send({
          from,
          to: process.env.EMAIL_ADMIN ?? 'info@golfsolireland.com',
          subject: `New booking: ${booking.bookingRef} — ${booking.fullName}`,
          html: `<p>Booking ${booking.bookingRef}: ${booking.fullName}, ${booking.email}, ${booking.packageType}, ${booking.numGolfers} golfers. Deposit paid.</p>`,
        });
      } catch (e) {
        console.error('Stripe webhook: email send failed', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
