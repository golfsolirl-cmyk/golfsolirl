import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <Container className="py-12 md:py-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-primary dark:text-neutral-100">
          Your profile
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Manage your details and saved golf trip enquiries.
        </p>
        <div className="mt-10 p-8 bg-background-elevated dark:bg-neutral-200 rounded-xl border border-neutral-200 dark:border-neutral-600 space-y-6">
          <div>
            <span className="block text-sm font-light text-neutral-500 dark:text-neutral-400">Name</span>
            <span className="text-lg text-neutral-900 dark:text-neutral-100">—</span>
          </div>
          <div>
            <span className="block text-sm font-light text-neutral-500 dark:text-neutral-400">Email</span>
            <span className="text-lg text-neutral-900 dark:text-neutral-100">—</span>
          </div>
        </div>
        <p className="mt-8 text-neutral-600 dark:text-neutral-400">
          Sign in to see your profile. Authentication can be wired to your backend when ready.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="primary" size="md">
            Sign in
          </Button>
        </Link>
      </Container>
    </div>
  );
}
