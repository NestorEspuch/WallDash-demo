/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neum: {
          bg: 'var(--neum-bg)',
          surface: 'var(--neum-surface)',
          primary: 'var(--neum-primary)',
          'primary-light': 'var(--neum-primary-light)',
          text: 'var(--neum-text)',
          'text-muted': 'var(--neum-text-muted)',
        },
      },
      boxShadow: {
        'neum': 'var(--shadow-neum)',
        'neum-sm': 'var(--shadow-neum-sm)',
        'neum-inset': 'var(--shadow-neum-inset)',
        'neum-inset-sm': 'var(--shadow-neum-inset-sm)',
      },
      borderRadius: {
        'neum': '1rem',
        'neum-sm': '0.75rem',
      },
    },
  },
  plugins: [],
}
