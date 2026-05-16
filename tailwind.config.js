/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'spin-slow': 'spin-slow 12s linear infinite',
          'ping-slow': 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
          'particle': 'particle 1.5s ease-in infinite',
        },
        keyframes: {
          'spin-slow': {
            'from': { transform: 'rotate(0deg)' },
            'to': { transform: 'rotate(360deg)' },
          },
          'ping-slow': {
            '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
            '100%': { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '0' },
          },
          'particle': {
            '0%': { transform: 'translate(-50%, -50%) translate(var(--tx), var(--ty))', opacity: '0' },
            '20%': { opacity: '1' },
            '100%': { transform: 'translate(-50%, -50%) translate(0, 0)', opacity: '0.2' },
          }
        }
      },
    },
    plugins: [],
  }