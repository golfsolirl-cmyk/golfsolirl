import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login?callbackUrl=/user');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-raised py-4">
        <Container>
          <nav className="flex items-center justify-between">
            <Link href="/user" className="font-display font-bold text-primary uppercase">
              My account
            </Link>
            <div className="flex gap-4">
              <Link href="/user" className="text-sm text-muted hover:text-primary">My bookings</Link>
              <Link href="/" className="text-sm text-muted hover:text-primary">Home</Link>
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
