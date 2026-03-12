import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import {
  generateBookingRef,
  PACKAGE_PRICES,
  getDepositAmount,
  getBalanceDueDate,
} from '@/lib/booking';
import type { PackageType } from '@prisma/client';

const schema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  packageType: z.enum(['STARTER', 'CLASSIC', 'PREMIUM', 'CUSTOM']),
  numGolfers: z.number().int().min(4).max(8),
  departureDate: z.string().min(1),
  returnDate: z.string().min(1),
  selectedCourses: z.array(z.string()),
  accommodationTier: z.string().min(1),
  specialRequests: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields', details: parsed.error.flatten() }, { status: 400 });
    }
    const {
      fullName,
      email,
      phone,
      packageType,
      numGolfers,
      departureDate,
      returnDate,
      selectedCourses,
      accommodationTier,
      specialRequests,
    } = parsed.data;

    const depDate = new Date(departureDate);
    const retDate = new Date(returnDate);
    const pricePerPerson = PACKAGE_PRICES[packageType as PackageType];
    const totalCents = Math.round(pricePerPerson * numGolfers * 100);
    const depositCents = getDepositAmount(totalCents);
    const balanceDueDate = getBalanceDueDate(new Date());

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: fullName, phone, role: 'USER' },
      });
    }

    const bookingRef = generateBookingRef();
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: user.id,
        fullName,
        email,
        phone,
        packageType: packageType as PackageType,
        numGolfers,
        departureDate: depDate,
        returnDate: retDate,
        selectedCourses: selectedCourses as object,
        accommodationTier,
        specialRequests: specialRequests ?? null,
        totalPrice: totalCents / 100,
        depositAmount: depositCents / 100,
        balanceAmount: (totalCents - depositCents) / 100,
        balanceDueDate,
        status: 'PENDING',
      },
    });

    if (!stripe) {
      return NextResponse.json({
        ok: true,
        bookingId: booking.id,
        bookingRef,
        message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable payment.',
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Golf Sol Ireland — ${packageType} (deposit 20%)`,
              description: `${numGolfers} golfers, ${depDate.toLocaleDateString('en-IE')} – ${retDate.toLocaleDateString('en-IE')}. Balance due within 14 days.`,
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: booking.id,
      success_url: `${appUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/booking?cancelled=1`,
      metadata: { bookingId: booking.id },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url, bookingId: booking.id });
  } catch (e) {
    console.error('Booking create error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
