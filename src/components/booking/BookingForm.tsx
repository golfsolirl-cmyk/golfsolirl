'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { COURSES_MAP } from '@/lib/courses-data';
import { PACKAGE_PRICES, getDepositAmount } from '@/lib/booking';
import { cn } from '@/lib/utils';

type PackageOption = {
  id: string;
  label: string;
  price: number;
  nights: number;
  rounds: number;
  popular?: boolean;
};

const PACKAGES: PackageOption[] = [
  { id: 'STARTER', label: 'Starter', price: PACKAGE_PRICES.STARTER, nights: 4, rounds: 3 },
  { id: 'CLASSIC', label: 'Classic', price: PACKAGE_PRICES.CLASSIC, nights: 6, rounds: 4, popular: true },
  { id: 'PREMIUM', label: 'Premium', price: PACKAGE_PRICES.PREMIUM, nights: 7, rounds: 5 },
  { id: 'CUSTOM', label: 'Custom', price: PACKAGE_PRICES.CUSTOM, nights: 0, rounds: 0 },
];

const ACCOMMODATION_OPTIONS = [
  { value: '3-star', label: '3-Star Hotel (we recommend based on your courses)' },
  { value: '4-star', label: '4-Star Hotel (we recommend based on your courses)' },
  { value: '5-star', label: '5-Star Resort (we recommend based on your courses)' },
  { value: 'specific', label: 'Specific property (describe in notes)' },
];

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  packageType: string;
  numGolfers: number;
  departureDate: string;
  returnDate: string;
  selectedCourses: string[];
  accommodationTier: string;
  specialRequests: string;
};

const initial: FormData = {
  fullName: '',
  email: '',
  phone: '',
  packageType: 'CLASSIC',
  numGolfers: 4,
  departureDate: '',
  returnDate: '',
  selectedCourses: [],
  accommodationTier: '4-star',
  specialRequests: '',
};

export function BookingForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(() => {
    const p = searchParams.get('package');
    const pack = p ? String(p).toUpperCase() : 'CLASSIC';
    return { ...initial, packageType: ['STARTER', 'CLASSIC', 'PREMIUM', 'CUSTOM'].includes(pack) ? pack : 'CLASSIC' };
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof FormData, v: FormData[keyof FormData]) => setForm((f) => ({ ...f, [k]: v }));

  const numGolfers = form.numGolfers;
  const pricePerPerson = PACKAGES.find((p) => p.id === form.packageType)?.price ?? PACKAGE_PRICES.CLASSIC;
  const totalCents = pricePerPerson * numGolfers * 100;
  const depositCents = getDepositAmount(totalCents);
  const depositEur = (depositCents / 100).toFixed(2);
  const balanceEur = ((totalCents - depositCents) / 100).toFixed(2);
  const totalEur = (totalCents / 100).toFixed(2);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          packageType: form.packageType,
          numGolfers: form.numGolfers,
          departureDate: form.departureDate,
          returnDate: form.returnDate,
          selectedCourses: form.selectedCourses,
          accommodationTier: form.accommodationTier,
          specialRequests: form.specialRequests || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.message ?? 'Booking created but Stripe not configured.');
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const toggleCourse = (name: string) => {
    setForm((f) => ({
      ...f,
      selectedCourses: f.selectedCourses.includes(name)
        ? f.selectedCourses.filter((c) => c !== name)
        : [...f.selectedCourses, name],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <nav aria-label="Booking steps" className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-semibold transition-colors',
              step === s ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted hover:bg-border'
            )}
            aria-current={step === s ? 'step' : undefined}
          >
            {s}
          </button>
        ))}
      </nav>

      {/* Step 1: Your Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-primary text-xl">Your details</h2>
          <Input label="Full name" name="fullName" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          <Input label="Phone (Irish format)" name="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required placeholder="087 123 4567" />
          <Button type="button" variant="primary" size="md" onClick={() => setStep(2)}>Next</Button>
        </div>
      )}

      {/* Step 2: Package + Golfers + Dates */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="font-display font-bold text-primary text-xl">Your package</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PACKAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update('packageType', p.id)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-colors',
                  form.packageType === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
              >
                <span className="font-display font-bold text-primary">{p.label}</span>
                {p.popular && <span className="ml-2 text-xs font-semibold text-primary">MOST POPULAR</span>}
                <p className="text-sm text-muted mt-1">From €{p.price} pp</p>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Number of golfers (4–8)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update('numGolfers', Math.max(4, form.numGolfers - 1))}
                className="w-10 h-10 rounded-lg border border-border font-bold text-primary hover:bg-surface"
                aria-label="Decrease"
              >−</button>
              <span className="w-8 text-center font-display font-bold">{form.numGolfers}</span>
              <button
                type="button"
                onClick={() => update('numGolfers', Math.min(8, form.numGolfers + 1))}
                className="w-10 h-10 rounded-lg border border-border font-bold text-primary hover:bg-surface"
                aria-label="Increase"
              >+</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Departure date" name="departureDate" type="date" value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} required />
            <Input label="Return date" name="returnDate" type="date" value={form.returnDate} onChange={(e) => update('returnDate', e.target.value)} required />
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" size="md" onClick={() => setStep(1)}>Back</Button>
            <Button type="button" variant="primary" size="md" onClick={() => setStep(3)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 3: Golf courses */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-primary text-xl">Golf courses</h2>
          <p className="text-sm text-muted">Final tee times confirmed upon booking.</p>
          <div className="max-h-64 overflow-y-auto border border-border rounded-xl p-4 space-y-2">
            {COURSES_MAP.map((c) => (
              <label key={c.name} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.selectedCourses.includes(c.name)}
                  onChange={() => toggleCourse(c.name)}
                  className="rounded border-border"
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" size="md" onClick={() => setStep(2)}>Back</Button>
            <Button type="button" variant="primary" size="md" onClick={() => setStep(4)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 4: Accommodation */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-primary text-xl">Accommodation</h2>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Preference</label>
            <select
              value={form.accommodationTier}
              onChange={(e) => update('accommodationTier', e.target.value)}
              className="w-full min-h-[var(--touch-min)] px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
            >
              {ACCOMMODATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Textarea label="Special requests / notes" name="specialRequests" value={form.specialRequests} onChange={(e) => update('specialRequests', e.target.value)} rows={4} optional />
          <div className="flex gap-4">
            <Button type="button" variant="outline" size="md" onClick={() => setStep(3)}>Back</Button>
            <Button type="button" variant="primary" size="md" onClick={() => setStep(5)}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Pay */}
      {step === 5 && (
        <div className="space-y-6">
          <h2 className="font-display font-bold text-primary text-xl">Review & pay</h2>
          <dl className="grid sm:grid-cols-2 gap-2 text-sm">
            <dt className="text-muted">Name</dt><dd>{form.fullName}</dd>
            <dt className="text-muted">Email</dt><dd>{form.email}</dd>
            <dt className="text-muted">Package</dt><dd>{form.packageType}</dd>
            <dt className="text-muted">Golfers</dt><dd>{form.numGolfers}</dd>
            <dt className="text-muted">Dates</dt><dd>{form.departureDate} – {form.returnDate}</dd>
            <dt className="text-muted">Courses</dt><dd>{form.selectedCourses.length} selected</dd>
          </dl>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <p className="font-display font-bold text-primary">Price summary</p>
            <p className="text-muted text-sm mt-1">€{pricePerPerson} pp × {numGolfers} = €{totalEur} total</p>
            <p className="mt-2">20% deposit due today: <strong>€{depositEur}</strong></p>
            <p className="text-sm text-muted">80% balance (€{balanceEur}) due within 14 days of booking.</p>
          </div>
          <p className="text-sm text-muted">Deposits are non-refundable except if cancelled within 48 hours of booking.</p>
          {error && <p className="text-error text-sm" role="alert">{error}</p>}
          <div className="flex gap-4">
            <Button type="button" variant="outline" size="md" onClick={() => setStep(4)} disabled={submitting}>Back</Button>
            <Button type="button" variant="primary" size="md" onClick={handleSubmit} loading={submitting} disabled={submitting}>Pay deposit (€{depositEur})</Button>
          </div>
        </div>
      )}
    </div>
  );
}
