/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        primaryDark: 'var(--primary-dark)',
        okBg: 'var(--ok-bg)',
        okText: 'var(--ok-text)',
        warnBg: 'var(--warn-bg)',
        warnText: 'var(--warn-text)',
        dangerBg: 'var(--danger-bg)',
        dangerText: 'var(--danger-text)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06)',
        soft: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '0.95rem',
      },
    },
  },
  plugins: [],
};

