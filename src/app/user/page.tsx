import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const userId = (session.user as { id?: string }).id;
  const bookings = await prisma.booking.findMany({
    where: userId ? { userId } : { user: { email: session.user.email } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <h1 className="font-display font-black text-2xl text-primary uppercase">My bookings</h1>
      <p className="mt-2 text-muted">Bookings for {session.user.email}</p>
      {bookings.length === 0 ? (
        <div className="mt-8 p-8 rounded-2xl bg-surface border border-border text-center">
          <p className="text-muted">You have no bookings yet.</p>
          <Button href="/booking" variant="primary" size="md" className="mt-4">Book a trip</Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-primary">{b.bookingRef}</span>
                <span className="text-sm text-muted">{b.status}</span>
              </div>
              <p className="mt-2 text-sm">{b.packageType} · {b.numGolfers} golfers</p>
              <p className="text-sm text-muted">{format(b.departureDate, 'dd MMM yyyy')} – {format(b.returnDate, 'dd MMM yyyy')}</p>
              <p className="text-sm mt-1">Deposit €{Number(b.depositAmount).toFixed(2)} · Balance €{Number(b.balanceAmount).toFixed(2)} due {format(b.balanceDueDate, 'dd MMM yyyy')}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
