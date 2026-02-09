/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Theme 6: Soft Pastel (소프트 파스텔)
        magic: {
          // Pastel gradient backgrounds
          bg: '#FFF5F5',           // Soft pink white
          bgAlt: '#F8F4FF',        // Lavender tint
          bgGradientStart: '#FFD1DC',  // Pink
          bgGradientMid: '#E6E6FA',    // Lavender  
          bgGradientEnd: '#D1F2EB',    // Mint
          
          // Primary colors
          primary: '#FFB7B2',      // Soft coral pink
          secondary: '#B5EAD7',    // Mint green
          accent: '#E2F0CB',       // Soft lime
          
          // Additional pastels
          purple: '#C7CEEA',       // Soft lavender
          pink: '#FF9AA2',         // Coral
          peach: '#FFDAC1',        // Peach
          mint: '#B5EAD7',         // Mint
          lime: '#E2F0CB',         // Lime
          lavender: '#E6E6FA',     // Lavender
          
          // Glass effect
          glass: 'rgba(255, 255, 255, 0.45)',
          glassBorder: 'rgba(255, 255, 255, 0.6)',
        },
        
        // Soft pastel category colors
        clay: {
          orange: { light: '#FFF5F0', main: '#FFDAC1', dark: '#FFB7B2' },
          blue: { light: '#F0F8FF', main: '#C7CEEA', dark: '#B5C7EA' },
          purple: { light: '#FAF5FF', main: '#E6E6FA', dark: '#C7CEEA' },
          green: { light: '#F0FDF4', main: '#B5EAD7', dark: '#98D8C8' },
          pink: { light: '#FFF5F5', main: '#FFB7B2', dark: '#FF9AA2' },
        },
      },
      boxShadow: {
        // Soft Pastel Glassmorphism shadows
        'glass-sm': '0 4px 16px rgba(31, 38, 135, 0.05)',
        'glass-md': '0 8px 32px rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 12px 40px rgba(31, 38, 135, 0.1)',
        
        // Soft clay shadows (톤다운)
        'clay-sm': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'clay-md': '0 6px 20px rgba(0, 0, 0, 0.06)',
        'clay-lg': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'clay-pressed': 'inset 2px 2px 6px rgba(0, 0, 0, 0.06)',
        'clay-inner': 'inset 2px 2px 4px rgba(0, 0, 0, 0.04)',
        
        // Soft glow effects
        'glow-pink': '0 0 15px rgba(255, 183, 178, 0.4)',
        'glow-mint': '0 0 15px rgba(181, 234, 215, 0.4)',
        'glow-lavender': '0 0 15px rgba(199, 206, 234, 0.4)',
      },
      fontFamily: {
        sans: ['Quicksand', 'Jua', 'Nunito', 'System'],
        'quicksand': ['Quicksand'],
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
