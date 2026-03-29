import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-dim': 'var(--fg-dim)',
        green: 'var(--green)',
        red: 'var(--red)',
        yellow: 'var(--yellow)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        btn: 'var(--btn-radius)',
        card: '8px',
        badge: '2px',
        input: '4px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
} satisfies Config
