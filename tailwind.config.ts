import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        rangeBlue: '#082D4D',
        gold: '#F4C542',
        olympicRed: '#D71E33',
        rangeGreen: '#8BC368',
        ink: '#06111F'
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 60px rgba(244,197,66,.24)',
        panel: '0 24px 90px rgba(0,0,0,.38)'
      }
    },
  },
  plugins: [],
}
export default config
