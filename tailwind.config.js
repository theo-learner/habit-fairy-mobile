/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        magic: {
          bg: '#F5F3FF',
          purple: '#8B5CF6',
          lime: '#A3E635',
        },
      },
      boxShadow: {
        'clay-sm': 'inset -2px -2px 4px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 1)',
        'clay-md': 'inset -4px -4px 8px rgba(0, 0, 0, 0.1), inset 4px 4px 8px rgba(255, 255, 255, 1)',
        'clay-pressed': 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 1)',
      },
      fontFamily: {
        sans: ['Jua', 'Nunito', 'System'],
        'jua': ['Jua'],
      },
    },
  },
  plugins: [],
}
