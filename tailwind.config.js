/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#080a10',
          900: '#0d111b',
          850: '#121724',
          800: '#171d2b',
          700: '#222a3b',
          600: '#323b50',
        },
        mist: {
          100: '#edf2f7',
          200: '#cfd8e6',
          300: '#a7b3c7',
          400: '#78879d',
        },
        moon: '#d8c99b',
        iris: '#9b8cff',
        ember: '#d08b66',
        tide: '#6eb7b6',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(216, 201, 155, 0.08), 0 22px 70px rgba(0, 0, 0, 0.35)',
        soft: '0 18px 46px rgba(0, 0, 0, 0.24)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
}
