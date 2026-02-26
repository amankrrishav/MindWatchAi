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
          bg: '#050505',
          panel: '#0e0e0e',
          border: '#1f1f22',
          accent: '#7c3aed',
          accentHover: '#6d28d9',
        }
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(124, 58, 237, 0.5)',
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.5)',
        'panel': '0 8px 32px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
};
// Force Vite HMR reload
