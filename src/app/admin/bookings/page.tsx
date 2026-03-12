import Link from 'next/link';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display font-black text-2xl text-primary uppercase">Bookings</h1>
        <a href="/admin/bookings/export" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">Export CSV</Button>
        </a>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-semibold">Ref</th>
              <th className="text-left py-2 font-semibold">Name</th>
              <th className="text-left py-2 font-semibold">Email</th>
              <th className="text-left py-2 font-semibold">Package</th>
              <th className="text-left py-2 font-semibold">Golfers</th>
              <th className="text-left py-2 font-semibold">Dates</th>
              <th className="text-left py-2 font-semibold">Status</th>
              <th className="text-left py-2 font-semibold">Deposit</th>
              <th className="text-left py-2 font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border/50">
                <td className="py-2 font-mono">
                  <Link href={`/admin/bookings/${b.id}`} className="text-primary hover:underline">{b.bookingRef}</Link>
                </td>
                <td className="py-2">{b.fullName}</td>
                <td className="py-2">{b.email}</td>
                <td className="py-2">{b.packageType}</td>
                <td className="py-2">{b.numGolfers}</td>
                <td className="py-2">{format(b.departureDate, 'dd MMM yyyy')} – {format(b.returnDate, 'dd MMM yyyy')}</td>
                <td className="py-2">{b.status}</td>
                <td className="py-2">€{Number(b.depositAmount).toFixed(2)}</td>
                <td className="py-2">€{Number(b.balanceAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
