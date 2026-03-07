import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center pt-20">
      <Container className="py-28 md:py-32 max-w-md">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-darkgreen dark:text-offwhite">
          Sign in
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Client area for Golf Sol Ireland. Connect your account to manage enquiries.
        </p>
        <form className="mt-10 space-y-6" aria-label="Sign in form">
          <div>
            <label htmlFor="login-email" className="block text-sm font-light text-darkgreen dark:text-offwhite mb-2">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-darkgreen/10 text-darkgreen dark:text-offwhite focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-light text-darkgreen dark:text-offwhite mb-2">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-darkgreen/10 text-darkgreen dark:text-offwhite focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Link href="/forgot-password" className="block text-sm text-primary dark:text-gold hover:underline">
            Forgot password?
          </Link>
          <Button type="submit" variant="primary" size="md">
            Sign in
          </Button>
        </form>
        <p className="mt-8 text-gray-700 dark:text-gray-300">
          No account? <Link href="/signup" className="text-primary dark:text-gold hover:underline">Sign up</Link>
        </p>
      </Container>
    </div>
  );
}
