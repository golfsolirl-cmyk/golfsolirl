import type { Config } from 'tailwindcss';

/**
 * Golf Sol — design system: premium, clean, Costa del Sol / Irish golfers.
 * Primary = dark green (trust, golf). Accent = warm orange (CTAs that pop).
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Semantic — use these for consistency */
        primary: '#123811',
        'primary-foreground': '#FFFFFF',
        accent: '#E07B39',
        'accent-hover': '#C96828',
        surface: '#F5F0E8',
        'surface-alt': '#C8DCF0',
        muted: '#0d2d0d',
        /* Legacy / aliases */
        navy: '#123811',
        orange: '#E07B39',
        'orange-hover': '#C96828',
        yellow: '#F5C842',
        green: '#6BAF7A',
        'green-dark': '#0a2e0a',
        'green-fairway': '#1a5c1a',
        'green-putting': '#2d8a2d',
        'green-mid': '#3cb371',
        'green-light': '#5cb85c',
        'green-lime': '#7cb87c',
        'green-pale': '#90c890',
        'green-mint': '#b8e0b8',
        lightBlue: '#C8DCF0',
        pink: '#F2C4CE',
        peach: '#E8A87C',
        cream: '#F5F0E8',
        white: '#FFFFFF',
        border: '#D8D2C8',
        borderGray: '#D8D2C8',
        placeholderGray: '#9ca3af',
        textBody: '#0d2d0d',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        script: ['var(--font-dancing)', 'Dancing Script', 'cursive'],
        body: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '11px',
        sm: '12px',
        base: '15px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        hero: '80px',
        /* Section headings — used by section-title and components */
        h1: ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h2: ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.2' }],
        h3: ['clamp(1.15rem, 2vw, 1.4rem)', { lineHeight: '1.3' }],
      },
      lineHeight: {
        tight: '1.05',
        snug: '1.2',
        normal: '1.5',
        relaxed: '1.65',
        loose: '1.75',
      },
      letterSpacing: {
        tighter: '-0.5px',
        wide: '0.08em',
        wider: '0.1em',
        widest: '0.15em',
      },
      maxWidth: {
        content: '1280px',
      },
      spacing: {
        'nav-height': '72px',
        'section': '96px',
        'section-lg': '128px',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(18,56,17,0.06)',
        cardHover: '0 16px 48px rgba(18,56,17,0.12)',
        product: '0 12px 40px rgba(0,0,0,0.12)',
        hero: '0 24px 64px rgba(18,56,17,0.2)',
        button: '0 6px 24px rgba(18,56,17,0.3)',
        elevation: '0 8px 32px rgba(0,0,0,0.08)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
