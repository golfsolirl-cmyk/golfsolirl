import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const schema = z.object({
  fullName: z.string().min(1, 'Name required'),
  email: z.string().email(),
  phone: z.string().min(1, 'Phone required'),
  message: z.string().min(1, 'Message required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 });
    }
    const { fullName, email, phone, message } = parsed.data;

    await prisma.enquiry.create({
      data: { fullName, email, phone, message },
    });

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com',
        to: email,
        subject: "We've received your enquiry — Golf Sol Ireland",
        text: `Hi ${fullName},\n\nWe've received your enquiry and will reply within 24 hours.\n\nBest,\nGolf Sol Ireland`,
      });
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com',
        to: 'info@golfsolireland.com',
        subject: `Enquiry from ${fullName}`,
        text: `From: ${fullName}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Contact API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
