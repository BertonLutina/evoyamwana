import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0',
      sm: '0.5rem',
      DEFAULT: '0.9rem',
      md: '1rem',
      lg: '1.45rem',
      xl: '1.75rem',
      '2xl': '2rem',
      '3xl': '2.35rem',
      full: '9999px'
    },
    fontSize: {
      xs: ['0.78rem', { lineHeight: '1.25rem' }],
      sm: ['0.93rem', { lineHeight: '1.55rem' }],
      base: ['1rem', { lineHeight: '1.7rem' }],
      lg: ['1.12rem', { lineHeight: '1.85rem' }],
      xl: ['1.32rem', { lineHeight: '2rem' }],
      '2xl': ['1.62rem', { lineHeight: '2.2rem' }],
      '3xl': ['2.05rem', { lineHeight: '2.55rem' }],
      '4xl': ['2.75rem', { lineHeight: '3.15rem' }],
      '5xl': ['3.45rem', { lineHeight: '3.75rem' }]
    },
    extend: {
      colors: {
        ink: '#071b3a',
        earth: '#6f4b00',
        maize: '#f7d618',
        canopy: '#007fff',
        clay: '#ce1021',
        paper: '#fff8d6',
        ocean: '#007fff',
        sky: '#eaf5ff',
        ember: '#ce1021',
        sun: '#f7d618'
      },
      boxShadow: {
        soft: '0 26px 80px rgba(7, 27, 58, 0.16), inset 0 1px 0 rgba(255,255,255,0.72)',
        panel: '0 22px 62px rgba(31, 65, 128, 0.13), inset 0 1px 0 rgba(255,255,255,0.76)',
        card: '0 18px 44px rgba(31, 65, 128, 0.10), inset 0 1px 0 rgba(255,255,255,0.86)'
      },
      fontFamily: {
        display: ['SF Pro Display', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['SF Pro Text', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
