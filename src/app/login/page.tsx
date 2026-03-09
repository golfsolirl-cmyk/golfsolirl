'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('login-email') as HTMLInputElement)?.value?.trim();
    const password = (form.elements.namedItem('login-password') as HTMLInputElement)?.value;
    if (!email || !password) {
      setStatus('error');
      setErrorMessage('Please enter email and password.');
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await login({ email, password });
      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error.message);
        return;
      }
      setStatus('success');
      if (result.data?.token) router.push('/profile');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center pt-20 bg-background">
      <Container className="py-28 md:py-32 max-w-md">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-primary dark:text-neutral-100">
          Sign in
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Client area for Golf Sol Ireland. Connect your account to manage enquiries.
        </p>
        <form className="mt-10 space-y-6" aria-label="Sign in form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            id="login-email"
            name="login-email"
            type="email"
            autoComplete="email"
            required
            disabled={status === 'loading'}
            placeholder="you@example.com"
            aria-describedby={errorMessage ? 'login-error' : undefined}
          />
          <Input
            label="Password"
            id="login-password"
            name="login-password"
            type="password"
            autoComplete="current-password"
            required
            disabled={status === 'loading'}
          />
          <Link href="/forgot-password" className="block text-sm text-primary dark:text-yellow hover:underline">
            Forgot password?
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={status === 'loading'} loading={status === 'loading'}>
            Sign in
          </Button>
          {status === 'error' && errorMessage && (
            <p id="login-error" className="p-4 rounded-lg bg-error/10 text-error text-sm" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
        <p className="mt-8 text-neutral-600 dark:text-neutral-400">
          No account? <Link href="/signup" className="text-primary dark:text-yellow hover:underline">Sign up</Link>
        </p>
      </Container>
    </div>
  );
}
