/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        album: {
          bg: '#4B3BE8',
          dayBg: '#F8FAFC',
          ink: '#1B1340',
          cta: '#22D3EE',
        },
        trivia: {
          geografia: '#3b82f6',
          arte: '#ef4444',
          entretenimiento: '#ec4899',
          programacion: '#f8fafc',
          matematicas: '#a855f7',
          historia: '#d9ef66',
          deportes: '#f97316',
          ciencia: '#10b981'
        }
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
      },
      boxShadow: {
        'hard': '4px 4px 0 #1B1340',
        'hard-sm': '2px 2px 0 #1B1340',
      },
      keyframes: {
        'bounce-once': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-once': 'bounce-once 0.6s ease-in-out 1 motion-safe',
      }
    },
  },
  plugins: [],
}
