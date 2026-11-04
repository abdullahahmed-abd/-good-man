/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        insaan: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          gold: '#eab308',
          amber: '#f59e0b',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.65)',
          'light-border': 'rgba(255, 255, 255, 0.45)',
          dark: 'rgba(18, 24, 38, 0.70)',
          'dark-border': 'rgba(255, 255, 255, 0.08)',
          'card-dark': 'rgba(26, 34, 53, 0.60)',
          'card-light': 'rgba(255, 255, 255, 0.80)',
        }
      },
      backdropBlur: {
        xs: '2px',
        vision: '20px',
        heavy: '32px',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        'glass-hover': '0 16px 48px 0 rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        'neon-emerald': '0 0 25px -5px rgba(34, 197, 94, 0.35)',
        'neon-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'spatial': '0 20px 50px rgba(0,0,0,0.3), 0 0 1px 1px rgba(255,255,255,0.1)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'aurora-slow': 'aurora 18s ease-in-out infinite alternate',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'scale(1) rotate(0deg) translate(0, 0)' },
          '50%': { transform: 'scale(1.1) rotate(4deg) translate(-20px, 30px)' },
          '100%': { transform: 'scale(0.95) rotate(-3deg) translate(25px, -20px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        }
      }
    },
  },
  plugins: [],
}

