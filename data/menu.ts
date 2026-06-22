export type Lang = 'AM' | 'EN' | 'RU'

export type BadgeKey = 'hit' | 'best' | 'new'

export interface LocalizedText {
  AM: string
  EN: string
  RU: string
}

export interface MenuItem {
  id: string
  image: string
  price: number
  name: LocalizedText
  description: LocalizedText
  badge?: BadgeKey
}

export interface MenuCategory {
  id: string
  icon: string
  title: LocalizedText
  items: MenuItem[]
}

export const badgeLabels: Record<BadgeKey, { icon: string; text: LocalizedText }> = {
  hit: {
    icon: '🔥',
    text: { AM: 'Հիթ', EN: 'Hit', RU: 'Хит' },
  },
  best: {
    icon: '⭐',
    text: { AM: 'Ամենավաճառվող', EN: 'Bestseller', RU: 'Хит продаж' },
  },
  new: {
    icon: '🆕',
    text: { AM: 'Նոր', EN: 'New', RU: 'Новинка' },
  },
}

export const ui = {
  tagline: {
    AM: '«Ավանդական հայկական համեր»',
    EN: '“Traditional Armenian flavors”',
    RU: '«Традиционные армянские вкусы»',
  },
  city: { AM: 'Երևան', EN: 'Yerevan', RU: 'Ереван' },
  hours: { AM: '09:00 – 23:00', EN: '09:00 – 23:00', RU: '09:00 – 23:00' },
  searchPlaceholder: {
    AM: 'Որոնել ուտեստ',
    EN: 'Search a dish',
    RU: 'Поиск блюда',
  },
  noResults: {
    AM: 'Համընկնող ուտեստ չի գտնվել',
    EN: 'No matching dishes found',
    RU: 'Блюда не найдены',
  },
  currency: { AM: '֏', EN: '֏', RU: '֏' },
  footerNote: {
    AM: 'Պատրաստված է սիրով և ավանդույթով',
    EN: 'Made with love and tradition',
    RU: 'Приготовлено с любовью и традицией',
  },
} as const

export const menu: MenuCategory[] = [
  {
    id: 'breakfast',
    icon: '🍳',
    title: { AM: 'Նախաճաշ', EN: 'Breakfast', RU: 'Завтрак' },
    items: [
      {
        id: 'smbukov-dzvatzegh',
        image: '/images/smbukov-dzvatzegh.png',
        price: 1500,
        name: {
          AM: 'Սմբուկով ձվածեղ',
          EN: 'Eggplant Omelette',
          RU: 'Яичница с баклажанами',
        },
        description: {
          AM: 'Թարմ ձու՝ տապակած սմբուկով և կանաչիով',
          EN: 'Fresh eggs with sautéed eggplant and herbs',
          RU: 'Свежие яйца с обжаренными баклажанами и зеленью',
        },
        badge: 'best',
      },
      {
        id: 'gyughakan-dzvatzegh',
        image: '/images/gyughakan-dzvatzegh.png',
        price: 1800,
        name: {
          AM: 'Գյուղական ձվածեղ',
          EN: 'Village Scrambled Eggs',
          RU: 'Деревенская яичница',
        },
        description: {
          AM: 'Տնական ձվածեղ՝ լոլիկով և պղպեղով',
          EN: 'Homemade scramble with tomato and peppers',
          RU: 'Домашняя яичница с томатами и перцем',
        },
      },
      {
        id: 'shakshuka',
        image: '/images/shakshuka.png',
        price: 2200,
        name: { AM: 'Շակշուկա', EN: 'Shakshuka', RU: 'Шакшука' },
        description: {
          AM: 'Ձու՝ համեմված լոլիկի և պղպեղի սոուսում',
          EN: 'Eggs poached in a spiced tomato pepper sauce',
          RU: 'Яйца в пряном томатно-перечном соусе',
        },
        badge: 'hit',
      },
    ],
  },
  {
    id: 'salads',
    icon: '🥗',
    title: { AM: 'Աղցաններ', EN: 'Salads', RU: 'Салаты' },
    items: [
      {
        id: 'kesar-aghtsan',
        image: '/images/kesar-aghtsan.png',
        price: 2900,
        name: { AM: 'Կեսար աղցան', EN: 'Caesar Salad', RU: 'Салат Цезарь' },
        description: {
          AM: 'Թարմ հազար, հավի միս, պանիր և քրուտոններ',
          EN: 'Crisp romaine, chicken, parmesan and croutons',
          RU: 'Хрустящий салат романо, курица, пармезан и гренки',
        },
        badge: 'best',
      },
      {
        id: 'hunakan-aghtsan',
        image: '/images/hunakan-aghtsan.png',
        price: 2500,
        name: { AM: 'Հունական աղցան', EN: 'Greek Salad', RU: 'Греческий салат' },
        description: {
          AM: 'Լոլիկ, վարունգ, ձիթապտուղ և ֆետա պանիր',
          EN: 'Tomato, cucumber, olives and feta cheese',
          RU: 'Томаты, огурцы, оливки и сыр фета',
        },
      },
      {
        id: 'tabule',
        image: '/images/tabule.png',
        price: 2300,
        name: { AM: 'Թաբուլե', EN: 'Tabbouleh', RU: 'Табуле' },
        description: {
          AM: 'Մանր կտրատած կանաչի, բուլղուր և անանուխ',
          EN: 'Finely chopped parsley, bulgur and mint',
          RU: 'Мелко рубленая зелень, булгур и мята',
        },
      },
    ],
  },
  {
    id: 'mains',
    icon: '🍽',
    title: {
      AM: 'Հիմնական ուտեստներ',
      EN: 'Main Dishes',
      RU: 'Основные блюда',
    },
    items: [
      {
        id: 'lahmajo',
        image: '/images/lahmajo.png',
        price: 1200,
        name: { AM: 'Լահմաջո', EN: 'Lahmajo', RU: 'Лахмаджо' },
        description: {
          AM: 'Բարակ խմորեղեն՝ համեմված մսով և կանաչիով',
          EN: 'Thin flatbread topped with seasoned meat and herbs',
          RU: 'Тонкая лепёшка с пряным мясом и зеленью',
        },
        badge: 'hit',
      },
      {
        id: 'adana-qyabab',
        image: '/images/adana-qyabab.png',
        price: 3500,
        name: { AM: 'Ադանա քյաբաբ', EN: 'Adana Kebab', RU: 'Адана кебаб' },
        description: {
          AM: 'Խորոված մանր աղացած միս՝ խորոված բանջարեղենով',
          EN: 'Grilled minced meat skewers with grilled vegetables',
          RU: 'Жареный рубленый мясной кебаб с овощами на гриле',
        },
        badge: 'best',
      },
      {
        id: 'khorovats-khozi',
        image: '/images/khorovats-khozi.png',
        price: 4200,
        name: {
          AM: 'Խորոված խոզի միս',
          EN: 'Grilled Pork (Khorovats)',
          RU: 'Свиной шашлык (Хоровац)',
        },
        description: {
          AM: 'Ավանդական խորոված՝ կանաչիով և բանջարեղենով',
          EN: 'Traditional barbecue with herbs and vegetables',
          RU: 'Традиционный шашлык с зеленью и овощами',
        },
        badge: 'new',
      },
    ],
  },
]
