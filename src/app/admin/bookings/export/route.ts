import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });

  const headers = [
    'Booking Ref',
    'Name',
    'Email',
    'Phone',
    'Package',
    'Golfers',
    'Departure',
    'Return',
    'Status',
    'Total',
    'Deposit',
    'Balance',
    'Balance Due',
    'Created',
  ];
  const rows = bookings.map((b) => [
    b.bookingRef,
    b.fullName,
    b.email,
    b.phone,
    b.packageType,
    String(b.numGolfers),
    format(b.departureDate, 'yyyy-MM-dd'),
    format(b.returnDate, 'yyyy-MM-dd'),
    b.status,
    String(Number(b.totalPrice)),
    String(Number(b.depositAmount)),
    String(Number(b.balanceAmount)),
    format(b.balanceDueDate, 'yyyy-MM-dd'),
    format(b.createdAt, 'yyyy-MM-dd HH:mm'),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookings-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
    },
  });
}
