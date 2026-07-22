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
  ordering: false,
  showCartTotal: true,
  serviceChargeEnabled: false,
  serviceChargeMode: 'percent',
  serviceChargePercent: 10,
}

// Theme catalog presented in the admin's Design section (static product data).
export const THEMES: Theme[] = [
  {
    id: 'aria',
    name: 'Aria',
    description: 'Մաքուր, ժամանակակից և հավասարակշռված',
    bestFor: 'Բոլոր տեսակի հաստատությունների համար',
    screenshot: '',
    accent: '#C69A5A',
    available: true,
  },
  {
    id: 'atelier',
    name: 'Atelier',
    description: 'Նրբագեղ, premium և մինիմալ',
    bestFor: 'Պրեմիում հաստատությունների համար',
    screenshot: '',
    accent: '#A1502E',
    available: true,
  },
  {
    id: 'maison',
    name: 'Maison',
    description: 'Ջերմ, հարմարավետ և ընտանեկան',
    bestFor: 'Սրճարանների և ընտանեկան հաստատությունների համար',
    screenshot: '',
    accent: '#B08A4F',
    available: true,
  },
  {
    id: 'heritage',
    name: 'Heritage',
    description: 'Ավանդական, դասական և ազգային',
    bestFor: 'Ազգային և թեմատիկ հաստատությունների համար',
    screenshot: '',
    accent: '#C69A5A',
    available: true,
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Մուգ, ժամանակակից և արտահայտիչ',
    bestFor: 'Բարերի և երեկոյան հաստատությունների համար',
    screenshot: '',
    accent: '#1A1A1A',
    available: false,
  },
]
