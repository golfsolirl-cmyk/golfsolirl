import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/Button';

export default async function AdminDashboardPage() {
  const [bookings, enquiries, unreadEnquiries] = await Promise.all([
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { replied: false } }),
  ]);

  const totalBookings = await prisma.booking.count();
  const depositPaid = await prisma.booking.findMany({ where: { status: 'DEPOSIT_PAID' }, select: { depositAmount: true } });
  const depositsTotal = depositPaid.reduce((s, b) => s + Number(b.depositAmount), 0);
  const balanceDue = await prisma.booking.findMany({ where: { status: { in: ['DEPOSIT_PAID', 'BALANCE_DUE'] } }, select: { balanceAmount: true } });
  const balanceTotal = balanceDue.reduce((s, b) => s + Number(b.balanceAmount), 0);
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const bookingsThisMonth = await prisma.booking.count({ where: { createdAt: { gte: thisMonth } } });

  return (
    <>
      <h1 className="font-display font-black text-2xl text-primary uppercase">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted uppercase">Total bookings</p>
          <p className="text-2xl font-display font-bold text-primary">{totalBookings}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted uppercase">Deposits received</p>
          <p className="text-2xl font-display font-bold text-primary">€{depositsTotal.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted uppercase">Balances outstanding</p>
          <p className="text-2xl font-display font-bold text-primary">€{balanceTotal.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted uppercase">Bookings this month</p>
          <p className="text-2xl font-display font-bold text-primary">{bookingsThisMonth}</p>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-primary">Enquiries</h2>
        <span className="text-muted">{unreadEnquiries} unread of {enquiries} total</span>
      </div>
      <div className="mt-4">
        <Button href="/admin/bookings" variant="primary" size="md">View all bookings</Button>
        <Button href="/admin/enquiries" variant="outline" size="md" className="ml-4">View enquiries</Button>
      </div>
      <div className="mt-8">
        <h2 className="font-display font-bold text-xl text-primary mb-4">Recent bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold">Ref</th>
                <th className="text-left py-2 font-semibold">Name</th>
                <th className="text-left py-2 font-semibold">Package</th>
                <th className="text-left py-2 font-semibold">Status</th>
                <th className="text-left py-2 font-semibold">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border/50">
                  <td className="py-2 font-mono">{b.bookingRef}</td>
                  <td className="py-2">{b.fullName}</td>
                  <td className="py-2">{b.packageType}</td>
                  <td className="py-2">{b.status}</td>
                  <td className="py-2">€{Number(b.depositAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
