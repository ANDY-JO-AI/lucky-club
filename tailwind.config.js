/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        'neon-pink': '#FF69B4',
        'neon-green': '#39FF14',
        danger: '#FF0000',
        casino: {
          bg: '#000000',
          gold: '#FFD700',
          pink: '#FF69B4',
          green: '#39FF14',
          red: '#FF0000',
          orange: '#FF8C00',
        }
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        noto: ['"Noto Sans KR"', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
        'spin-fast': 'spin 0.3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 0.6s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 2s infinite',
        'slot-scroll': 'slotScroll 0.1s linear infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 7px #FFD700, 0 0 21px #FFD700, 0 0 42px #FF8C00' },
          '50%': { boxShadow: '0 0 14px #FFD700, 0 0 42px #FFD700, 0 0 84px #FF8C00' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        neonFlicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        slotScroll: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
      boxShadow: {
        'neon-gold': '0 0 7px #FFD700, 0 0 21px #FFD700, 0 0 42px #FF8C00',
        'neon-pink': '0 0 7px #FF69B4, 0 0 21px #FF69B4',
        'neon-green': '0 0 7px #39FF14, 0 0 21px #39FF14',
        'neon-red': '0 0 7px #FF0000, 0 0 21px #FF0000',
      }
    },
  },
  plugins: [],
}
