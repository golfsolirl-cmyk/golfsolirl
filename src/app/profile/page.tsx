import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container className="py-12 md:py-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-darkgreen dark:text-offwhite">
          Your profile
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Manage your details and saved golf trip enquiries.
        </p>
        <div className="mt-10 p-8 bg-sand dark:bg-sand rounded-2xl space-y-6">
          <div>
            <span className="block text-sm font-light text-darkgreen/70 dark:text-offwhite/70">Name</span>
            <span className="text-lg text-darkgreen dark:text-offwhite">—</span>
          </div>
          <div>
            <span className="block text-sm font-light text-darkgreen/70 dark:text-offwhite/70">Email</span>
            <span className="text-lg text-darkgreen dark:text-offwhite">—</span>
          </div>
        </div>
        <p className="mt-8 text-gray-700 dark:text-gray-300">
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
