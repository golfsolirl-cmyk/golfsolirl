/**
 * Pa'lais design system (from palais_design_system.json)
 * Applied to Golf Sol Ireland site.
 */
export const tokens = {
  colors: {
    navy: '#123811',
    orange: '#E07B39',
    yellow: '#F5C842',
    green: '#6BAF7A',
    lightBlue: '#C8DCF0',
    pink: '#F2C4CE',
    peach: '#E8A87C',
    cream: '#F0EDE6',
    white: '#FFFFFF',
    lightGray: '#F5F0E8',
    borderGray: '#D0D0D0',
    placeholderGray: '#999999',
  },
  typography: {
    heroDisplay: { sizePx: '64-80', weight: '800', transform: 'uppercase' },
    h1: { sizePx: '48-56', weight: '700', transform: 'uppercase' },
    h2: { sizePx: '32-40', weight: '700', transform: 'uppercase' },
    h3: { sizePx: '20-24', weight: '700', transform: 'uppercase' },
    body: { sizePx: '14-16', weight: '400', lineHeight: '1.6' },
    navLink: { sizePx: '14', weight: '600' },
    button: { sizePx: '12-13', weight: '700', transform: 'uppercase', letterSpacing: '1px' },
  },
  spacing: {
    containerMaxWidth: '1280px',
    sectionPaddingVertical: '80px',
    sectionPaddingVerticalLg: '120px',
    sectionPaddingHorizontal: '40px',
    sectionPaddingHorizontalLg: '80px',
    gridGutter: '24px',
    gridMargin: '40px',
  },
  components: {
    button: {
      primary: { bg: '#E07B39', color: '#FFFFFF', borderRadius: '24px', padding: '12px 28px' },
      outline: { bg: 'transparent', color: '#E07B39', border: '2px solid #E07B39', borderRadius: '24px', padding: '10px 26px' },
      submit: { bg: '#123811', color: '#FFFFFF', borderRadius: '4px', padding: '12px 24px' },
    },
    nav: {
      background: '#FFFFFF',
      linkColor: '#1D3461',
      ctaBackground: '#1D3461',
      ctaColor: '#FFFFFF',
    },
    footer: { background: '#123811', textColor: '#FFFFFF' },
    newsletter: { background: '#6BAF7A' },
    infoCard: { background: '#C8DCF0', borderRadius: '20px', padding: '32px' },
  },
} as const;
