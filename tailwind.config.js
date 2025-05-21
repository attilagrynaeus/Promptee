/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,css}',  // include CSS so custom utilities aren’t purged
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#1e2024',     // overall page background
        'sidebar-bg': '#2b2e38',  // sidebar panel
        'panel-bg':  '#ffffff',   // card & modal background
        'input-bg':  '#1f1f28',   // dark input/select background
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
    },
  },
  plugins: [],
};
