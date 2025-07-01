/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mystical-pink': '#FF69B4',
        'mystical-gold': '#FFD700',
        'cosmic-bg': '#0f0f1a',
        'card-bg': '#1a1a2e',
      },
      fontFamily: {
        'alex-brush': ['Alex Brush', 'cursive'],
        'playfair': ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'cosmic': "url('https://i.postimg.cc/sXdsKGTK/DALL-E-2025-06-06-14-36-29-A-vivid-ethereal-background-image-designed-for-a-psychic-reading-app.webp')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}