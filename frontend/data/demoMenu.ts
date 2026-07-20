// Static demo dataset used by /demo?theme=… to preview any design with a
// realistic sample menu ("Your restaurant"). No backend, no persistence.
import type { Restaurant } from '~/models/types'
import type { MenuCategory, MenuLevel } from './menu'

export const demoRestaurant: Restaurant = {
  id: 'demo',
  name: 'Ձեր ռեստորանը',
  slug: 'demo',
  themeId: 'aria',
  logo: '',
  coverImage: '',
  tagline: {
    hy: 'Համեղ ուտեստներ և տաք մթնոլորտ',
    en: 'Delicious food and a warm atmosphere',
    ru: 'Вкусные блюда и тёплая атмосфера',
  },
  address: 'Երևան, Հյուսիսային պողոտա 1',
  workingHours: '10:00 – 23:00',
  rating: 4.9,
  defaultLanguage: 'hy',
  activeLanguages: ['hy', 'en', 'ru'],
}

export const demoLevels: MenuLevel[] = [
  { id: 'food', icon: '🍽', title: { AM: 'Ուտեստներ', EN: 'Food', RU: 'Блюда' } },
  { id: 'drinks', icon: '🥤', title: { AM: 'Խմիչքներ', EN: 'Drinks', RU: 'Напитки' } },
]

export const demoCategories: MenuCategory[] = [
  {
    id: 'starters',
    level: 'food',
    icon: '🥗',
    title: { AM: 'Նախուտեստներ', EN: 'Starters', RU: 'Закуски' },
    items: [
      {
        id: 's1', image: '', price: 2200, badge: 'hit',
        name: { AM: 'Բրուսկետա', EN: 'Bruschetta', RU: 'Брускетта' },
        description: { AM: 'Խրթխրթան հաց՝ լոլիկով և ռեհանով', EN: 'Crispy bread with tomato and basil', RU: 'Хрустящий хлеб с томатом и базиликом' },
      },
      {
        id: 's2', image: '', price: 3200,
        name: { AM: 'Կեսար աղցան', EN: 'Caesar Salad', RU: 'Салат Цезарь' },
        description: { AM: 'Հավ, պարմեզան, կռուտոն', EN: 'Chicken, parmesan, croutons', RU: 'Курица, пармезан, гренки' },
      },
    ],
  },
  {
    id: 'mains',
    level: 'food',
    icon: '🍖',
    title: { AM: 'Հիմնական ուտեստներ', EN: 'Main Courses', RU: 'Основные блюда' },
    items: [
      {
        id: 'm1', image: '', price: 5900, badge: 'best',
        name: { AM: 'Խորոված սաղմոն', EN: 'Grilled Salmon', RU: 'Сёмга на гриле' },
        description: { AM: 'Թարմ սաղմոն՝ բանջարեղենով', EN: 'Fresh salmon with vegetables', RU: 'Свежая сёмга с овощами' },
      },
      {
        id: 'm2', image: '', price: 7500,
        name: { AM: 'Տավարի սթեյք', EN: 'Beef Steak', RU: 'Стейк из говядины' },
        description: { AM: 'Հյութալի սթեյք՝ կարտոֆիլով', EN: 'Juicy steak with potatoes', RU: 'Сочный стейк с картофелем' },
      },
    ],
  },
  {
    id: 'hot',
    level: 'drinks',
    icon: '☕',
    title: { AM: 'Տաք ըմպելիքներ', EN: 'Hot Drinks', RU: 'Горячие напитки' },
    items: [
      {
        id: 'h1', image: '', price: 900,
        name: { AM: 'Էспրեսո', EN: 'Espresso', RU: 'Эспрессо' },
        description: { AM: 'Դասական իտալական սուրճ', EN: 'Classic Italian coffee', RU: 'Классический итальянский кофе' },
      },
      {
        id: 'h2', image: '', price: 1200, badge: 'new',
        name: { AM: 'Կապուչինո', EN: 'Cappuccino', RU: 'Капучино' },
        description: { AM: 'Կաթնափրփուրով', EN: 'With milk foam', RU: 'С молочной пеной' },
      },
    ],
  },
  {
    id: 'cold',
    level: 'drinks',
    group: 'soft',
    icon: '🧃',
    title: { AM: 'Սառը ըմպելիքներ', EN: 'Cold Drinks', RU: 'Холодные напитки' },
    items: [
      {
        id: 'c1', image: '', price: 1500,
        name: { AM: 'Թարմ նարինջ', EN: 'Fresh Orange', RU: 'Свежий апельсин' },
        description: { AM: 'Ֆրեշ՝ թարմ նարնջից', EN: 'Freshly squeezed orange', RU: 'Свежевыжатый апельсин' },
      },
      {
        id: 'c2', image: '', price: 1100,
        name: { AM: 'Լիմոնադ', EN: 'Lemonade', RU: 'Лимонад' },
        description: { AM: 'Անանուխով և կիտրոնով', EN: 'With mint and lemon', RU: 'С мятой и лимоном' },
      },
    ],
  },
]
