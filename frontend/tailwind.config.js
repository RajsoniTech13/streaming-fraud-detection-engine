/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0f1115', // Pure deep space background
          900: '#15181e', // Card background
          800: '#1f242d', // Secondary card / hover
          700: '#2a303c', // Borders
        },
        primary: {
          400: '#c084fc', // Light purple
          500: '#a855f7', // Core purple
          600: '#9333ea', // Deep purple
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        safe: {
          400: '#4ade80',
          500: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
