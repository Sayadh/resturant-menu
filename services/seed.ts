import type {
  Restaurant,
  RestaurantSettings,
  ThemeSettings,
  Theme,
} from '~/models/types'

// Default restaurant — mirrors the public site's current branding.
export const seedRestaurant: Restaurant = {
  id: 'tun-lahmajo',
  name: 'TUN LAHMAJO',
  slug: 'tun-lahmajo',
  themeId: 'aria',
  logo: '',
  coverImage: '',
  tagline: {
    hy: 'Ավանդական հայկական համեր',
    en: 'Traditional Armenian flavors',
    ru: 'Традиционные армянские вкусы',
  },
  phone: '+374 99 230696',
  address: 'Աբովյան 12, Երևան',
  workingHours: '09:00 – 23:00',
  rating: 4.8,
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    website: 'https://tun-lahmajo.am',
  },
  defaultLanguage: 'hy',
  activeLanguages: ['hy', 'en', 'ru'],
}

export const seedSettings: RestaurantSettings = {
  active: true,
  subdomain: 'tun-lahmajo',
  customDomain: '',
  seoTitle: {
    hy: 'TUN LAHMAJO — Ճաշացանկ',
    en: 'TUN LAHMAJO — Menu',
    ru: 'TUN LAHMAJO — Меню',
  },
  seoDescription: {
    hy: 'Ավանդական հայկական ճաշարան Երևանում',
    en: 'Traditional Armenian restaurant in Yerevan',
    ru: 'Традиционный армянский ресторан в Ереване',
  },
  currency: 'AMD',
  servicePercent: 0,
}

export const seedThemeSettings: ThemeSettings = {
  themeId: 'aria',
  primaryColor: '#3E2723',
  secondaryColor: '#8A7868',
  backgroundColor: '#F5EFE2',
  accentColor: '#C69A5A',
  fontStyle: 'modern',
  logo: '',
  coverImage: '',
  cardRadius: 22,
  showRating: true,
  showOrderBasket: true,
  showFavorites: true,
  showProductDescriptions: true,
}

// Theme catalog presented in the Design section.
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
