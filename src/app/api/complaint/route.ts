import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  bookingRef: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  travelDate: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 });
    }
    const { bookingRef, fullName, email, travelDate, category, description } = parsed.data;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com',
        to: email,
        subject: 'We\'ve received your complaint — Golf Sol Ireland',
        text: `Hi ${fullName},\n\nWe've received your complaint (ref: ${bookingRef}) and will respond within 3 business days.\n\nBest,\nGolf Sol Ireland`,
      });
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com',
        to: 'info@golfsolireland.com',
        subject: `Complaint: ${category} — ${bookingRef}`,
        text: `Booking: ${bookingRef}\nName: ${fullName}\nEmail: ${email}\nTravel date: ${travelDate}\nCategory: ${category}\n\n${description}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Complaint API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
