/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f7f2',
          100: '#ccefe5',
          200: '#99dfcb',
          300: '#66cfb1',
          400: '#33bf97',
          500: '#05b27c', // vivid-turquoise
          600: '#188160', // turquoise
          700: '#146a4f',
          800: '#0f533e',
          900: '#0a3c2d',
        },

        'vivid-turquoise': '#05b27c',
        'turquoise': '#188160',
        'grey-turquoise': '#b5dccf',
        'loss-red': '#e34234',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};
