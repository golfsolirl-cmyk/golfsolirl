/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      /* 🎨 COLORS — new sport-energy tokens merged with existing GolfSol palette */
      colors: {
        // === New design system tokens ===
        primary: '#0B6B45',
        'primary-dark': '#063B2A',
        'primary-accent': '#1ED760',

        secondary: '#FFC72C',
        'secondary-light': '#FFE27A',

        background: '#F4F7F5',
        surface: '#FFFFFF',

        text: {
          primary: '#063B2A',
          secondary: '#4A6B5A',
          inverse: '#FFFFFF'
        },

        border: '#DDE5DF',

        success: '#1ED760',
        error: '#D92D20',
        warning: '#F59E0B',

        // === Existing GolfSol Ireland palette (preserved) ===
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

      /* 🔤 TYPOGRAPHY — new heading/body fonts + existing brand fonts */
      fontFamily: {
        // === New design system ===
        heading: ['Oswald', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],

        // === Existing fonts (preserved) ===
        display: ['"Rubik"', 'system-ui', 'sans-serif'],
        accent: ['"Rubik"', 'system-ui', 'sans-serif'],
        script: ['"Rubik"', 'system-ui', 'sans-serif'],
        'brand-script': ['"Dancing Script"', 'cursive'],
        'brand-serif': ['"Rubik"', 'system-ui', 'sans-serif'],
        ge: ['"Open Sans"', 'system-ui', 'sans-serif']
      },

      fontSize: {
        // Adds 'text-hero' without disturbing existing text-xl / text-2xl scales,
        // which would otherwise re-flow every page on the site.
        hero: '3.5rem'
      },

      lineHeight: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.75'
      },

      letterSpacing: {
        wide: '1px',
        xwide: '2px'
      },

      /* 📐 SPACING — named scale alongside numeric scale */
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px'
      },

      /* 📦 BORDER RADIUS */
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px'
      },

      /* 🌈 GRADIENTS */
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFC72C, #FFE27A)',
        'green-energy': 'linear-gradient(90deg, #0B6B45, #1ED760)',
        // Existing gradients (preserved)
        'hero-overlay':
          'linear-gradient(90deg, rgba(10,32,8,0.92) 0%, rgba(10,32,8,0.72) 42%, rgba(10,32,8,0.28) 100%)',
        'hero-bottom':
          'linear-gradient(180deg, rgba(10,32,8,0.04) 0%, rgba(10,32,8,0.76) 100%)'
      },

      /* 🌑 SHADOWS */
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.08)',
        medium: '0 6px 18px rgba(0,0,0,0.12)',
        gold: '0 4px 14px rgba(255,199,44,0.4)',
        'gold-hover': '0 6px 18px rgba(255,199,44,0.6)',
        glow: '0 24px 80px rgba(220, 88, 1, 0.18)'
      },

      /* 🎬 ANIMATION */
      transitionDuration: {
        fast: '200ms',
        medium: '300ms'
      },

      scale: {
        98: '0.98'
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

  /* 🎯 ACCESSIBILITY + UX HELPERS */
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          outline: '2px solid #1ED760',
          'outline-offset': '2px'
        },
        '.tap-target': {
          'min-height': '44px',
          'min-width': '44px'
        },
        '.card-sport': {
          background: '#FFFFFF',
          padding: '24px',
          'border-radius': '10px',
          'border-left': '6px solid #0B6B45',
          'box-shadow': '0 6px 18px rgba(0,0,0,0.08)',
          transition: 'all 0.25s ease'
        },
        '.card-sport:hover': {
          transform: 'translateY(-6px)',
          'border-left-color': '#1ED760'
        }
      })
    }
  ]
}
