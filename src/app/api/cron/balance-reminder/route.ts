import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addDays, startOfDay } from 'date-fns';

/** Vercel Cron: call GET with Authorization: Bearer CRON_SECRET. Sends balance reminder to bookings whose balance is due in 14 days. */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const in14Days = startOfDay(addDays(new Date(), 14));
  const nextDay = addDays(in14Days, 1);
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'DEPOSIT_PAID',
      balanceDueDate: { gte: in14Days, lt: nextDay },
    },
  });

  let sent = 0;
  if (process.env.RESEND_API_KEY && bookings.length > 0) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM ?? 'noreply@golfsolireland.com';
    for (const b of bookings) {
      try {
        await resend.emails.send({
          from,
          to: b.email,
          subject: `Balance due in 14 days — ${b.bookingRef} | Golf Sol Ireland`,
          text: `Hi ${b.fullName},\n\nYour final payment of €${Number(b.balanceAmount).toFixed(2)} for booking ${b.bookingRef} is due in 14 days (${b.balanceDueDate.toLocaleDateString('en-IE', { dateStyle: 'long' })}).\n\nPlease contact us to pay the balance.\n\nGolf Sol Ireland`,
        });
        sent++;
      } catch (e) {
        console.error('Balance reminder send failed', b.id, e);
      }
    }
  }

  return NextResponse.json({ ok: true, dueIn14Days: bookings.length, sent });
}
