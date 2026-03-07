import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center pt-20">
      <Container className="py-28 md:py-32 max-w-md">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-darkgreen dark:text-offwhite">
          Create account
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Register for updates and to save your golf trip preferences.
        </p>
        <form className="mt-10 space-y-6" aria-label="Sign up form">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-light text-darkgreen dark:text-offwhite mb-2">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-darkgreen/10 text-darkgreen dark:text-offwhite focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-light text-darkgreen dark:text-offwhite mb-2">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-darkgreen/10 text-darkgreen dark:text-offwhite focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-light text-darkgreen dark:text-offwhite mb-2">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-darkgreen/10 text-darkgreen dark:text-offwhite focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Create account
          </Button>
        </form>
        <p className="mt-8 text-gray-700 dark:text-gray-300">
          Already have an account? <Link href="/login" className="text-primary dark:text-gold hover:underline">Sign in</Link>
        </p>
      </Container>
    </div>
  );
}
