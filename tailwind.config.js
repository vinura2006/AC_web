/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/**/*.ejs',
    './public/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#070B14',
        surface: '#0E1626',
        elevated: '#141F36',
        border: '#1E2D4A',
        text: '#E6EDF7',
        muted: '#8FA3BF',
        primary: '#22D3EE',
        secondary: '#8B5CF6',
        offer: '#FF3D81',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        whatsapp: '#25D366'
      },
      fontFamily: {
        heading: ["'Space Grotesk'", 'sans-serif'],
        body: ["'Inter'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace']
      }
    }
  },
  plugins: []
};
