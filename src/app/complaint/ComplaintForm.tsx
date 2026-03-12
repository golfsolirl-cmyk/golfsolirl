'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Categories = readonly string[];

export function ComplaintForm({ categories }: { categories: Categories }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('loading');
    try {
      const res = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: data.get('bookingRef'),
          fullName: data.get('fullName'),
          email: data.get('email'),
          travelDate: data.get('travelDate'),
          category: data.get('category'),
          description: data.get('description'),
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      const json = await res.json();
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="bookingRef" label="Booking Reference Number" required placeholder="e.g. GSI-2026-X7K9M" />
      <Input name="fullName" label="Full Name" required />
      <Input name="email" type="email" label="Email" required />
      <Input name="travelDate" type="date" label="Date of Travel" required />
      <label className="block">
        <span className="block text-sm font-semibold text-primary mb-1">Nature of Complaint</span>
        <select
          name="category"
          required
          className="w-full min-h-[var(--touch-min)] px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-focus-ring)]"
        >
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <Textarea name="description" label="Description" required rows={5} />
      {status === 'success' && <p className="text-success text-sm">Thank you. We&apos;ve received your complaint and will respond within 3 business days.</p>}
      {status === 'error' && <p className="text-error text-sm">Something went wrong. Please try again or email info@golfsolireland.com.</p>}
      <Button type="submit" variant="primary" size="md" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Submit complaint'}
      </Button>
    </form>
  );
}
