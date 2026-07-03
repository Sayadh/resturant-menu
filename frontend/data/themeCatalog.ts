import type { Restaurant, Theme } from '~/models/types'

// Neutral placeholder used as the store's initial value before the real tenant
// is loaded from the API (never shown — ThemeRenderer/admin set the real one).
export const emptyRestaurant: Restaurant = {
  id: '',
  name: '',
  slug: '',
  themeId: 'aria',
  logo: '',
  coverImage: '',
  tagline: { hy: '', en: '', ru: '' },
  address: '',
  workingHours: '',
  rating: 0,
  defaultLanguage: 'hy',
  activeLanguages: ['hy', 'en', 'ru'],
}

// Theme catalog presented in the admin's Design section (static product data).
export const THEMES: Theme[] = [
  {
    id: 'aria',
    name: 'Aria',
    description: 'Մոդեռն, պրեմիում, պատվերի զամբյուղով',
    bestFor: 'Ժամանակակից սրճարան / բիստրո',
    screenshot: '',
    accent: '#C69A5A',
    available: true,
  },
  {
    id: 'atelier',
    name: 'Atelier',
    description: 'Խմբագրական, fine-dining, նրբագեղ',
    bestFor: 'Բարձրակարգ ռեստորան',
    screenshot: '',
    accent: '#A1502E',
    available: true,
  },
  {
    id: 'maison',
    name: 'Maison',
    description: 'Լյուքս, իմերսիվ, ամսագրային',
    bestFor: 'Հեղինակային / signature վայր',
    screenshot: '',
    accent: '#B08A4F',
    available: true,
  },
  {
    id: 'heritage',
    name: 'Heritage',
    description: 'Տաք, ավանդական, դասական',
    bestFor: 'Ընտանեկան ազգային ճաշարան',
    screenshot: '',
    accent: '#C69A5A',
    available: true,
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Մուգ, դրամատիկ, գիշերային (շուտով)',
    bestFor: 'Բար / lounge',
    screenshot: '',
    accent: '#1A1A1A',
    available: false,
  },
]
