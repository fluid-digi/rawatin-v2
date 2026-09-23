import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          soft: '#F5B7FA',
          50: '#FCF0FE',
          100: '#F7DEFB',
          200: '#EFC0F6',
          300: '#E29CF0',
          400: '#CA6FDF',
          500: '#A640CE',
          600: '#8931AD',
          700: '#6E2789'
        },
        sky: { soft: '#82ACFF', 50: '#F0F6FF', 500: '#4E7FE0', 700: '#285EA8' },
        mint: { soft: '#55D8C1', 50: '#E6FFF3', 500: '#1FA98A', 700: '#18764B' },
        pinky: { soft: '#FF6FB5', 50: '#FFF0F6', 500: '#E14C93' },
        ink: { DEFAULT: '#252A38', soft: '#626776', faint: '#9AA0AE' },
        page: '#FCF8FD',
        line: '#E7E8EE',
        success: '#18764B',
        warning: '#8A5700',
        danger: '#B4233D',
        info: '#285EA8'
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(37,42,56,0.04), 0 8px 24px rgba(148,120,180,0.10)',
        pop: '0 8px 40px rgba(102,44,160,0.18)',
        nav: '0 -4px 24px rgba(148,120,180,0.14)'
      },
      keyframes: {
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'sheet-up': 'sheet-up 220ms cubic-bezier(0.22,1,0.36,1)',
        'fade-in': 'fade-in 160ms ease-out',
        'scale-in': 'scale-in 160ms ease-out'
      }
    }
  },
  plugins: []
} satisfies Config;
