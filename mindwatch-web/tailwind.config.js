/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pro: {
          bg: '#0A0A0A',
          panel: '#111111',
          border: '#222222',
          accent: '#6366f1',
          accentHover: '#4f46e5',
        }
      },
      boxShadow: {
        'glow': '0 0 15px -3px rgba(99, 102, 241, 0.4)',
        'glow-green': '0 0 15px -3px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 15px -3px rgba(239, 68, 68, 0.4)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
