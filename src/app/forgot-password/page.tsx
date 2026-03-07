import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center pt-20">
      <Container className="py-28 md:py-32 max-w-md">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-darkgreen dark:text-offwhite">
          Forgot password
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form className="mt-10 space-y-6" aria-label="Forgot password form">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-light text-darkgreen dark:text-offwhite mb-2">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-darkgreen/10 text-darkgreen dark:text-offwhite focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Send reset link
          </Button>
        </form>
        <p className="mt-8 text-gray-700 dark:text-gray-300">
          <Link href="/login" className="text-primary dark:text-gold hover:underline">Back to sign in</Link>
        </p>
      </Container>
    </div>
  );
}
