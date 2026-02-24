/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A96E',
          light: '#E2C99A',
          dark: '#A07840',
        },
        dark: {
          DEFAULT: '#0F0F0F',
          100: '#1A1A1A',
          200: '#222222',
          300: '#2E2E2E',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounce_arrow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
      animation: {
        fadeInDown: 'fadeInDown 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        fadeInUp: 'fadeInUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        fadeIn: 'fadeIn 0.5s ease forwards',
        bounce_arrow: 'bounce_arrow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
