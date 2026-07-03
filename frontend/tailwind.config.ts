import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './themes/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        cream: '#F5EFE2', // background
        card: '#FFFBF3', // elevated surfaces
        brown: {
          DEFAULT: '#3E2723', // primary
          light: '#5A4038',
          soft: '#8A7868', // muted text
        },
        caramel: {
          DEFAULT: '#C69A5A', // secondary gold
          light: '#DBBA82',
          dark: '#A87E42',
        },
        herb: '#6F8B4A', // accent green
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans Armenian"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        serif: ['"Cormorant Garamond"', '"Noto Serif Armenian"', 'Georgia', 'serif'],
        display: ['Cinzel', '"Noto Serif Armenian"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '22px',
      },
      boxShadow: {
        card: '0 4px 18px -6px rgba(62, 39, 35, 0.14)',
        'card-hover': '0 22px 44px -14px rgba(62, 39, 35, 0.30)',
        gold: '0 6px 18px -6px rgba(198, 154, 90, 0.45)',
      },
    },
  },
  plugins: [],
}
