export type Lang = 'AM' | 'EN' | 'RU'

export type BadgeKey = 'hit' | 'best' | 'new'

export type GroupKey = 'food' | 'drinks' | 'alcohol'

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
  cover: string
  title: LocalizedText
  items: MenuItem[]
}

export interface MenuGroup {
  id: GroupKey
  icon: string
  title: LocalizedText
  categories: MenuCategory[]
}

/**
 * Per-restaurant theme + branding config.
 * Everything visual (logo text, tagline, cover, colors, font) lives here so
 * the same menu engine can be re-themed for another restaurant.
 */
export interface RestaurantTheme {
  background: string
  card: string
  brown: string
  caramel: string
  herb: string
  border: string
}

export interface RestaurantConfig {
  name: string
  tagline: LocalizedText
  rating: number
  cover: string
  logo?: string
  font: string
  theme: RestaurantTheme
}

export const restaurant: RestaurantConfig = {
  name: 'TUN LAHMAJO',
  tagline: {
    AM: 'Ավանդական հայկական համեր',
    EN: 'Traditional Armenian flavors',
    RU: 'Традиционные армянские вкусы',
  },
  rating: 4.8,
  cover: '/images/hero-cover.png',
  font: 'Cinzel',
  theme: {
    background: '#F5EFE2',
    card: '#FFF9EF',
    brown: '#3E2723',
    caramel: '#C69A5A',
    herb: '#6F8B4A',
    border: '#E4D6C2',
  },
}

export const badgeLabels: Record<BadgeKey, { icon: string; text: LocalizedText }> = {
  hit: {
    icon: '🔥',
    text: { AM: 'Հիթ', EN: 'Hit', RU: 'Хит' },
  },
  best: {
    icon: '⭐',
    text: { AM: 'Խորհուրդ է տրվում', EN: 'Recommended', RU: 'Рекомендуем' },
  },
  new: {
    icon: '🆕',
    text: { AM: 'Նոր', EN: 'New', RU: 'Новинка' },
  },
}

export const ui = {
  rating: { AM: 'վարկանիշ', EN: 'rating', RU: 'рейтинг' },
  city: { AM: 'Երևան', EN: 'Yerevan', RU: 'Ереван' },
  hours: { AM: '09:00 – 23:00', EN: '09:00 – 23:00', RU: '09:00 – 23:00' },
  searchPlaceholder: {
    AM: 'Որոնել ուտեստ կամ խմիչք...',
    EN: 'Search a dish or drink...',
    RU: 'Поиск блюда или напитка...',
  },
  noResults: {
    AM: 'Համընկնող արդյունք չի գտնվել',
    EN: 'No matching results found',
    RU: 'Ничего не найдено',
  },
  itemsCount: {
    AM: 'ուտեստ',
    EN: 'items',
    RU: 'блюд',
  },
  currency: { AM: '֏', EN: '֏', RU: '֏' },
  // Order panel
  order: { AM: 'Պատվեր', EN: 'Order', RU: 'Заказ' },
  myOrder: { AM: 'Իմ պատվերը', EN: 'My Order', RU: 'Мой заказ' },
  emptyOrder: {
    AM: 'Ձեր պատվերը դատարկ է',
    EN: 'Your order is empty',
    RU: 'Ваш заказ пуст',
  },
  total: { AM: 'Ընդամենը', EN: 'Total', RU: 'Итого' },
  clearOrder: { AM: 'Մաքրել', EN: 'Clear', RU: 'Очистить' },
  showWaiter: {
    AM: 'Ցույց տալ մատուցողին',
    EN: 'Show to waiter',
    RU: 'Показать официанту',
  },
  add: { AM: 'Ավելացնել', EN: 'Add', RU: 'Добавить' },
  favorites: { AM: 'Ընտրված', EN: 'Favorites', RU: 'Избранное' },
  footerNote: {
    AM: 'Պատրաստված է սիրով և ավանդույթով',
    EN: 'Made with love and tradition',
    RU: 'Приготовлено с любовью и традицией',
  },
} as const

export const groups: MenuGroup[] = [
  {
    id: 'food',
    icon: '🍽️',
    title: { AM: 'Ուտեստներ', EN: 'Food', RU: 'Блюда' },
    categories: [
      {
        id: 'breakfast',
        icon: '🍳',
        cover: '/images/shakshuka.png',
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
        cover: '/images/kesar-aghtsan.png',
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
        cover: '/images/khorovats-khozi.png',
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
    ],
  },
  {
    id: 'drinks',
    icon: '🥤',
    title: { AM: 'Ըմպելիքներ', EN: 'Drinks', RU: 'Напитки' },
    categories: [
      {
        id: 'lemonades',
        icon: '🥤',
        cover: '/images/cover-lemonades.png',
        title: { AM: 'Լիմոնադներ', EN: 'Lemonades', RU: 'Лимонады' },
        items: [
          {
            id: 'tarhun-lemonade',
            image: '/images/tarhun-lemonade.png',
            price: 900,
            name: { AM: 'Թարխունի լիմոնադ', EN: 'Tarragon Lemonade', RU: 'Лимонад тархун' },
            description: {
              AM: 'Տնական լիմոնադ՝ թարխունով և անանուխով',
              EN: 'Homemade lemonade with tarragon and mint',
              RU: 'Домашний лимонад с тархуном и мятой',
            },
            badge: 'hit',
          },
          {
            id: 'classic-lemonade',
            image: '/images/classic-lemonade.png',
            price: 800,
            name: { AM: 'Դասական լիմոնադ', EN: 'Classic Lemonade', RU: 'Классический лимонад' },
            description: {
              AM: 'Թարմ կիտրոն, անանուխ և սառույց',
              EN: 'Fresh lemon, mint and ice',
              RU: 'Свежий лимон, мята и лёд',
            },
          },
          {
            id: 'berry-lemonade',
            image: '/images/berry-lemonade.png',
            price: 1000,
            name: { AM: 'Հատապտղային լիմոնադ', EN: 'Berry Lemonade', RU: 'Ягодный лимонад' },
            description: {
              AM: 'Ազնվամորու համով թարմ լիմոնադ',
              EN: 'Refreshing lemonade with raspberry',
              RU: 'Освежающий лимонад с малиной',
            },
            badge: 'new',
          },
        ],
      },
      {
        id: 'hot-drinks',
        icon: '☕',
        cover: '/images/cover-hotdrinks.png',
        title: { AM: 'Տաք ըմպելիքներ', EN: 'Hot Drinks', RU: 'Горячие напитки' },
        items: [
          {
            id: 'armenian-coffee',
            image: '/images/armenian-coffee.png',
            price: 700,
            name: { AM: 'Հայկական սուրճ', EN: 'Armenian Coffee', RU: 'Армянский кофе' },
            description: {
              AM: 'Ավանդական սուրճ՝ եփած ջեզվեում',
              EN: 'Traditional coffee brewed in a cezve',
              RU: 'Традиционный кофе, сваренный в джезве',
            },
            badge: 'best',
          },
          {
            id: 'herbal-tea',
            image: '/images/herbal-tea.png',
            price: 600,
            name: { AM: 'Լեռնային թեյ', EN: 'Mountain Herbal Tea', RU: 'Горный травяной чай' },
            description: {
              AM: 'Հայկական լեռների խոտաբույսերից թեյ',
              EN: 'Tea from Armenian mountain herbs',
              RU: 'Чай из трав армянских гор',
            },
          },
          {
            id: 'cappuccino',
            image: '/images/cappuccino.png',
            price: 900,
            name: { AM: 'Կապուչինո', EN: 'Cappuccino', RU: 'Капучино' },
            description: {
              AM: 'Փրփրուն կաթով դասական կապուչինո',
              EN: 'Classic cappuccino with creamy foam',
              RU: 'Классический капучино с молочной пеной',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'alcohol',
    icon: '🍷',
    title: { AM: 'Ալկոհոլ', EN: 'Alcohol', RU: 'Алкоголь' },
    categories: [
      {
        id: 'wine',
        icon: '🍷',
        cover: '/images/cover-wine.png',
        title: { AM: 'Գինի', EN: 'Wine', RU: 'Вино' },
        items: [
          {
            id: 'red-wine',
            image: '/images/red-wine.png',
            price: 1800,
            name: { AM: 'Կարմիր գինի (Արենի)', EN: 'Red Wine (Areni)', RU: 'Красное вино (Арени)' },
            description: {
              AM: 'Հայկական Արենի՝ հարուստ և թավշյա համով',
              EN: 'Armenian Areni with a rich velvety taste',
              RU: 'Армянское Арени с богатым бархатным вкусом',
            },
            badge: 'best',
          },
          {
            id: 'white-wine',
            image: '/images/white-wine.png',
            price: 1700,
            name: { AM: 'Սպիտակ գինի', EN: 'White Wine', RU: 'Белое вино' },
            description: {
              AM: 'Սառեցված սպիտակ գինի՝ թեթև բուրմունքով',
              EN: 'Chilled white wine with a light aroma',
              RU: 'Охлаждённое белое вино с лёгким ароматом',
            },
          },
        ],
      },
      {
        id: 'beer',
        icon: '🍺',
        cover: '/images/cover-beer.png',
        title: { AM: 'Գարեջուր', EN: 'Beer', RU: 'Пиво' },
        items: [
          {
            id: 'draft-beer',
            image: '/images/draft-beer.png',
            price: 1200,
            name: { AM: 'Կարագ գարեջուր', EN: 'Draft Lager', RU: 'Разливное пиво' },
            description: {
              AM: 'Ոսկեգույն թարմ գարեջուր՝ խիտ փրփուրով',
              EN: 'Golden fresh lager with a thick foam head',
              RU: 'Золотистое свежее пиво с густой пеной',
            },
            badge: 'hit',
          },
          {
            id: 'dark-beer',
            image: '/images/dark-beer.png',
            price: 1400,
            name: { AM: 'Մուգ գարեջուր', EN: 'Dark Craft Beer', RU: 'Тёмное пиво' },
            description: {
              AM: 'Մուգ գարեջուր՝ կարամելի նրբերանգով',
              EN: 'Dark beer with caramel notes',
              RU: 'Тёмное пиво с карамельными нотами',
            },
          },
        ],
      },
    ],
  },
]
