/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: '#0B1220',
        surface: '#111827',
        elevated: '#1F2937',
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        accent: '#10B981',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        border: '#1F2937',
        nav: '#020617',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.08)',
        panel: '0 12px 32px rgba(2, 6, 23, 0.35)',
      },
    },
  },
  plugins: [],
}
