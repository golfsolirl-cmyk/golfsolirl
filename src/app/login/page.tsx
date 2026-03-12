'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/user';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email.');
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setStatus('error');
        setErrorMessage(result.error);
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center pt-20 bg-background">
      <Container className="py-28 md:py-32 max-w-md">
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-primary dark:text-neutral-100 uppercase">
          Sign in
        </h1>
        <p className="mt-4 text-lg text-muted">
          We&apos;ll send you a magic link. No password needed.
        </p>
        {status === 'success' ? (
          <p className="mt-8 p-4 rounded-lg bg-success-subtle text-success" role="alert">
            Check your email for the sign-in link.
          </p>
        ) : (
          <form className="mt-10 space-y-6" aria-label="Sign in with email" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={status === 'loading'}
              placeholder="you@example.com"
              aria-describedby={errorMessage ? 'login-error' : undefined}
            />
            <Button type="submit" variant="primary" size="md" disabled={status === 'loading'} loading={status === 'loading'}>
              Send magic link
            </Button>
            {status === 'error' && errorMessage && (
              <p id="login-error" className="p-4 rounded-lg bg-error-subtle text-error text-sm" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
        <p className="mt-8 text-muted text-sm">
          <Link href="/" className="text-primary hover:underline">Back to home</Link>
        </p>
      </Container>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-20 bg-background" aria-busy="true">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
