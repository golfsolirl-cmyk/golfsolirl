/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: 'rgb(var(--gsi-color-forest-950) / <alpha-value>)',
          900: 'rgb(var(--gsi-color-forest-900) / <alpha-value>)',
          800: 'rgb(var(--gsi-color-forest-800) / <alpha-value>)',
          700: 'rgb(var(--gsi-color-forest-700) / <alpha-value>)',
          600: 'rgb(var(--gsi-color-forest-600) / <alpha-value>)',
          500: 'rgb(var(--gsi-color-forest-500) / <alpha-value>)',
          100: 'rgb(var(--gsi-color-forest-100) / <alpha-value>)',
          50: 'rgb(var(--gsi-color-forest-50) / <alpha-value>)'
        },
        fairway: {
          700: 'rgb(var(--gsi-color-fairway-700) / <alpha-value>)',
          600: 'rgb(var(--gsi-color-fairway-600) / <alpha-value>)',
          500: 'rgb(var(--gsi-color-fairway-500) / <alpha-value>)',
          400: 'rgb(var(--gsi-color-fairway-400) / <alpha-value>)',
          200: 'rgb(var(--gsi-color-fairway-200) / <alpha-value>)',
          100: 'rgb(var(--gsi-color-fairway-100) / <alpha-value>)',
          50: 'rgb(var(--gsi-color-fairway-50) / <alpha-value>)'
        },
        gold: {
          600: 'rgb(var(--gsi-color-gold-600) / <alpha-value>)',
          500: 'rgb(var(--gsi-color-gold-500) / <alpha-value>)',
          400: 'rgb(var(--gsi-color-gold-400) / <alpha-value>)',
          300: 'rgb(var(--gsi-color-gold-300) / <alpha-value>)',
          200: 'rgb(var(--gsi-color-gold-200) / <alpha-value>)',
          50: 'rgb(var(--gsi-color-gold-50) / <alpha-value>)'
        },
        sky: {
          muted: 'rgb(var(--gsi-color-sky-muted) / <alpha-value>)',
          section: 'rgb(var(--gsi-color-sky-section) / <alpha-value>)',
          light: 'rgb(var(--gsi-color-sky-light) / <alpha-value>)'
        },
        cream: 'rgb(var(--gsi-color-cream) / <alpha-value>)',
        offwhite: 'rgb(var(--gsi-color-offwhite) / <alpha-value>)',
        gs: {
          green: 'rgb(var(--gsi-color-gs-green) / <alpha-value>)',
          dark: 'rgb(var(--gsi-color-gs-dark) / <alpha-value>)',
          electric: 'rgb(var(--gsi-color-gs-electric) / <alpha-value>)',
          gold: 'rgb(var(--gsi-color-gs-gold) / <alpha-value>)',
          'gold-light': 'rgb(var(--gsi-color-gs-gold-light) / <alpha-value>)',
          bg: 'rgb(var(--gsi-color-gs-bg) / <alpha-value>)'
        },
        ge: {
          teal: 'rgb(var(--gsi-color-ge-teal) / <alpha-value>)',
          'teal-dark': 'rgb(var(--gsi-color-ge-teal-dark) / <alpha-value>)',
          'teal-light': 'rgb(var(--gsi-color-ge-teal-light) / <alpha-value>)',
          blue: 'rgb(var(--gsi-color-ge-blue) / <alpha-value>)',
          'blue-light': 'rgb(var(--gsi-color-ge-blue-light) / <alpha-value>)',
          orange: 'rgb(var(--gsi-color-ge-orange) / <alpha-value>)',
          'orange-hover': 'rgb(var(--gsi-color-ge-orange-hover) / <alpha-value>)',
          purple: 'rgb(var(--gsi-color-ge-purple) / <alpha-value>)',
          ink: 'rgb(var(--gsi-color-ge-ink) / <alpha-value>)',
          gray700: 'rgb(var(--gsi-color-ge-gray700) / <alpha-value>)',
          gray500: 'rgb(var(--gsi-color-ge-gray500) / <alpha-value>)',
          gray300: 'rgb(var(--gsi-color-ge-gray300) / <alpha-value>)',
          gray200: 'rgb(var(--gsi-color-ge-gray200) / <alpha-value>)',
          gray100: 'rgb(var(--gsi-color-ge-gray100) / <alpha-value>)',
          gray50: 'rgb(var(--gsi-color-ge-gray50) / <alpha-value>)'
        }
      },
      fontFamily: {
        display: ['var(--gsi-font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--gsi-font-body)', 'system-ui', 'sans-serif'],
        accent: ['var(--gsi-font-body)', 'system-ui', 'sans-serif'],
        script: ['var(--gsi-font-body)', 'system-ui', 'sans-serif'],
        'brand-script': ['"Dancing Script"', 'cursive'],
        'brand-serif': ['var(--gsi-font-display)', 'system-ui', 'sans-serif'],
        ge: ['var(--gsi-font-ge)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: 'var(--gsi-shadow-glow)',
        soft: 'var(--gsi-shadow-soft)',
        'gs-gold': 'var(--gsi-shadow-gs-gold)',
        'gs-gold-hover': 'var(--gsi-shadow-gs-gold-hover)',
        'gs-green': 'var(--gsi-shadow-gs-green)',
        card: 'var(--gsi-shadow-card)'
      },
      backgroundImage: {
        'hero-overlay':
          'linear-gradient(90deg, rgba(10,32,8,0.92) 0%, rgba(10,32,8,0.72) 42%, rgba(10,32,8,0.28) 100%)',
        'hero-bottom':
          'linear-gradient(180deg, rgba(10,32,8,0.04) 0%, rgba(10,32,8,0.76) 100%)',
        'gs-gold':
          'linear-gradient(135deg, rgb(var(--gsi-color-gs-gold)) 0%, rgb(var(--gsi-color-gs-gold-light)) 100%)',
        'gs-energy':
          'linear-gradient(90deg, rgb(var(--gsi-color-gs-green)) 0%, rgb(var(--gsi-color-gs-electric)) 100%)'
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
