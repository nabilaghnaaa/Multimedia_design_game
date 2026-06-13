/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-green': '#4ade80',
        'game-green-dark': '#16a34a',
        'game-brown': '#92400e',
        'game-brown-light': '#b45309',
        'game-yellow': '#fbbf24',
        'game-yellow-light': '#fde68a',
        'game-road': '#374151',
        'game-blue': '#3b82f6',
        'game-blue-dark': '#1d4ed8',
        'game-red': '#ef4444',
        'game-red-dark': '#dc2626',
        'game-sky': '#0ea5e9',
        'game-orange': '#f97316',
        'game-purple': '#8b5cf6',
      },
      fontFamily: {
        'kids': ['Nunito', 'Fredoka One', '"Comic Sans MS"', 'sans-serif'],
        'display': ['Nunito', 'sans-serif'],
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(1deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(-10px)' },
          '80%': { transform: 'translateX(10px)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'road-move': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'car-move': {
          '0%': { transform: 'translateX(-120px)' },
          '100%': { transform: 'translateX(calc(100vw + 120px))' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(360deg)', opacity: '0' },
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        }
      },
      animation: {
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.4s ease-out forwards',
        'road-move': 'road-move 4s linear infinite',
        'car-move': 'car-move 6s linear infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'heartbeat': 'heartbeat 0.6s ease-in-out',
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(180deg, #87CEEB 0%, #b3e5fc 40%, #e8f5e9 100%)',
        'road-gradient': 'linear-gradient(90deg, #374151 0%, #4b5563 50%, #374151 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 50%, #22d3ee 100%)',
      },
      dropShadow: {
        'game': '0 4px 8px rgba(0,0,0,0.3)',
        'glow-yellow': '0 0 15px rgba(251, 191, 36, 0.8)',
        'glow-green': '0 0 15px rgba(74, 222, 128, 0.8)',
      }
    },
  },
  plugins: [],
}