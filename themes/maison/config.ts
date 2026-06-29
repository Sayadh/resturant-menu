// ─────────────────────────────────────────────────────────────────────────
// Maison theme configuration
//
// "Maison" (themeId: "maison") is the flagship, immersive luxury experience —
// a completely independent design from both Aria and Atelier. It is rendered
// by themes/maison/layouts/MaisonExperience.vue and reads ALL data from the
// shared Pinia stores, so switching themes never changes data, language,
// search or order logic. This file owns everything specific to the Maison
// look: branding, palette tokens and the editorial copy that turns the menu
// into a story.
//
// Design language: luxury lifestyle / food magazine. Ivory + chocolate + gold.
// Inspiration: Aman, Aesop, Louis Vuitton, Four Seasons, Kinfolk, Michelin.
// ─────────────────────────────────────────────────────────────────────────
import type { LocalizedText } from '~/data/menu'

export const maisonThemeId = 'maison' as const

/** Warm ivory / chocolate / soft-gold palette — intentionally unlike Aria & Atelier. */
export const maisonColors = {
  ivory: '#F4EEE2', // page background (warm ivory)
  warmWhite: '#FBF8F1', // elevated light surfaces
  chocolate: '#241B14', // near-black espresso — dark sections & text
  espresso: '#3B2C20', // softer dark
  gold: '#B08A4F', // soft gold accent
  goldSoft: '#C9AC7C', // lighter gold
  olive: '#6E6B4B', // natural olive secondary accent
  warmGray: '#8C8276', // muted text
  line: '#DFD5C4', // hairlines
} as const

/** Restaurant branding shown across the Maison experience. */
export const maisonBrand = {
  name: 'TUN LAHMAJO',
  monogram: 'TL',
  /** Editorial eyebrow above the wordmark. */
  established: 'MAISON · EST. 1998',
  city: { AM: 'Երևան', EN: 'Yerevan', RU: 'Ереван' } satisfies LocalizedText,
  kicker: {
    AM: 'Հայկական տուն',
    EN: 'An Armenian House',
    RU: 'Армянский дом',
  } satisfies LocalizedText,
  tagline: {
    AM: 'Ավանդույթ, հյուրընկալություն և համ՝ սերնդեսերունդ',
    EN: 'Tradition, hospitality and flavor, passed down through generations',
    RU: 'Традиция, гостеприимство и вкус, передаваемые из поколения в поколение',
  } satisfies LocalizedText,
  rating: '4.9',
  reviews: {
    AM: '320 կարծիք',
    EN: '320 reviews',
    RU: '320 отзывов',
  } satisfies LocalizedText,
  hours: '09:00 — 23:00',
} as const

/** Hero "enter the house" copy. */
export const maisonHero = {
  welcome: { AM: 'Բարի գալուստ', EN: 'Welcome to', RU: 'Добро пожаловать в' } satisfies LocalizedText,
  enter: { AM: 'Բացել ընտրացանկը', EN: 'Enter the menu', RU: 'Открыть меню' } satisfies LocalizedText,
  scroll: { AM: 'Թերթեք', EN: 'Scroll to explore', RU: 'Листайте' } satisfies LocalizedText,
} as const

/** The restaurant's story chapter. */
export const maisonStory = {
  chapter: { AM: 'Մեր պատմությունը', EN: 'Our Story', RU: 'Наша история' } satisfies LocalizedText,
  title: {
    AM: 'Ամեն ուտեստ՝ մի հիշողություն',
    EN: 'Every dish, a memory',
    RU: 'Каждое блюдо — это воспоминание',
  } satisfies LocalizedText,
  body: {
    AM: 'Քսանհինգ տարի մենք պատրաստում ենք հայկական խոհանոցի ամենասիրված ուտեստները՝ ձեռքով, ամեն օր։ Բաղադրատոմսերը փոխանցվել են տատիկներից, իսկ սերը՝ մնում է անփոփոխ։',
    EN: 'For twenty-five years we have prepared the most beloved dishes of Armenian cuisine by hand, every single day. The recipes were passed down from our grandmothers, and the love has never changed.',
    RU: 'Двадцать пять лет мы готовим самые любимые блюда армянской кухни вручную, каждый день. Рецепты передались от наших бабушек, а любовь осталась неизменной.',
  } satisfies LocalizedText,
  signature: { AM: 'Շեֆ-խոհարար', EN: 'Head Chef', RU: 'Шеф-повар' } satisfies LocalizedText,
} as const

/** "Today's recommendation" + "Chef's selection" section copy. */
export const maisonRecommendation = {
  kicker: { AM: 'Օրվա առաջարկ', EN: "Today's Recommendation", RU: 'Рекомендация дня' } satisfies LocalizedText,
  note: {
    AM: 'Շեֆի անձնական ընտրությունը այսօրվա համար',
    EN: "The chef's personal choice for today",
    RU: 'Личный выбор шефа на сегодня',
  } satisfies LocalizedText,
} as const

export const maisonChefSelection = {
  kicker: { AM: 'Շեֆի ընտրանին', EN: "The Chef's Selection", RU: 'Выбор шефа' } satisfies LocalizedText,
  title: {
    AM: 'Տան առանձնահատուկ ուտեստները',
    EN: 'Signatures of the house',
    RU: 'Фирменные блюда дома',
  } satisfies LocalizedText,
} as const

/** Category index intro. */
export const maisonCategories = {
  kicker: { AM: 'Ընտրացանկ', EN: 'The Menu', RU: 'Меню' } satisfies LocalizedText,
  title: {
    AM: 'Ուսումնասիրեք մեր ընտրացանկը',
    EN: 'Explore our collection',
    RU: 'Изучите нашу коллекцию',
  } satisfies LocalizedText,
  explore: { AM: 'Բացել', EN: 'Explore', RU: 'Открыть' } satisfies LocalizedText,
  dishesWord: { AM: 'ուտեստ', EN: 'dishes', RU: 'блюд' } satisfies LocalizedText,
  back: { AM: 'Բոլոր բաժինները', EN: 'All sections', RU: 'Все разделы' } satisfies LocalizedText,
} as const

/** Alcohol gets its own label inside the Drinks level (data unchanged). */
export const maisonAlcoholTitle: LocalizedText = {
  AM: 'Ալկոհոլ',
  EN: 'The Cellar',
  RU: 'Погреб',
}

/** Search reveal copy. */
export const maisonSearch = {
  placeholder: { AM: 'Որոնել ուտեստ…', EN: 'Search a dish…', RU: 'Поиск блюда…' } satisfies LocalizedText,
  open: { AM: 'Որոնում', EN: 'Search', RU: 'Поиск' } satisfies LocalizedText,
  results: { AM: 'Արդյունքներ', EN: 'Results', RU: 'Результаты' } satisfies LocalizedText,
} as const

/** Order / basket drawer copy. */
export const maisonOrder = {
  title: { AM: 'Ձեր ընտրությունը', EN: 'Your Selection', RU: 'Ваш выбор' } satisfies LocalizedText,
  subtitle: { AM: 'Պատրաստ մատուցողին ցույց տալու', EN: 'Ready to show your waiter', RU: 'Готово показать официанту' } satisfies LocalizedText,
  empty: {
    AM: 'Ձեր ընտրությունը դեռ դատարկ է։ Թերթեք ընտրացանկը և ավելացրեք ձեր սիրելի ուտեստները։',
    EN: 'Your selection is still empty. Browse the menu and add your favorites.',
    RU: 'Ваш выбор пока пуст. Пролистайте меню и добавьте любимые блюда.',
  } satisfies LocalizedText,
  itemsWord: { AM: 'ուտեստ', EN: 'items', RU: 'блюд' } satisfies LocalizedText,
  view: { AM: 'Ընտրություն', EN: 'Selection', RU: 'Выбор' } satisfies LocalizedText,
  add: { AM: 'Ավելացնել', EN: 'Add to selection', RU: 'Добавить' } satisfies LocalizedText,
} as const

/** Footer closing line. */
export const maisonFooterNote: LocalizedText = {
  AM: 'Պատրաստված է սիրով, ամեն օր',
  EN: 'Crafted with love, every day',
  RU: 'Создано с любовью, каждый день',
}
