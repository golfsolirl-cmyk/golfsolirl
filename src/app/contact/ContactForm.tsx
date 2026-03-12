'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.get('fullName'),
          email: data.get('email'),
          phone: data.get('phone'),
          message: data.get('message'),
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="fullName" label="Full Name (required)" required placeholder="Your name" />
      <Input name="email" type="email" label="Email (required)" required placeholder="you@example.com" />
      <Input name="phone" type="tel" label="Phone Number (required)" required placeholder="087 123 4567" />
      <Textarea name="message" label="Message / Enquiry (required)" required placeholder="Tell us about your trip..." rows={5} />
      {status === 'success' && <p className="text-success text-sm">Thanks. We&apos;ve received your enquiry and will reply within 24 hours.</p>}
      {status === 'error' && <p className="text-error text-sm">Something went wrong. Please try again or call us.</p>}
      <Button type="submit" variant="primary" size="md" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send enquiry'}
      </Button>
    </form>
  );
}
