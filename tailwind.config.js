/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: 'rgb(var(--color-forest-950) / <alpha-value>)',
          900: 'rgb(var(--color-forest-900) / <alpha-value>)',
          800: 'rgb(var(--color-forest-800) / <alpha-value>)',
          700: 'rgb(var(--color-forest-700) / <alpha-value>)',
          600: 'rgb(var(--color-forest-600) / <alpha-value>)',
          500: 'rgb(var(--color-forest-500) / <alpha-value>)',
          100: 'rgb(var(--color-forest-100) / <alpha-value>)',
          50: 'rgb(var(--color-forest-50) / <alpha-value>)'
        },
        fairway: {
          700: 'rgb(var(--color-fairway-700) / <alpha-value>)',
          600: 'rgb(var(--color-fairway-600) / <alpha-value>)',
          500: 'rgb(var(--color-fairway-500) / <alpha-value>)',
          400: 'rgb(var(--color-fairway-400) / <alpha-value>)',
          200: 'rgb(var(--color-fairway-200) / <alpha-value>)',
          100: 'rgb(var(--color-fairway-100) / <alpha-value>)',
          50: 'rgb(var(--color-fairway-50) / <alpha-value>)'
        },
        gold: {
          600: 'rgb(var(--color-gold-600) / <alpha-value>)',
          500: 'rgb(var(--color-gold-500) / <alpha-value>)',
          400: 'rgb(var(--color-gold-400) / <alpha-value>)',
          300: 'rgb(var(--color-gold-300) / <alpha-value>)',
          50: 'rgb(var(--color-gold-50) / <alpha-value>)'
        },
        sky: {
          muted: 'rgb(var(--color-sky-muted) / <alpha-value>)',
          section: 'rgb(var(--color-sky-section) / <alpha-value>)',
          light: 'rgb(var(--color-sky-light) / <alpha-value>)'
        },
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        offwhite: 'rgb(var(--color-offwhite) / <alpha-value>)'
      },
      fontFamily: {
        display: ['var(--font-family-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-family-body)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-family-body)', 'system-ui', 'sans-serif'],
        script: ['var(--font-family-display)', 'system-ui', 'sans-serif'],
        'brand-script': ['"Dancing Script"', 'cursive'],
        'brand-serif': ['var(--font-family-display)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 24px 80px rgba(var(--color-gold-400), 0.28)',
        soft: '0 18px 60px rgba(var(--color-forest-900), 0.14)'
      },
      backgroundImage: {
        'hero-overlay':
          'linear-gradient(90deg, rgb(var(--hero-overlay-start) / 0.93) 0%, rgb(var(--hero-overlay-mid) / 0.72) 42%, rgb(var(--hero-overlay-end) / 0.24) 100%)',
        'hero-bottom':
          'linear-gradient(180deg, rgb(var(--hero-bottom-start) / 0.08) 0%, rgb(var(--hero-bottom-end) / 0.78) 100%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        shimmer: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 5.5s ease-in-out infinite',
        shimmer: 'shimmer 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
