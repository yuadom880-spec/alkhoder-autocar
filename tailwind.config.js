/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0d7a4a',
          'green-light': '#12a362',
          'green-dark': '#065a35',
          gold: '#d4a853',
          dark: '#0a1628',
          navy: '#0f2744',
          slate: '#1e3a5f',
        },
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'hero-zoom': 'heroZoom 22s ease-in-out infinite alternate',
        'hero-glow': 'heroGlow 8s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heroZoom: {
          '0%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1.1)' },
        },
        heroGlow: {
          '0%': { opacity: '0.35' },
          '100%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
}