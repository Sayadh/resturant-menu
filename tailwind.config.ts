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
        cream: '#F7F2E8',
        card: '#FBF8F1',
        brown: {
          DEFAULT: '#5A3923',
          light: '#7A5238',
          soft: '#8B6B52',
        },
        caramel: {
          DEFAULT: '#B98552',
          light: '#D2A877',
          dark: '#A06E3F',
        },
        herb: '#6F8B4A',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Noto Serif Armenian"', 'Georgia', 'serif'],
        display: ['Cinzel', '"Noto Serif Armenian"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 6px 20px -8px rgba(90, 57, 35, 0.18)',
        'card-hover': '0 18px 36px -12px rgba(90, 57, 35, 0.30)',
      },
    },
  },
  plugins: [],
}
