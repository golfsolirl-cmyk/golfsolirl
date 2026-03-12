import { prisma } from '@/lib/db';
import { format } from 'date-fns';

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <h1 className="font-display font-black text-2xl text-primary uppercase">Enquiries</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-semibold">Date</th>
              <th className="text-left py-2 font-semibold">Name</th>
              <th className="text-left py-2 font-semibold">Email</th>
              <th className="text-left py-2 font-semibold">Phone</th>
              <th className="text-left py-2 font-semibold">Replied</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id} className="border-b border-border/50">
                <td className="py-2">{format(e.createdAt, 'dd MMM yyyy HH:mm')}</td>
                <td className="py-2">{e.fullName}</td>
                <td className="py-2">
                  <a href={`mailto:${e.email}`} className="text-primary hover:underline">{e.email}</a>
                </td>
                <td className="py-2">{e.phone}</td>
                <td className="py-2">{e.replied ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {enquiries.length === 0 && <p className="mt-4 text-muted">No enquiries yet.</p>}
    </>
  );
}
