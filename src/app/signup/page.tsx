'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { register } from '@/lib/api';

export default function SignupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('signup-name') as HTMLInputElement)?.value?.trim();
    const email = (form.elements.namedItem('signup-email') as HTMLInputElement)?.value?.trim();
    const password = (form.elements.namedItem('signup-password') as HTMLInputElement)?.value;
    if (!name || !email || !password) {
      setStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await register({ name, email, password });
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
          Create account
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Register for updates and to save your golf trip preferences.
        </p>
        <form className="mt-10 space-y-6" aria-label="Sign up form" onSubmit={handleSubmit} noValidate>
          <Input label="Name" id="signup-name" name="signup-name" type="text" autoComplete="name" required disabled={status === 'loading'} />
          <Input
            label="Email"
            id="signup-email"
            name="signup-email"
            type="email"
            autoComplete="email"
            required
            disabled={status === 'loading'}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            id="signup-password"
            name="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={status === 'loading'}
          />
          <Button type="submit" variant="primary" size="md" disabled={status === 'loading'} loading={status === 'loading'}>
            Create account
          </Button>
          {status === 'success' && (
            <p className="p-4 rounded-lg bg-success/10 text-success text-sm dark:text-success-foreground dark:bg-success/20" role="status">
              Account created. You can now <Link href="/login" className="underline font-semibold">sign in</Link>.
            </p>
          )}
          {status === 'error' && errorMessage && (
            <p className="p-4 rounded-lg bg-error/10 text-error text-sm" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
        <p className="mt-8 text-neutral-600 dark:text-neutral-400">
          Already have an account? <Link href="/login" className="text-primary dark:text-yellow hover:underline">Sign in</Link>
        </p>
      </Container>
    </div>
  );
}
