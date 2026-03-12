import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) notFound();

  const courses = booking.selectedCourses as string[];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-2xl text-primary uppercase">{booking.bookingRef}</h1>
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm">← Back to list</Button>
        </Link>
      </div>
      <dl className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <dt className="text-muted text-sm">Name</dt><dd>{booking.fullName}</dd>
        <dt className="text-muted text-sm">Email</dt><dd><a href={`mailto:${booking.email}`} className="text-primary hover:underline">{booking.email}</a></dd>
        <dt className="text-muted text-sm">Phone</dt><dd>{booking.phone}</dd>
        <dt className="text-muted text-sm">Package</dt><dd>{booking.packageType}</dd>
        <dt className="text-muted text-sm">Golfers</dt><dd>{booking.numGolfers}</dd>
        <dt className="text-muted text-sm">Departure</dt><dd>{format(booking.departureDate, 'PPP')}</dd>
        <dt className="text-muted text-sm">Return</dt><dd>{format(booking.returnDate, 'PPP')}</dd>
        <dt className="text-muted text-sm">Accommodation</dt><dd>{booking.accommodationTier}</dd>
        <dt className="text-muted text-sm">Status</dt><dd>{booking.status}</dd>
        <dt className="text-muted text-sm">Total</dt><dd>€{Number(booking.totalPrice).toFixed(2)}</dd>
        <dt className="text-muted text-sm">Deposit</dt><dd>€{Number(booking.depositAmount).toFixed(2)} {booking.depositPaidAt && `(paid ${format(booking.depositPaidAt, 'PPP')})`}</dd>
        <dt className="text-muted text-sm">Balance due</dt><dd>€{Number(booking.balanceAmount).toFixed(2)} by {format(booking.balanceDueDate, 'PPP')}</dd>
      </dl>
      {Array.isArray(courses) && courses.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display font-bold text-primary mb-2">Selected courses</h2>
          <ul className="list-disc list-inside text-sm">{courses.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      {booking.specialRequests && (
        <div className="mt-6">
          <h2 className="font-display font-bold text-primary mb-2">Special requests</h2>
          <p className="text-sm text-muted">{booking.specialRequests}</p>
        </div>
      )}
    </>
  );
}
