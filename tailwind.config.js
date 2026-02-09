/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 2026 Dopamine Brights + Cream Background
        magic: {
          // Cream/Warm backgrounds (눈 피로 감소)
          bg: '#FFF9F5',        // Warm cream
          bgAlt: '#F7F4F1',     // Soft greige
          
          // Dopamine Brights (생동감 있는 컬러)
          purple: '#9333EA',    // Vivid purple
          pink: '#EC4899',      // Hot pink
          coral: '#F97316',     // Coral orange
          lime: '#84CC16',      // Fresh lime
          cyan: '#06B6D4',      // Electric cyan
          yellow: '#FACC15',    // Sunshine yellow
          
          // Soft accents
          lavender: '#E9D5FF',  // Soft lavender
          peach: '#FED7AA',     // Soft peach
          mint: '#A7F3D0',      // Soft mint
        },
        
        // Clay-style category colors (더 선명하고 입체적)
        clay: {
          orange: { light: '#FFF7ED', main: '#FB923C', dark: '#EA580C' },
          blue: { light: '#F0F9FF', main: '#38BDF8', dark: '#0284C7' },
          purple: { light: '#FAF5FF', main: '#A855F7', dark: '#7C3AED' },
          green: { light: '#F0FDF4', main: '#4ADE80', dark: '#16A34A' },
          pink: { light: '#FFF1F2', main: '#FB7185', dark: '#E11D48' },
        },
      },
      boxShadow: {
        // Enhanced Claymorphism shadows (2026 3D 점토 스타일)
        'clay-sm': '4px 4px 8px rgba(0, 0, 0, 0.08), -4px -4px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.5)',
        'clay-md': '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.95), inset 2px 2px 4px rgba(255, 255, 255, 0.6)',
        'clay-lg': '10px 10px 20px rgba(0, 0, 0, 0.12), -10px -10px 20px rgba(255, 255, 255, 1), inset 3px 3px 6px rgba(255, 255, 255, 0.7)',
        'clay-pressed': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.7)',
        'clay-inner': 'inset 4px 4px 8px rgba(0, 0, 0, 0.05), inset -2px -2px 4px rgba(255, 255, 255, 0.8)',
        
        // Dopamine glow effects
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.4)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
      },
      fontFamily: {
        sans: ['Jua', 'Nunito', 'System'],
        'jua': ['Jua'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
