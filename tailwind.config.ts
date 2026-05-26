import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
        display: ['Times New Roman', 'Times', 'serif'],
      },
      colors: {
        mecha: {
          bg: '#0a0a0f',
          panel: '#12121f',
          border: '#1e2a3a',
          'border-glow': '#2a3a5a',
          green: '#00ff88',
          orange: '#ff6b35',
          cyan: '#00d4ff',
          red: '#ff3355',
          yellow: '#ffd700',
          text: '#c8ccd4',
          muted: '#667788',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
