'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('forgot-email') as HTMLInputElement)?.value?.trim();
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email.');
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await forgotPassword({ email });
      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error.message);
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
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-primary dark:text-neutral-100">
          Forgot password
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form className="mt-10 space-y-6" aria-label="Forgot password form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            id="forgot-email"
            name="forgot-email"
            type="email"
            autoComplete="email"
            required
            disabled={status === 'loading'}
            placeholder="you@example.com"
          />
          <Button type="submit" variant="primary" size="md" disabled={status === 'loading'} loading={status === 'loading'}>
            Send reset link
          </Button>
          {status === 'success' && (
            <p className="p-4 rounded-lg bg-success/10 text-success text-sm dark:text-success-foreground dark:bg-success/20" role="status">
              If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
            </p>
          )}
          {status === 'error' && errorMessage && (
            <p className="p-4 rounded-lg bg-error/10 text-error text-sm" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
        <p className="mt-8 text-neutral-600 dark:text-neutral-400">
          <Link href="/login" className="text-primary dark:text-yellow hover:underline">Back to sign in</Link>
        </p>
      </Container>
    </div>
  );
}
