/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'ts-yellow': '#FFD700',
        'ts-yellow-dark': '#F5C400',
        'ts-gold-deep': '#C28A00',
        'ts-red': '#D0021B',
        'ts-dark': '#111827',
      },
      backgroundImage: {
        'ts-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q10 0 20 20 T40 20 V20 H0Z' fill='%23FFD700' fill-opacity='0.15'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'ts-soft': '0 10px 30px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
