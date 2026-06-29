import type { Restaurant } from '~/models/types'
import { seedRestaurant } from '~/services/seed'

// Normalized restaurant records. In production this comes from the DB; here it
// is the seed for the in-memory repository. Every other entity references these
// by `restaurantId`.
export const restaurants: Restaurant[] = [
  // TUN LAHMAJO — full menu, Aria theme.
  seedRestaurant,

  {
    id: 'yasaman',
    name: 'YASAMAN',
    slug: 'yasaman',
    themeId: 'maison',
    logo: '',
    coverImage: '',
    tagline: {
      hy: 'Արևելյան բուրմունքներ',
      en: 'Flavors of the East',
      ru: 'Вкусы Востока',
    },
    phone: '+374 10 200200',
    address: 'Թումանյան 8, Երևան',
    workingHours: '11:00 – 24:00',
    rating: 4.7,
    social: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', website: '' },
    defaultLanguage: 'hy',
    activeLanguages: ['hy', 'en', 'ru'],
  },

  {
    id: 'karas',
    name: 'KARAS',
    slug: 'karas',
    themeId: 'atelier',
    logo: '',
    coverImage: '',
    tagline: {
      hy: 'Հայկական խոհանոց՝ ժամանակակից',
      en: 'Armenian cuisine, reimagined',
      ru: 'Армянская кухня по-новому',
    },
    phone: '+374 11 555555',
    address: 'Հյուսիսային պող. 5, Երևան',
    workingHours: '10:00 – 23:00',
    rating: 4.9,
    social: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', website: '' },
    defaultLanguage: 'hy',
    activeLanguages: ['hy', 'en', 'ru'],
  },
]
