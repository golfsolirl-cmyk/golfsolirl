/** @type {import('tailwindcss').Config} */
const cssVarColor = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: cssVarColor('--color-forest-950'),
          900: cssVarColor('--color-forest-900'),
          800: cssVarColor('--color-forest-800'),
          700: cssVarColor('--color-forest-700'),
          600: cssVarColor('--color-forest-600'),
          500: cssVarColor('--color-forest-500'),
          400: cssVarColor('--color-forest-400'),
          300: cssVarColor('--color-forest-300'),
          200: cssVarColor('--color-forest-200'),
          100: cssVarColor('--color-forest-100'),
          50: cssVarColor('--color-forest-50')
        },
        fairway: {
          700: cssVarColor('--color-fairway-700'),
          600: cssVarColor('--color-fairway-600'),
          500: cssVarColor('--color-fairway-500'),
          400: cssVarColor('--color-fairway-400'),
          300: cssVarColor('--color-fairway-300'),
          200: cssVarColor('--color-fairway-200'),
          100: cssVarColor('--color-fairway-100'),
          50: cssVarColor('--color-fairway-50')
        },
        gold: {
          700: cssVarColor('--color-gold-700'),
          600: cssVarColor('--color-gold-600'),
          500: cssVarColor('--color-gold-500'),
          400: cssVarColor('--color-gold-400'),
          300: cssVarColor('--color-gold-300'),
          200: cssVarColor('--color-gold-200'),
          100: cssVarColor('--color-gold-100'),
          50: cssVarColor('--color-gold-50')
        },
        sky: {
          muted: '#e8f4fb',
          section: '#cce8f4',
          light: '#dbeafe'
        },
        cream: cssVarColor('--color-cream'),
        offwhite: cssVarColor('--color-offwhite'),
        // GolfSol Ireland sport-energy palette (used on the clone home `/`)
        gs: {
          green: cssVarColor('--color-gs-green'),
          'green-light': cssVarColor('--color-gs-green-light'),
          dark: cssVarColor('--color-gs-dark'),
          electric: cssVarColor('--color-gs-electric'),
          gold: cssVarColor('--color-gs-gold'),
          'gold-light': cssVarColor('--color-gs-gold-light'),
          bg: cssVarColor('--color-gs-bg')
        },
        ge: {
          teal: '#007C69',
          'teal-dark': '#005a4d',
          'teal-light': '#29c4a9',
          blue: '#2692E0',
          'blue-light': '#7EBEC5',
          orange: '#ff5b2d',
          'orange-hover': '#e94a1f',
          purple: '#61115D',
          ink: '#2d3940',
          gray700: '#3e3e3e',
          gray500: '#4e4e4e',
          gray300: '#bfbfbf',
          gray200: '#e2e2e2',
          gray100: '#efefef',
          gray50: '#f3f3f3'
        }
      },
      fontFamily: {
        display: ['var(--theme-font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--theme-font-body)', 'system-ui', 'sans-serif'],
        accent: ['var(--theme-font-display)', 'system-ui', 'sans-serif'],
        script: ['"Rubik"', 'system-ui', 'sans-serif'],
        'brand-script': ['"Dancing Script"', 'cursive'],
        'brand-serif': ['var(--theme-font-display)', 'system-ui', 'sans-serif'],
        ge: ['var(--theme-font-ge)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        soft: 'var(--shadow-soft)',
        'gs-gold': 'var(--shadow-gs-gold)',
        'gs-gold-hover': 'var(--shadow-gs-gold-hover)',
        'gs-green': 'var(--shadow-gs-green)'
      },
      backgroundImage: {
        'hero-overlay':
          'linear-gradient(90deg, rgba(10,32,8,0.92) 0%, rgba(10,32,8,0.72) 42%, rgba(10,32,8,0.28) 100%)',
        'hero-bottom':
          'linear-gradient(180deg, rgba(10,32,8,0.04) 0%, rgba(10,32,8,0.76) 100%)',
        'gs-gold': 'linear-gradient(135deg, #FFC72C 0%, #FFE27A 100%)',
        'gs-energy': 'linear-gradient(90deg, #0B6B45 0%, #1ED760 100%)'
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
