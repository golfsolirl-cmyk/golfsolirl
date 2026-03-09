'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SectionWave } from '@/components/ui/SectionWave';

/** Hero: golf ball on lip of hole, golden hour — local asset */
const HERO_IMAGE = '/hero-golf-ball.png';

/** Hero background: same golf ball on lip of hole as circular image */
const HERO_BG_IMAGE = '/image.png';

/** Pa'lais-style hero: script eyebrow, headline, circular image, animated blobs visible around/behind */
export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden bg-background pb-20" aria-label="Hero">
      {/* Background: hero golf ball image — behind everything */}
      <div className="absolute inset-0 z-[0]" aria-hidden>
        <Image
          src={HERO_BG_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>
      {/* Overlay for readability — warm cream tint */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-cream/50 via-cream/35 to-cream/60 pointer-events-none" aria-hidden />
      {/* Putting-green blobs — varied shades, on top of overlay so they’re visible */}
      <div
        className="blob-animate absolute z-[2] w-[520px] h-[480px] -top-24 -right-40 rounded-[63%_37%_54%_46%_/_55%_48%_52%_45%] bg-green-putting opacity-85 pointer-events-none"
        aria-hidden
      />
      <div
        className="blob-animate absolute z-[2] w-[380px] h-[340px] bottom-20 -left-24 rounded-[42%_58%_35%_65%_/_60%_44%_56%_40%] bg-green-fairway opacity-75 pointer-events-none"
        aria-hidden
        style={{ animationDelay: '-4s' }}
      />
      <div
        className="blob-animate absolute z-[2] w-[200px] h-[180px] top-1/3 left-[10%] rounded-[60%_40%_50%_50%_/_50%_60%_40%_50%] bg-green-mid opacity-70 pointer-events-none hidden md:block"
        aria-hidden
        style={{ animationDelay: '-8s' }}
      />
      <div
        className="blob-animate absolute z-[2] w-[140px] h-[140px] top-[45%] right-[8%] md:right-[18%] rounded-[50%_50%_45%_55%_/_55%_45%_50%_50%] bg-green-lime opacity-65 pointer-events-none hidden md:block"
        aria-hidden
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="blob-animate absolute z-[2] w-[260px] h-[220px] bottom-[15%] right-[5%] rounded-[55%_45%_60%_40%_/_50%_55%_45%_55%] bg-green-pale opacity-60 pointer-events-none hidden md:block"
        aria-hidden
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="blob-animate absolute z-[2] w-[180px] h-[160px] top-[20%] left-[25%] rounded-[45%_55%_50%_50%_/_55%_45%_55%_45%] bg-green-mint opacity-55 pointer-events-none hidden md:block"
        aria-hidden
        style={{ animationDelay: '-1s' }}
      />

      <Container className="relative z-10 w-full py-16 md:py-20">
        <div className="grid md:grid-cols-2 items-center gap-12 md:gap-16">
          <div className="reveal">
            <span className="font-script text-lg md:text-xl text-muted dark:text-[#2d6b3a] block mb-3">
              Design your golf package
            </span>
            <h1 className="hero-headline font-display text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] uppercase tracking-tighter mb-4">
              <span className="hero-headline-word">Your</span>{' '}
              <span className="hero-headline-word">tailor-made</span>
              <br />
              <span className="hero-headline-word">golf</span>{' '}
              <span className="hero-headline-word">holiday</span>
            </h1>
            <span className="hero-subline hero-subline-shine font-script text-2xl md:text-[28px] block mb-9">
              Costa del Sol only · Irish golfers · No hassle
            </span>
            <div className="flex flex-wrap gap-4">
              <Button href="#contact" variant="primary" size="md">
                Enquire now
              </Button>
              <Button href="#packages" variant="primary" size="md">
                Design your package
              </Button>
            </div>
          </div>

          <div className="reveal visible reveal-delay-1 flex justify-center items-center relative">
            <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full overflow-hidden border-[6px] border-white shadow-hero relative z-10">
              <Image
                src={HERO_IMAGE}
                alt="Golf ball on the lip of the hole, Costa del Sol"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 320px, 420px"
                priority
              />
            </div>
            <div
              className="hero-bubble-pulse absolute -bottom-2 -left-4 z-10 bg-yellow rounded-full w-28 h-28 md:w-32 md:h-32 flex items-center justify-center font-script text-lg md:text-xl text-muted dark:text-black font-bold text-center leading-snug rotate-[-12deg] shadow-card py-3 px-3"
              aria-hidden
            >
              Play in the sun!
            </div>
          </div>
        </div>
      </Container>

      <SectionWave variant="cream" />
    </section>
  );
}
