/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f4',
          100: '#ffe0e7',
          500: '#ff385c',
          600: '#ff385c',
          700: '#e00b41',
          900: '#92174d',
        },
      },
    },
  },
  plugins: [],
}
