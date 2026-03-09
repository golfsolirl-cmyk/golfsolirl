'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterFormSchema, type NewsletterFormSchema } from '@/lib/validation';
import Image from 'next/image';
import { submitNewsletter } from '@/lib/api';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const NEWSLETTER_IMAGE = '/golf-courses-overlap-1.jpg';

export function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormSchema>({
    resolver: zodResolver(newsletterFormSchema),
  });

  const onSubmit = async (data: NewsletterFormSchema) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await submitNewsletter(data);
      if (result.error) {
        setStatus('error');
        setErrorMessage(result.error.message);
        return;
      }
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="newsletter" className="py-24 md:py-32 pb-20 bg-primary relative overflow-hidden" aria-labelledby="newsletter-heading">
      <div className="blob-animate absolute w-[300px] h-[280px] -right-20 top-1/2 -translate-y-1/2 rounded-full bg-yellow/20 opacity-60 pointer-events-none" aria-hidden />
      <div className="blob-animate absolute w-[200px] h-[200px] -left-10 bottom-0 rounded-full bg-green-light/30 opacity-50 pointer-events-none" aria-hidden style={{ animationDelay: '-4s' }} />
      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: image + badge */}
          <div className="reveal order-2 lg:order-1 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-card rotate-[-2deg] transition-transform duration-slow hover:rotate-0">
                <Image
                  src={NEWSLETTER_IMAGE}
                  alt="Golf courses and deals for Irish golfers"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" aria-hidden />
              </div>
              <div className="absolute -bottom-4 -right-4 lg:right-0 bg-yellow text-primary px-5 py-3 rounded-xl shadow-card border-2 border-white">
                <span className="font-display font-black text-2xl leading-none block">Deals</span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">& early tips</span>
              </div>
            </div>
          </div>

          {/* Right: copy + form card */}
          <div className="reveal order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-yellow/90 text-primary text-xs font-bold uppercase tracking-wider mb-5">
              Exclusive for Irish golfers
            </span>
            <h2 id="newsletter-heading" className="section-title text-white">
              <span className="newsletter-headline-outline">Costa del Sol golf</span>{' '}
              <span className="text-yellow">deals & tips</span>
            </h2>
            <p className="mt-4 font-script text-xl md:text-2xl text-yellow">
              Join our newsletter — no spam, just early access.
            </p>
            <ul className="mt-6 space-y-2 text-cream text-sm">
              <li className="flex items-center gap-2">
                <span className="text-yellow" aria-hidden>✓</span> New courses & seasonal rates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow" aria-hidden>✓</span> Package deals before anyone else
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow" aria-hidden>✓</span> Useful info for your next trip
              </li>
            </ul>
            <div className="mt-8 p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <form
                className="flex flex-col sm:flex-row gap-3 items-end sm:items-stretch"
                onSubmit={handleSubmit(onSubmit)}
                aria-label="Newsletter signup"
                noValidate
              >
                <div className="flex-1 min-w-0 space-y-0">
                  <Input
                    id="newsletter-email"
                    type="email"
                    label="Email address"
                    labelClassName="sr-only"
                    placeholder="Your email"
                    error={errors.email?.message}
                    disabled={status === 'loading'}
                    className="border-2 border-white/30 bg-white text-primary placeholder:text-neutral-500 focus:ring-yellow focus:border-yellow"
                    errorClassName="text-yellow"
                    {...register('email')}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={status === 'loading'}
                  loading={status === 'loading'}
                  className="flex-shrink-0 min-h-[48px]"
                >
                  {status === 'loading' ? 'Submitting…' : 'Get deals'}
                </Button>
              </form>
              {status === 'success' && (
                <p className="mt-4 text-yellow font-semibold" role="status">
                  You&apos;re in! We&apos;ll send deals and tips to your inbox.
                </p>
              )}
              {status === 'error' && errorMessage && (
                <p className="mt-4 text-yellow font-semibold" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
      <SectionWave variant="cream" />
    </section>
  );
}
