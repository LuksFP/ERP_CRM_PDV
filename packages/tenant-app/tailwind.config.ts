import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:           'var(--bg)',
        canvas:       'var(--canvas)',
        'surface-0':  'var(--surface-0)',
        'surface-1':  'var(--surface-1)',
        'surface-2':  'var(--surface-2)',
        'surface-3':  'var(--surface-3)',
        border:       'var(--border)',
        'border-hover': 'var(--border-hover)',
        accent:       'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        secondary:    'var(--secondary)',
        // ink aliases (used in components)
        ink:          'var(--ink)',
        'ink-muted':  'var(--ink-muted)',
        'ink-subtle': 'var(--ink-subtle)',
        // legacy fg (keep for backwards compat)
        fg:           'var(--fg)',
        'fg-muted':   'var(--fg-muted)',
        'fg-dim':     'var(--fg-dim)',
        green:        'var(--green)',
        red:          'var(--red)',
        yellow:       'var(--yellow)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { btn: '4px', card: '8px', badge: '2px', input: '4px' },
      fontSize: { '2xs': ['0.625rem', { lineHeight: '0.875rem' }] },
      keyframes: {
        'slide-in-right': { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'slide-out-right': { from: { transform: 'translateX(0)', opacity: '1' }, to: { transform: 'translateX(100%)', opacity: '0' } },
        'bounce-in': { '0%': { transform: 'scale(0.8)', opacity: '0' }, '60%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'fade-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-ring': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'slide-out-right': 'slide-out-right 0.2s ease-in',
        'bounce-in': 'bounce-in 0.3s ease-out',
        'fade-up': 'fade-up 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
