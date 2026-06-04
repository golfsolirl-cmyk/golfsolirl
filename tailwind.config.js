/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      colors: {
        forest: {
          950: 'var(--brand-950)',
          900: 'var(--brand-900)',
          800: 'var(--brand-800)',
          700: 'var(--brand-700)',
          600: 'var(--brand-600)',
          500: 'var(--brand-500)',
          400: 'var(--text-muted)',
          100: 'var(--chrome-200)',
          50: 'var(--chrome-50)'
        },
        fairway: {
          700: 'var(--brand-700)',
          600: 'var(--brand-600)',
          500: 'var(--brand-500)',
          400: 'var(--brand-500)',
          200: 'var(--chrome-200)',
          100: 'var(--chrome-100)',
          50: 'var(--chrome-50)'
        },
        /** Legacy gold scale → crest greens (no mustard UI). */
        gold: {
          950: 'var(--brand-950)',
          600: 'var(--brand-700)',
          500: 'var(--brand-700)',
          400: 'var(--brand-600)',
          300: 'var(--brand-500)',
          200: 'var(--chrome-300)',
          100: 'var(--chrome-200)',
          50: 'var(--chrome-50)'
        },
        amber: {
          50: 'var(--chrome-50)',
          100: 'var(--chrome-100)',
          200: 'var(--chrome-200)',
          300: 'var(--chrome-300)',
          400: 'var(--brand-600)',
          500: 'var(--brand-700)',
          600: 'var(--brand-700)',
          700: 'var(--brand-800)',
          800: 'var(--brand-900)',
          900: 'var(--brand-950)',
          950: 'var(--brand-950)'
        },
        yellow: {
          50: 'var(--chrome-50)',
          100: 'var(--chrome-100)',
          200: 'var(--chrome-200)',
          300: 'var(--chrome-300)',
          400: 'var(--brand-600)',
          500: 'var(--brand-700)',
          600: 'var(--brand-700)',
          700: 'var(--brand-800)',
          800: 'var(--brand-900)',
          900: 'var(--brand-950)',
          950: 'var(--brand-950)'
        },
        chrome: {
          50: 'var(--chrome-50)',
          100: 'var(--chrome-100)',
          200: 'var(--chrome-200)',
          300: 'var(--chrome-300)',
          400: 'var(--chrome-400)'
        },
        sand: {
          DEFAULT: 'var(--chrome-300)',
          50: 'var(--chrome-100)',
          100: 'var(--chrome-200)'
        },
        sky: {
          muted: 'var(--chrome-100)',
          section: 'var(--chrome-100)',
          light: 'var(--chrome-50)'
        },
        /** Locked header background — do not change. */
        cream: 'var(--header-bg)',
        offwhite: 'var(--bg-main)',
        brand: {
          forest: 'var(--brand-800)',
          'forest-deep': 'var(--brand-900)',
          fairway: 'var(--brand-600)',
          leaf: 'var(--brand-500)',
          mustard: 'var(--brand-700)',
          cream: 'var(--chrome-50)',
          'cream-soft': 'var(--chrome-100)',
          white: 'var(--bg-section)',
          charcoal: 'var(--text-primary)',
          navy: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          sand: 'var(--chrome-300)'
        },
        gs: {
          green: 'var(--brand-600)',
          dark: 'var(--brand-900)',
          primary: 'var(--brand-800)',
          electric: 'var(--brand-500)',
          gold: 'var(--brand-700)',
          'gold-light': 'var(--brand-600)',
          bg: 'var(--bg-main)'
        },
        ge: {
          teal: 'var(--brand-800)',
          'teal-dark': 'var(--brand-900)',
          'teal-light': 'var(--brand-500)',
          blue: 'var(--brand-600)',
          'blue-light': 'var(--brand-500)',
          orange: 'var(--brand-700)',
          'orange-hover': 'var(--brand-600)',
          purple: 'var(--brand-900)',
          ink: 'var(--text-primary)',
          gray700: 'var(--text-secondary)',
          gray600: 'var(--text-secondary)',
          gray500: 'var(--text-muted)',
          gray300: 'var(--border-default)',
          gray200: 'var(--border-light)',
          gray100: 'var(--chrome-100)',
          gray50: 'var(--bg-main)'
        },
        silver: {
          100: 'var(--silver-100)',
          200: 'var(--silver-200)',
          300: 'var(--silver-300)',
          400: 'var(--silver-400)',
          500: 'var(--silver-500)'
        }
      },
      fontFamily: {
        premium: ['"Manrope"', 'system-ui', 'sans-serif'],
        display: ['"Rubik"', 'system-ui', 'sans-serif'],
        body: ['"Rubik"', 'system-ui', 'sans-serif'],
        accent: ['"Rubik"', 'system-ui', 'sans-serif'],
        script: ['"Rubik"', 'system-ui', 'sans-serif'],
        'brand-script': ['"Dancing Script"', 'cursive'],
        'brand-serif': ['"Rubik"', 'system-ui', 'sans-serif'],
        'ge-display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        ge: ['"Open Sans"', 'system-ui', 'sans-serif'],
        'bc-display': ['"Playfair Display"', 'Georgia', 'serif'],
        'bc-body': ['"Inter"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'gs-sm': 'var(--radius-sm)',
        'gs-md': 'var(--radius-md)',
        'gs-lg': 'var(--radius-lg)',
        'gs-xl': 'var(--radius-xl)'
      },
      boxShadow: {
        glow: 'var(--shadow-premium)',
        soft: 'var(--shadow-soft)',
        'gs-gold': 'var(--shadow-btn-primary)',
        'gs-gold-hover': 'var(--shadow-btn-primary-hover)',
        'gs-green': 'var(--shadow-btn-primary)',
        'brand-card': 'var(--card-shadow)'
      },
      backgroundImage: {
        'hero-overlay': 'var(--bg-hero-overlay)',
        'hero-bottom':
          'linear-gradient(180deg, rgba(4, 20, 12, 0.04) 0%, rgba(4, 20, 12, 0.76) 100%)',
        'gs-gold': 'var(--btn-primary-bg)',
        'gs-energy': 'linear-gradient(90deg, var(--brand-800) 0%, var(--brand-600) 100%)',
        'gs-cta': 'var(--btn-primary-bg)',
        'gs-cta-hover': 'var(--btn-primary-hover)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        shimmer: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' }
        },
        'gsol-hero-drift': {
          from: { transform: 'scale(1.02) translate3d(0,0,0)' },
          to: { transform: 'scale(1.07) translate3d(-18px,-8px,0)' }
        },
        'gsol-badge-orbit': {
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 5.5s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'gsol-hero-drift': 'gsol-hero-drift 14s ease-in-out infinite alternate',
        'gsol-badge-orbit': 'gsol-badge-orbit 18s linear infinite'
      }
    }
  },
  plugins: []
}
