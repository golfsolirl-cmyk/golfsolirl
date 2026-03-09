'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/constants';

/**
 * LOGO ANALYSIS (public/logo.svg)
 * — Shapes: Organic vector paths (curves, flowing); complex geometry; 1024×1024 viewBox.
 * — Palette: #07190A (deep green-black), #044E19 (dark green), #FEF495 (warm cream/yellow).
 * — Style: Premium leisure, golf/nature, trust; not minimal—substantial visual weight.
 * — Personality: Premium product / top-tier leisure brand (golf, Irish, Costa del Sol).
 *
 * BRAND TEXT DESIGN
 * — Matches icon: green family + optional warm accent; clear hierarchy (GolfSol > Ireland > tagline).
 * — Typography: Concept 1 = DM Sans (clean SaaS), Concept 2 = Outfit (bold tech), Concept 3 = Playfair (premium).
 * — Enhancements: gradient text, letter-spacing, subtle glow, hover transitions.
 *
 * THREE LOCKUP CONCEPTS
 * 1. SaaS — Clean, minimal, highly readable; tight spacing; DM Sans.
 * 2. Tech  — Bold, gradient/futuristic; Outfit; more letter-spacing, glow.
 * 3. Premium — Elegant serif, luxury spacing; Playfair; subtle glow.
 */

const ShamrockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="6" rx="5" ry="7" transform="rotate(-10 12 6)" />
    <ellipse cx="6.5" cy="14" rx="5" ry="7" transform="rotate(50 6.5 14)" />
    <ellipse cx="17.5" cy="14" rx="5" ry="7" transform="rotate(-50 17.5 14)" />
    <path d="M11 14v6c0 .5.4 1 1 1s1-.5 1-1v-6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

export type LogoConcept =
  | 'saas'
  | 'tech'
  | 'premium'
  | 'retro'
  | 'neon'
  | 'minimal'
  | 'script'
  | 'badge'
  | 'outline'
  | 'stacked'
  | 'brutalist'
  | 'luxe'
  | 'gradient-mesh'
  | 'irish-script';

export type LogoVariant = 'header' | 'footer' | 'hero';

type LogoProps = {
  variant?: LogoVariant;
  concept?: LogoConcept;
  className?: string;
  asLink?: boolean;
  onClick?: () => void;
};

const ICON_SIZES = {
  header: 'max-md:h-24 max-md:w-24 md:h-[104px] md:w-[104px]',
  footer: 'h-16 w-16 sm:h-[72px] sm:w-[72px] md:h-[104px] md:w-[104px]',
  hero: 'h-28 w-28 md:h-36 md:w-36',
} as const;

const WORDMARK_SIZE = {
  header: 'text-2xl max-md:text-3xl sm:text-2xl md:text-3xl',
  footer: 'text-xl sm:text-2xl md:text-3xl',
  hero: 'text-3xl md:text-4xl lg:text-5xl',
} as const;

const IRELAND_SIZE = {
  header: 'max-md:text-xl text-sm sm:text-base md:text-lg',
  footer: 'text-sm sm:text-base md:text-lg',
  hero: 'text-lg md:text-xl lg:text-2xl',
} as const;

const SHAMROCK_SIZE = {
  header: 'w-5 h-5 max-md:w-7 max-md:h-7 sm:w-5 sm:h-5 md:w-5 md:h-5',
  footer: 'w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5',
  hero: 'w-6 h-6 md:w-7 md:h-7',
} as const;

const TAGLINE_SIZE = {
  header: 'text-[11px] md:text-xs',
  footer: 'text-[11px] md:text-xs',
  hero: 'text-sm md:text-base',
} as const;

export function Logo({
  variant = 'header',
  concept = 'premium',
  className = '',
  asLink = true,
  onClick,
}: LogoProps) {
  const isDark = variant === 'footer';
  const iconMargin = variant === 'header' ? '-mb-4 sm:-mb-5 md:-mb-6' : '';

  const isStacked = concept === 'stacked';
  const isBadge = concept === 'badge';

  const content = (
    <>
      <span className={cn('logo-3d flex-shrink-0 block', isDark && 'logo-3d--dark', !isStacked && iconMargin, isStacked && 'mx-auto')}>
        <span className="logo-3d-inner block">
          <Image
            src="/logo.svg"
            alt=""
            width={120}
            height={120}
            className={cn('object-contain block', ICON_SIZES[variant])}
          />
        </span>
      </span>
      <span
        className={cn(
          'logo-text-content flex flex-col justify-center gap-0.5 min-w-0 max-md:min-w-0 max-md:truncate',
          isStacked && 'items-center text-center',
          `logo-lockup-${concept}`
        )}
      >
        <span className={cn('flex items-baseline gap-2 flex-wrap', isStacked && 'justify-center')}>
          {isBadge ? (
            <span className="logo-badge-wrapper inline-flex items-baseline gap-2 flex-wrap">
              <span
                className={cn(
                  'leading-none logo-wordmark logo-wordmark-main logo-badge font-body font-bold',
                  WORDMARK_SIZE[variant],
                  variant === 'footer' ? 'text-white' : 'text-primary dark:text-white'
                )}
              >
                GolfSol
              </span>
              <span className="flex items-center gap-1.5">
                <ShamrockIcon className={cn('flex-shrink-0', variant === 'footer' ? 'text-white' : 'text-primary dark:text-white', SHAMROCK_SIZE[variant])} />
                <span className={cn('leading-none logo-wordmark logo-wordmark-ireland logo-badge font-body font-semibold', IRELAND_SIZE[variant], variant === 'footer' ? 'text-white' : 'text-primary dark:text-white')}>
                  Ireland
                </span>
              </span>
            </span>
          ) : (
            <>
              <span
                className={cn(
                  'leading-none logo-wordmark logo-wordmark-main',
              concept === 'saas' && 'font-body font-bold',
              concept === 'tech' && 'font-outfit font-extrabold',
              (concept === 'premium' || concept === 'luxe') && 'font-display font-black',
              concept === 'retro' && 'font-body font-bold',
              concept === 'neon' && 'font-outfit font-extrabold',
              concept === 'minimal' && 'font-body font-light',
              (concept === 'script' || concept === 'irish-script') && 'font-script font-bold',
                  concept === 'outline' && 'font-outfit font-extrabold',
                  concept === 'stacked' && 'font-display font-black',
                  concept === 'brutalist' && 'font-outfit font-extrabold uppercase',
                  concept === 'gradient-mesh' && 'font-outfit font-extrabold',
                  WORDMARK_SIZE[variant],
                  variant === 'footer' ? 'text-white' : 'text-primary dark:text-white'
                )}
              >
                GolfSol
              </span>
              <span className="flex items-center gap-1.5">
                <ShamrockIcon className={cn('flex-shrink-0', variant === 'footer' ? 'text-white' : 'text-primary dark:text-white', SHAMROCK_SIZE[variant])} />
                <span
                  className={cn(
                    'leading-none logo-wordmark logo-wordmark-ireland',
                    concept === 'saas' && 'font-body font-semibold',
                    concept === 'tech' && 'font-outfit font-bold',
                    (concept === 'premium' || concept === 'luxe') && 'font-display font-black',
                    concept === 'retro' && 'font-body font-semibold',
                    concept === 'neon' && 'font-outfit font-bold',
                    concept === 'minimal' && 'font-body font-normal',
                    (concept === 'script' || concept === 'irish-script') && 'font-script font-semibold',
                    concept === 'outline' && 'font-outfit font-bold',
                    concept === 'stacked' && 'font-display font-bold',
                    concept === 'brutalist' && 'font-outfit font-bold uppercase',
                    concept === 'gradient-mesh' && 'font-outfit font-bold',
                    IRELAND_SIZE[variant],
                    variant === 'footer' ? 'text-white' : 'text-primary dark:text-white'
                  )}
                >
                  Ireland
                </span>
              </span>
            </>
          )}
        </span>
        <span
          className={cn(
            'block font-medium tracking-wide leading-tight logo-tagline',
            TAGLINE_SIZE[variant],
            variant === 'header' && 'text-muted dark:text-white/90',
            variant === 'footer' && 'text-white/80',
            variant === 'hero' && 'text-muted dark:text-white/90'
          )}
        >
          The future of your golf trip
        </span>
      </span>
    </>
  );

  const wrapperClassName = cn(
    'flex min-w-0 max-md:flex-shrink md:flex-shrink-0 overflow-hidden logo-link',
    isStacked ? 'flex-col items-center gap-3' : 'items-center',
    !isStacked && (concept === 'saas' || concept === 'irish-script') && 'gap-2 md:gap-2.5',
    !isStacked && concept === 'tech' && 'gap-3 md:gap-4',
    !isStacked && concept === 'premium' && 'gap-2 md:gap-3',
    !isStacked && (concept === 'retro' || concept === 'script') && 'gap-2 md:gap-3',
    !isStacked && (concept === 'neon' || concept === 'brutalist' || concept === 'gradient-mesh') && 'gap-3 md:gap-4',
    !isStacked && concept === 'minimal' && 'gap-4 md:gap-6',
    !isStacked && concept === 'badge' && 'gap-2',
    !isStacked && concept === 'outline' && 'gap-3',
    !isStacked && concept === 'luxe' && 'gap-4 md:gap-5',
    className
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className={cn(wrapperClassName, 'py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary')}
        aria-label={`${SITE_NAME} home`}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
