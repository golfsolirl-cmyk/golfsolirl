'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormSchema } from '@/lib/validation';
import { submitContact } from '@/lib/api';
import { CONTACT } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

/** Contact section — compelling CTA and form. Generated: perfect golf tour / tailor-made holiday. */
const CONTACT_IMAGE = '/contact-perfect-golf-tour.jpg';

const CONTACT_POP_LINES = [
  'Personal reply from Martin',
  'No obligation',
  'Costa del Sol expertise',
];

export function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [popInView, setPopInView] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPopInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormSchema) => {
    setStatus('loading');
    setErrorMessage(null);
    const result = await submitContact(data);
    if (result.error) {
      setStatus('error');
      setErrorMessage(result.error.message);
      return;
    }
    setStatus('success');
    reset();
  };

  return (
    <section id="contact" className="py-24 md:py-32 pb-20 bg-cream relative overflow-hidden" aria-labelledby="contact-heading">
      {/* Animated blob behind left column */}
      <div
        className="blob-animate absolute w-[420px] h-[400px] -left-32 top-1/2 -translate-y-1/2 rounded-[42%_58%_55%_45%_/_60%_44%_56%_40%] bg-green-mid opacity-75 pointer-events-none z-0"
        aria-hidden
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="blob-animate absolute w-[280px] h-[260px] top-0 right-0 rounded-[50%_50%_45%_55%_/_55%_45%_50%_50%] bg-green-mint opacity-60 pointer-events-none z-0"
        aria-hidden
        style={{ animationDelay: '-6s' }}
      />
      <Container className="relative z-10">
        <div
          ref={popRef}
          className={`contact-pop-wrap reveal flex flex-wrap justify-center gap-6 md:gap-10 py-6 md:py-8 mb-8 rounded-2xl bg-white/80 border border-border/50 shadow-card ${popInView ? 'contact-pop-in' : ''}`}
        >
          {CONTACT_POP_LINES.map((text, i) => (
            <span
              key={text}
              className="contact-pop-line flex items-center gap-3 text-primary text-lg md:text-xl font-bold"
            >
              <span className="text-primary flex-shrink-0" aria-hidden>✓</span>
              {text}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div className="reveal relative">
            <span className="section-label">Get in touch</span>
            <h2 id="contact-heading" className="section-title mt-1">
              Let us design your <span className="block text-accent">perfect golf tour</span>
            </h2>
            <p className="mt-6 text-base md:text-lg text-muted leading-relaxed">
              Tell us your dates and what you want — we&apos;ll put together a tailor-made Costa del Sol itinerary for you. Questions? Just ask. We typically reply within 24 hours.
            </p>
            <div className="mt-8 relative z-10">
              <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden shadow-card border-2 border-white">
                <Image
                  src={CONTACT_IMAGE}
                  alt="Golf course Costa del Sol — tailor-made holidays for Irish golfers"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            </div>
            <div className="mt-8 space-y-2">
              <p className="text-primary font-semibold uppercase text-sm">{CONTACT.name}</p>
              <p className="text-muted text-sm">{CONTACT.companyName}</p>
              <p className="text-muted text-base">
                <a href={`tel:${CONTACT.phoneE164}`} className="text-primary hover:underline hover:text-muted font-semibold">{CONTACT.phone}</a>
                {' '}({CONTACT.phoneE164})
              </p>
            </div>
          </div>
          <div className="reveal">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-card border border-border/50">
              <h3 className="font-display font-bold text-primary text-xl uppercase tracking-tight mb-6">
                Send your enquiry
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Contact form" noValidate>
                <Input label="First name" error={errors.name?.message} {...register('name')} className="border-border text-primary" />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} className="border-border text-primary" />
                <Textarea label="Your message (dates, courses, group size…)" rows={5} error={errors.message?.message} {...register('message')} className="border-border text-primary" />
                <Button type="submit" variant="submit" disabled={status === 'loading'} className="w-full sm:w-auto">
                  {status === 'loading' ? 'Sending…' : 'Send my enquiry'}
                </Button>
              </form>
              {status === 'success' && (
                <p className="mt-5 p-4 rounded-lg bg-green-mint/30 text-primary font-semibold" role="status">
                  Thanks! Martin will get back to you shortly — usually within 24 hours.
                </p>
              )}
              {status === 'error' && errorMessage && (
                <p className="mt-5 p-4 rounded-lg bg-red-50 text-primary font-semibold" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
      <SectionWave fill="#123811" />
    </section>
  );
}
