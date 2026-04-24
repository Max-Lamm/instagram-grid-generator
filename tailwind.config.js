/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E8554E',
        },
        dark: {
          bg: '#1a1a1a',
          gradient: '#111111',
          card: '#222222',
          input: '#1d1d1d',
          border: '#2e2e2e',
          'border-hi': '#3a3a3a',
          text: '#d4d4d4',
          'text-hi': '#f0f0f0',
          muted: '#999999',
        },
      },
      fontFamily: {
        sans: ['Raleway', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
