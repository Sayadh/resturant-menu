import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Driven by RestaurantConfig.theme — kept in sync via CSS variables.
        cream: 'var(--c-bg)',
        card: 'var(--c-card)',
        border: 'var(--c-border)',
        brown: {
          DEFAULT: 'var(--c-brown)',
          light: '#6B4A38',
          soft: '#8B6B52',
        },
        caramel: {
          DEFAULT: 'var(--c-caramel)',
          light: '#DBB682',
          dark: '#A87B3F',
        },
        herb: {
          DEFAULT: 'var(--c-herb)',
          dark: '#5A7339',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Noto Serif Armenian"', 'Georgia', 'serif'],
        display: ['Cinzel', '"Noto Serif Armenian"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '22px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 8px 24px -10px rgba(62, 39, 35, 0.20)',
        'card-hover': '0 22px 44px -14px rgba(62, 39, 35, 0.34)',
        pill: '0 6px 16px -6px rgba(198, 154, 90, 0.55)',
        panel: '0 -10px 40px -12px rgba(62, 39, 35, 0.28)',
      },
    },
  },
  plugins: [],
}
