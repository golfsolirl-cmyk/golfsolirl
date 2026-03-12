import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }
  const role = (session.user as { role?: string }).role;
  if (role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-raised py-4">
        <Container>
          <nav className="flex items-center justify-between">
            <Link href="/admin" className="font-display font-bold text-primary uppercase">
              Admin
            </Link>
            <div className="flex gap-4">
              <Link href="/admin" className="text-sm text-muted hover:text-primary">Dashboard</Link>
              <Link href="/admin/bookings" className="text-sm text-muted hover:text-primary">Bookings</Link>
              <Link href="/admin/enquiries" className="text-sm text-muted hover:text-primary">Enquiries</Link>
              <Link href="/" className="text-sm text-muted hover:text-primary">Site</Link>
            </div>
          </nav>
        </Container>
      </header>
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
