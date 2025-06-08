/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,css}',
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#1e2024',
        'sidebar-bg': '#2b2e38',
        'panel-bg':  '#ffffff',
        'input-bg':  '#1f1f28',
        'accent-blue': '#5850ec',
        'accent-blue-hover': '#3b41c6',
        'accent-pink':  '#d946ef',
        'accent-red':   '#f04335',
        'accent-teal':  '#14b8a6',
      },
      boxShadow: {
        card:   '0 4px 12px rgba(0,0,0,0.1)',
        inset:  'inset -4px -4px 8px rgba(0,0,0,0.2)',
        'btn-down':    '0 4px 0 rgba(0,0,0,0.15)',
        'btn-down-sm': '0 2px 0 rgba(0,0,0,0.15)',
      },
      animation: {
        fadeOut: 'fadeOut 3s ease-in-out forwards'
      },
      keyframes: {
        fadeOut: {
          '0%, 50%': { opacity: '1' },
          '100%': { opacity: '0', visibility: 'hidden', height: '0', margin: '0', padding: '0' },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};