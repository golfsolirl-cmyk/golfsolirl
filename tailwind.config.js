/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0a2008',
          900: '#163a13',
          800: '#1a4516',
          700: '#1f571a',
          600: '#2a7020',
          500: '#3a8d2e',
          100: '#d9efd3',
          50: '#f0f7ee'
        },
        fairway: {
          700: '#316619',
          600: '#3d8120',
          500: '#50a32d',
          400: '#6ebf47',
          200: '#c3e9a8',
          100: '#e3f5d3',
          50: '#f5fbf0'
        },
        gold: {
          600: '#d97706',
          500: '#f59e0b',
          400: '#dc5801',
          300: '#fdba74',
          50: '#fffbeb'
        },
        sky: {
          muted: '#e8f4fb',
          section: '#cce8f4',
          light: '#dbeafe'
        },
        cream: '#f2f5ef',
        offwhite: '#f7f9f5',
        // GolfSol Ireland sport-energy palette (used on the clone home `/`)
        gs: {
          green: '#0B6B45',          // Primary Green — fresher, stronger
          dark: '#063B2A',            // Dark Green — text & deep surfaces
          electric: '#1ED760',        // Electric Green Accent — energy pop
          gold: '#FFC72C',            // Gold — bright, sporty
          'gold-light': '#FFE27A',    // Gold Highlight
          bg: '#F4F7F5'               // Light turf background
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
        display: ['"Rubik"', 'system-ui', 'sans-serif'],
        body: ['"Rubik"', 'system-ui', 'sans-serif'],
        accent: ['"Rubik"', 'system-ui', 'sans-serif'],
        script: ['"Rubik"', 'system-ui', 'sans-serif'],
        'brand-script': ['"Dancing Script"', 'cursive'],
        'brand-serif': ['"Rubik"', 'system-ui', 'sans-serif'],
        ge: ['"Open Sans"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 24px 80px rgba(220, 88, 1, 0.18)',
        soft: '0 18px 60px rgba(22, 58, 19, 0.12)',
        'gs-gold': '0 8px 22px rgba(255,199,44,0.42)',
        'gs-gold-hover': '0 10px 28px rgba(255,199,44,0.62)',
        'gs-green': '0 8px 22px rgba(11,107,69,0.32)'
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
