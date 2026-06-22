export type Lang = 'AM' | 'EN' | 'RU'

export type BadgeKey = 'hit' | 'best' | 'new'

export type MenuLevelId = 'food' | 'drinks'

/** Sub-grouping used only inside the Drinks level. */
export type DrinkGroup = 'soft' | 'alcohol'

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
  level: MenuLevelId
  /** Required for drinks categories: marks alcoholic vs non-alcoholic. */
  group?: DrinkGroup
  icon: string
  title: LocalizedText
  items: MenuItem[]
}

export interface MenuLevel {
  id: MenuLevelId
  icon: string
  title: LocalizedText
}

export interface DrinkGroupInfo {
  id: DrinkGroup
  icon: string
  title: LocalizedText
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
  address: {
    AM: 'Աբովյան 12, Երևան',
    EN: '12 Abovyan St, Yerevan',
    RU: 'ул. Абовян 12, Ереван',
  },
  hours: { AM: '09:00 – 23:00', EN: '09:00 – 23:00', RU: '09:00 – 23:00' },
  openNow: { AM: 'Բաց է հիմա', EN: 'Open now', RU: 'Открыто' },
  rating: '4.9',
  reviews: {
    AM: '320 կարծիք',
    EN: '320 reviews',
    RU: '320 отзывов',
  },
  dishCount: { AM: 'ուտեստ', EN: 'items', RU: 'блюд' },
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

export const levels: MenuLevel[] = [
  { id: 'food', icon: '🍽', title: { AM: 'Ուտեստներ', EN: 'Food', RU: 'Еда' } },
  { id: 'drinks', icon: '🥤', title: { AM: 'Ըմպելիքներ', EN: 'Drinks', RU: 'Напитки' } },
]

/** Second-level toggle inside the Drinks section. */
export const drinkGroups: DrinkGroupInfo[] = [
  { id: 'soft', icon: '🧃', title: { AM: 'Ոչ ալկոհոլային', EN: 'Non-Alcoholic', RU: 'Безалкогольные' } },
  { id: 'alcohol', icon: '🍷', title: { AM: 'Ալկոհոլային', EN: 'Alcoholic', RU: 'Алкогольные' } },
]

// Images: items with a curated local photo use /images/*.png. For everything
// else we intentionally return '' — the card then renders a reliable, on-brand
// category tile (icon on a warm gradient) instead of an unreliable random remote
// photo that may not load or may not match the dish. To use a real photo for an
// item, drop a file in /public/images and set `image: '/images/<name>.png'`.
// The `tags` argument is ignored on purpose (kept so item definitions are stable).
const img = (_tags: string): string => ''

export const menu: MenuCategory[] = [
  // ════════════════════════════ FOOD ════════════════════════════
  {
    id: 'breakfast',
    level: 'food',
    icon: '🍳',
    title: { AM: 'Նախաճաշ', EN: 'Breakfast', RU: 'Завтрак' },
    items: [
      {
        id: 'smbukov-dzvatzegh',
        image: '/images/smbukov-dzvatzegh.png',
        price: 1500,
        name: { AM: 'Սմբուկով ձվածեղ', EN: 'Eggplant Omelette', RU: 'Яичница с баклажанами' },
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
        name: { AM: 'Գյուղական ձվածեղ', EN: 'Village Scrambled Eggs', RU: 'Деревенская яичница' },
        description: {
          AM: 'Թարմ ձու, լոլիկ, կանաչի',
          EN: 'Fresh eggs, tomatoes and herbs',
          RU: 'Свежие яйца, томаты и зелень',
        },
      },
      {
        id: 'dzvatzegh-panrov',
        image: '',
        price: 2200,
        name: { AM: 'Ձվածեղ պանրով', EN: 'Cheese Omelette', RU: 'Омлет с сыром' },
        description: {
          AM: 'Ձվածեղ հայկական պանրով',
          EN: 'Omelette with Armenian cheese',
          RU: 'Омлет с армянским сыром',
        },
      },
      {
        id: 'shakshuka',
        image: '/images/shakshuka.png',
        price: 2600,
        name: { AM: 'Շակշուկա', EN: 'Shakshuka', RU: 'Шакшука' },
        description: {
          AM: 'Ձու՝ եփած լոլիկի սոուսում',
          EN: 'Eggs poached in a spiced tomato sauce',
          RU: 'Яйца в пряном томатном соусе',
        },
        badge: 'hit',
      },
      {
        id: 'nakhachashi-havaqatsu',
        image: img('breakfast,platter'),
        price: 4500,
        name: { AM: 'Նախաճաշի հավաքածու', EN: 'Breakfast Set', RU: 'Завтрак-сет' },
        description: {
          AM: 'Պանիր, կարագ, մուրաբա, ձու, հաց',
          EN: 'Cheese, butter, jam, eggs and bread',
          RU: 'Сыр, масло, варенье, яйца и хлеб',
        },
      },
      {
        id: 'basturmayov-dzvatzegh',
        image: img('omelette,bacon'),
        price: 2800,
        name: { AM: 'Բաստուրմայով ձվածեղ', EN: 'Basturma Omelette', RU: 'Омлет с бастурмой' },
        description: {
          AM: 'Ձվածեղ բաստուրմայով',
          EN: 'Omelette with basturma',
          RU: 'Омлет с бастурмой',
        },
      },
    ],
  },
  {
    id: 'appetizers',
    level: 'food',
    icon: '🥟',
    title: { AM: 'Նախուտեստներ', EN: 'Appetizers', RU: 'Закуски' },
    items: [
      {
        id: 'panri-tesakani',
        image: img('cheese,platter'),
        price: 3500,
        name: { AM: 'Պանրի տեսականի', EN: 'Cheese Platter', RU: 'Сырная тарелка' },
        description: {
          AM: 'Հայկական պանիրների տեսականի',
          EN: 'Selection of Armenian cheeses',
          RU: 'Ассорти армянских сыров',
        },
        badge: 'best',
      },
      {
        id: 'ttuneri-tesakani',
        image: img('pickles'),
        price: 2200,
        name: { AM: 'Թթուների տեսականի', EN: 'Pickles Platter', RU: 'Соленья' },
        description: {
          AM: 'Տնական թթուներ',
          EN: 'Homemade pickles',
          RU: 'Домашние соленья',
        },
      },
      {
        id: 'tarm-kanachi',
        image: img('fresh,herbs,greens'),
        price: 1500,
        name: { AM: 'Թարմ կանաչի', EN: 'Fresh Herbs', RU: 'Свежая зелень' },
        description: {
          AM: 'Սեզոնային կանաչի և բանջարեղեն',
          EN: 'Seasonal herbs and vegetables',
          RU: 'Сезонная зелень и овощи',
        },
      },
      {
        id: 'basturma',
        image: img('cured,meat'),
        price: 3200,
        name: { AM: 'Բաստուրմա', EN: 'Basturma', RU: 'Бастурма' },
        description: {
          AM: 'Ավանդական հայկական բաստուրմա',
          EN: 'Traditional Armenian basturma',
          RU: 'Традиционная армянская бастурма',
        },
      },
      {
        id: 'sujukh',
        image: img('sausage,cured'),
        price: 3200,
        name: { AM: 'Սուջուխ', EN: 'Sujukh', RU: 'Суджух' },
        description: {
          AM: 'Ավանդական չորացրած երշիկ',
          EN: 'Traditional cured sausage',
          RU: 'Традиционная вяленая колбаса',
        },
      },
    ],
  },
  {
    id: 'salads',
    level: 'food',
    icon: '🥗',
    title: { AM: 'Աղցաններ', EN: 'Salads', RU: 'Салаты' },
    items: [
      {
        id: 'kesar-aghtsan',
        image: '/images/kesar-aghtsan.png',
        price: 2900,
        name: { AM: 'Կեսար աղցան', EN: 'Caesar Salad', RU: 'Салат Цезарь' },
        description: {
          AM: 'Հավի միս, պարմեզան, թարմ հազար',
          EN: 'Chicken, parmesan and crisp lettuce',
          RU: 'Курица, пармезан и хрустящий салат',
        },
        badge: 'best',
      },
      {
        id: 'hunakan-aghtsan',
        image: '/images/hunakan-aghtsan.png',
        price: 2500,
        name: { AM: 'Հունական աղցան', EN: 'Greek Salad', RU: 'Греческий салат' },
        description: {
          AM: 'Թարմ բանջարեղեն և ֆետա պանիր',
          EN: 'Fresh vegetables and feta cheese',
          RU: 'Свежие овощи и сыр фета',
        },
      },
      {
        id: 'tabule',
        image: '/images/tabule.png',
        price: 2300,
        name: { AM: 'Թաբուլե', EN: 'Tabbouleh', RU: 'Табуле' },
        description: {
          AM: 'Մաղադանոս, բուլղուր, կիտրոն',
          EN: 'Parsley, bulgur and lemon',
          RU: 'Петрушка, булгур и лимон',
        },
      },
      {
        id: 'amarayin-aghtsan',
        image: img('vegetable,salad'),
        price: 1800,
        name: { AM: 'Ամառային աղցան', EN: 'Summer Salad', RU: 'Летний салат' },
        description: {
          AM: 'Սեզոնային թարմ բանջարեղեն',
          EN: 'Seasonal fresh vegetables',
          RU: 'Сезонные свежие овощи',
        },
      },
      {
        id: 'imam-bayaldi',
        image: img('eggplant'),
        price: 2200,
        name: { AM: 'Իմամ Բայալդի', EN: 'Imam Bayildi', RU: 'Имам Баялды' },
        description: {
          AM: 'Սմբուկի նախուտեստ-աղցան',
          EN: 'Eggplant appetizer salad',
          RU: 'Закуска-салат из баклажанов',
        },
      },
      {
        id: 'havov-aghtsan',
        image: img('chicken,salad'),
        price: 2600,
        name: { AM: 'Հավով աղցան', EN: 'Chicken Salad', RU: 'Салат с курицей' },
        description: {
          AM: 'Հավի մսով աղցան',
          EN: 'Salad with chicken',
          RU: 'Салат с куриным мясом',
        },
      },
    ],
  },
  {
    id: 'soups',
    level: 'food',
    icon: '🍲',
    title: { AM: 'Ապուրներ', EN: 'Soups', RU: 'Супы' },
    items: [
      {
        id: 'spas',
        image: img('yogurt,soup'),
        price: 1600,
        name: { AM: 'Սպաս', EN: 'Spas', RU: 'Спас' },
        description: {
          AM: 'Ավանդական հայկական մածնապուր',
          EN: 'Traditional Armenian yogurt soup',
          RU: 'Традиционный армянский суп на мацуне',
        },
        badge: 'hit',
      },
      {
        id: 'vospov-apur',
        image: img('lentil,soup'),
        price: 1700,
        name: { AM: 'Ոսպով ապուր', EN: 'Lentil Soup', RU: 'Чечевичный суп' },
        description: { AM: 'Ոսպի ապուր', EN: 'Lentil soup', RU: 'Чечевичный суп' },
      },
      {
        id: 'havov-apur',
        image: img('chicken,soup'),
        price: 1900,
        name: { AM: 'Հավով ապուր', EN: 'Chicken Soup', RU: 'Куриный суп' },
        description: { AM: 'Հավի ապուր', EN: 'Chicken soup', RU: 'Куриный суп' },
      },
      {
        id: 'borscht',
        image: img('borscht,soup'),
        price: 2200,
        name: { AM: 'Բորշչ', EN: 'Borscht', RU: 'Борщ' },
        description: { AM: 'Ճակնդեղով ապուր', EN: 'Beetroot soup', RU: 'Свекольный суп' },
      },
      {
        id: 'lobu-apur',
        image: img('bean,soup'),
        price: 1800,
        name: { AM: 'Լոբու ապուր', EN: 'Bean Soup', RU: 'Фасолевый суп' },
        description: { AM: 'Լոբու ապուր', EN: 'Bean soup', RU: 'Фасолевый суп' },
      },
    ],
  },
  {
    id: 'main-dishes',
    level: 'food',
    icon: '🍽',
    title: { AM: 'Հիմնական ուտեստներ', EN: 'Main Dishes', RU: 'Основные блюда' },
    items: [
      {
        id: 'lahmajo',
        image: '/images/lahmajo.png',
        price: 1200,
        name: { AM: 'Լահմաջո', EN: 'Lahmajo', RU: 'Лахмаджо' },
        description: {
          AM: 'Ավանդական հայկական լահմաջո',
          EN: 'Traditional Armenian lahmajo',
          RU: 'Традиционное армянское лахмаджо',
        },
        badge: 'hit',
      },
      {
        id: 'panrov-lahmajo',
        image: img('lahmacun,cheese'),
        price: 1500,
        name: { AM: 'Պանրով լահմաջո', EN: 'Lahmajo with Cheese', RU: 'Лахмаджо с сыром' },
        description: {
          AM: 'Լահմաջո պանրով',
          EN: 'Lahmajo with cheese',
          RU: 'Лахмаджо с сыром',
        },
      },
      {
        id: 'ajarakan-khachapuri',
        image: img('khachapuri'),
        price: 3500,
        name: { AM: 'Աջարական խաչապուրի', EN: 'Adjarian Khachapuri', RU: 'Аджарский хачапури' },
        description: {
          AM: 'Վրացական պանրով հաց ձվով',
          EN: 'Georgian cheese bread with egg',
          RU: 'Грузинская лепёшка с сыром и яйцом',
        },
        badge: 'best',
      },
      {
        id: 'imerakan-khachapuri',
        image: img('khachapuri,bread'),
        price: 3200,
        name: { AM: 'Իմերական խաչապուրի', EN: 'Imeretian Khachapuri', RU: 'Имеретинский хачапури' },
        description: {
          AM: 'Ավանդական խաչապուրի',
          EN: 'Traditional khachapuri',
          RU: 'Традиционный хачапури',
        },
      },
      {
        id: 'tolma',
        image: img('dolma'),
        price: 3800,
        name: { AM: 'Տոլմա', EN: 'Tolma', RU: 'Толма' },
        description: {
          AM: 'Խաղողի տերևով փաթաթած տոլմա',
          EN: 'Stuffed grape leaves',
          RU: 'Долма в виноградных листьях',
        },
      },
      {
        id: 'khashlama',
        image: img('beef,stew'),
        price: 4900,
        name: { AM: 'Խաշլամա', EN: 'Khashlama', RU: 'Хашлама' },
        description: {
          AM: 'Դանդաղ եփած տավարի մսով ճաշ',
          EN: 'Slow-cooked beef dish',
          RU: 'Тушёная говядина на медленном огне',
        },
      },
      {
        id: 'harisa',
        image: img('porridge,meat'),
        price: 3500,
        name: { AM: 'Հարիսա', EN: 'Harisa', RU: 'Хариса' },
        description: {
          AM: 'Ավանդական հայկական հարիսա',
          EN: 'Traditional Armenian harisa',
          RU: 'Традиционная армянская хариса',
        },
      },
      {
        id: 'tjvjik',
        image: img('liver,fried'),
        price: 3800,
        name: { AM: 'Տժվժիկ', EN: 'Tjvjik', RU: 'Тжвжик' },
        description: {
          AM: 'Հայկական լյարդի յուրահատկություն',
          EN: 'Armenian liver specialty',
          RU: 'Армянское блюдо из печени',
        },
      },
    ],
  },
  {
    id: 'fish',
    level: 'food',
    icon: '🐟',
    title: { AM: 'Ձուկ', EN: 'Fish', RU: 'Рыба' },
    items: [
      {
        id: 'sig-khorovats',
        image: img('grilled,fish'),
        price: 4800,
        name: { AM: 'Սիգ խորոված', EN: 'Grilled Whitefish', RU: 'Сиг на гриле' },
        description: { AM: 'Խորոված սիգ ձուկ', EN: 'Grilled whitefish', RU: 'Сиг на гриле' },
      },
      {
        id: 'ishkhan-khorovats',
        image: img('grilled,trout'),
        price: 5200,
        name: { AM: 'Իշխան խորոված', EN: 'Grilled Trout', RU: 'Форель на гриле' },
        description: { AM: 'Խորոված իշխան', EN: 'Grilled trout', RU: 'Форель на гриле' },
        badge: 'best',
      },
      {
        id: 'ishkhan-banjareghenov',
        image: img('trout,vegetables'),
        price: 5800,
        name: { AM: 'Իշխան բանջարեղենով', EN: 'Trout with Vegetables', RU: 'Форель с овощами' },
        description: {
          AM: 'Իշխան թարմ բանջարեղենով',
          EN: 'Trout with fresh vegetables',
          RU: 'Форель со свежими овощами',
        },
      },
      {
        id: 'saghmon-steyk',
        image: img('salmon,steak'),
        price: 8900,
        name: { AM: 'Սաղմոն սթեյք', EN: 'Salmon Steak', RU: 'Стейк из лосося' },
        description: { AM: 'Սաղմոնի սթեյք', EN: 'Salmon steak', RU: 'Стейк из лосося' },
      },
    ],
  },
  {
    id: 'bbq-grill',
    level: 'food',
    icon: '🍖',
    title: { AM: 'Խորոված և գրիլ', EN: 'BBQ & Grill', RU: 'Барбекю и гриль' },
    items: [
      {
        id: 'khozi-khorovats',
        image: '/images/khorovats-khozi.png',
        price: 3600,
        name: { AM: 'Խոզի խորոված', EN: 'Pork BBQ', RU: 'Свиной шашлык' },
        description: {
          AM: 'Փափուկ խոզի մսի խորոված ածուխի վրա',
          EN: 'Tender charcoal-grilled pork',
          RU: 'Нежная свинина на углях',
        },
        badge: 'new',
      },
      {
        id: 'tavari-khorovats',
        image: img('beef,grill'),
        price: 4200,
        name: { AM: 'Տավարի խորոված', EN: 'Beef BBQ', RU: 'Говяжий шашлык' },
        description: {
          AM: 'Հյութալի տավարի խորոված',
          EN: 'Juicy grilled beef',
          RU: 'Сочная говядина на гриле',
        },
      },
      {
        id: 'garan-khorovats',
        image: img('lamb,grill'),
        price: 4600,
        name: { AM: 'Գառան խորոված', EN: 'Lamb BBQ', RU: 'Шашлык из баранины' },
        description: {
          AM: 'Ավանդական գառան խորոված',
          EN: 'Traditional grilled lamb',
          RU: 'Традиционный шашлык из баранины',
        },
      },
      {
        id: 'havi-khorovats',
        image: img('chicken,grill'),
        price: 2900,
        name: { AM: 'Հավի խորոված', EN: 'Chicken BBQ', RU: 'Куриный шашлык' },
        description: {
          AM: 'Մարինացված հավի խորոված',
          EN: 'Marinated grilled chicken',
          RU: 'Маринованная курица на гриле',
        },
      },
      {
        id: 'tavari-qyabab',
        image: img('kebab,beef'),
        price: 2400,
        name: { AM: 'Տավարի քյաբաբ', EN: 'Beef Kebab', RU: 'Говяжий кебаб' },
        description: {
          AM: 'Տավարի աղացած մսից քյաբաբ',
          EN: 'Minced beef kebab',
          RU: 'Кебаб из рубленой говядины',
        },
      },
      {
        id: 'havi-qyabab',
        image: img('kebab,chicken'),
        price: 2200,
        name: { AM: 'Հավի քյաբաբ', EN: 'Chicken Kebab', RU: 'Куриный кебаб' },
        description: {
          AM: 'Հավի մսից փափուկ քյաբաբ',
          EN: 'Tender chicken kebab',
          RU: 'Нежный куриный кебаб',
        },
      },
      {
        id: 'adana-qyabab',
        image: '/images/adana-qyabab.png',
        price: 2900,
        name: { AM: 'Ադանա քյաբաբ', EN: 'Adana Kebab', RU: 'Адана кебаб' },
        description: {
          AM: 'Կծու ադանա քյաբաբ համեմունքներով',
          EN: 'Spicy Adana kebab with spices',
          RU: 'Острый кебаб Адана со специями',
        },
        badge: 'best',
      },
      {
        id: 'khary-gril',
        image: img('mixed,grill,platter'),
        price: 8900,
        name: { AM: 'Խառը գրիլ', EN: 'Mixed Grill', RU: 'Микс-гриль' },
        description: {
          AM: 'Մսի տեսականի՝ խորոված և քյաբաբ',
          EN: 'Assorted grilled meats and kebabs',
          RU: 'Ассорти мяса на гриле и кебабов',
        },
      },
    ],
  },
  {
    id: 'shawarma',
    level: 'food',
    icon: '🌯',
    title: { AM: 'Շաուրմա', EN: 'Shawarma', RU: 'Шаурма' },
    items: [
      {
        id: 'havi-shawarma',
        image: img('shawarma,chicken'),
        price: 1900,
        name: { AM: 'Հավի շաուրմա', EN: 'Chicken Shawarma', RU: 'Куриная шаурма' },
        description: {
          AM: 'Հավի շաուրմա թարմ լավաշով',
          EN: 'Chicken shawarma in fresh lavash',
          RU: 'Куриная шаурма в свежем лаваше',
        },
        badge: 'hit',
      },
      {
        id: 'tavari-shawarma',
        image: img('shawarma,beef'),
        price: 2400,
        name: { AM: 'Տավարի շաուրմա', EN: 'Beef Shawarma', RU: 'Говяжья шаурма' },
        description: {
          AM: 'Տավարի մսով հյութալի շաուրմա',
          EN: 'Juicy beef shawarma',
          RU: 'Сочная говяжья шаурма',
        },
      },
      {
        id: 'khary-shawarma',
        image: img('shawarma,doner'),
        price: 2600,
        name: { AM: 'Խառը շաուրմա', EN: 'Mixed Shawarma', RU: 'Микс шаурма' },
        description: {
          AM: 'Հավի և տավարի խառը շաուրմա',
          EN: 'Mixed chicken and beef shawarma',
          RU: 'Смешанная шаурма из курицы и говядины',
        },
      },
      {
        id: 'panrov-shawarma',
        image: img('shawarma,cheese'),
        price: 2300,
        name: { AM: 'Պանրով շաուրմա', EN: 'Cheese Shawarma', RU: 'Шаурма с сыром' },
        description: {
          AM: 'Շաուրմա պանրով',
          EN: 'Shawarma with cheese',
          RU: 'Шаурма с сыром',
        },
      },
    ],
  },
  {
    id: 'desserts',
    level: 'food',
    icon: '🍰',
    title: { AM: 'Աղանդեր', EN: 'Desserts', RU: 'Десерты' },
    items: [
      {
        id: 'gata',
        image: img('pastry,sweet'),
        price: 1200,
        name: { AM: 'Գաթա', EN: 'Gata', RU: 'Гата' },
        description: {
          AM: 'Ավանդական հայկական գաթա',
          EN: 'Traditional Armenian gata',
          RU: 'Традиционная армянская гата',
        },
      },
      {
        id: 'pakhlava',
        image: img('baklava'),
        price: 1500,
        name: { AM: 'Փախլավա', EN: 'Baklava', RU: 'Пахлава' },
        description: {
          AM: 'Մեղրով և ընկույզով փախլավա',
          EN: 'Baklava with honey and walnuts',
          RU: 'Пахлава с мёдом и грецкими орехами',
        },
        badge: 'best',
      },
      {
        id: 'napoleon',
        image: img('napoleon,cake'),
        price: 1800,
        name: { AM: 'Նապոլեոն', EN: 'Napoleon', RU: 'Наполеон' },
        description: {
          AM: 'Շերտավոր Նապոլեոն կրեմով',
          EN: 'Layered Napoleon with cream',
          RU: 'Слоёный Наполеон с кремом',
        },
      },
      {
        id: 'shokolade-tort',
        image: img('chocolate,cake'),
        price: 1900,
        name: { AM: 'Շոկոլադե տորթ', EN: 'Chocolate Cake', RU: 'Шоколадный торт' },
        description: {
          AM: 'Հարուստ շոկոլադե տորթ',
          EN: 'Rich chocolate cake',
          RU: 'Насыщенный шоколадный торт',
        },
      },
      {
        id: 'paghpaghak',
        image: img('icecream'),
        price: 1200,
        name: { AM: 'Պաղպաղակ', EN: 'Ice Cream', RU: 'Мороженое' },
        description: {
          AM: 'Տնական պաղպաղակ',
          EN: 'Homemade ice cream',
          RU: 'Домашнее мороженое',
        },
      },
    ],
  },

  // ════════════════════════════ DRINKS ════════════════════════════
  {
    id: 'soft-drinks',
    level: 'drinks',
    group: 'soft',
    icon: '🥤',
    title: { AM: 'Զովացուցիչ ըմպելիքներ', EN: 'Soft Drinks', RU: 'Безалкогольные напитки' },
    items: [
      {
        id: 'coca-cola',
        image: img('cola,soda'),
        price: 900,
        name: { AM: 'Coca-Cola 0.5լ', EN: 'Coca-Cola 0.5L', RU: 'Coca-Cola 0.5л' },
        description: {
          AM: 'Սառը Coca-Cola 0.5լ',
          EN: 'Chilled Coca-Cola 0.5L',
          RU: 'Холодная Coca-Cola 0.5л',
        },
      },
      {
        id: 'fanta',
        image: img('fanta,orange,soda'),
        price: 900,
        name: { AM: 'Fanta 0.5լ', EN: 'Fanta 0.5L', RU: 'Fanta 0.5л' },
        description: {
          AM: 'Նարնջի համով Fanta',
          EN: 'Orange-flavoured Fanta',
          RU: 'Апельсиновая Fanta',
        },
      },
      {
        id: 'sprite',
        image: img('sprite,soda,lemon'),
        price: 900,
        name: { AM: 'Sprite 0.5լ', EN: 'Sprite 0.5L', RU: 'Sprite 0.5л' },
        description: {
          AM: 'Թարմեցնող Sprite',
          EN: 'Refreshing Sprite',
          RU: 'Освежающий Sprite',
        },
      },
      {
        id: 'mineral-water',
        image: img('mineral,water,bottle'),
        price: 700,
        name: { AM: 'Հանքային ջուր', EN: 'Mineral Water', RU: 'Минеральная вода' },
        description: {
          AM: 'Բնական հանքային ջուր',
          EN: 'Natural mineral water',
          RU: 'Натуральная минеральная вода',
        },
      },
      {
        id: 'sparkling-water',
        image: img('sparkling,water,glass'),
        price: 700,
        name: { AM: 'Գազավորված ջուր', EN: 'Sparkling Water', RU: 'Газированная вода' },
        description: {
          AM: 'Գազավորված ջուր',
          EN: 'Sparkling water',
          RU: 'Газированная вода',
        },
      },
    ],
  },
  {
    id: 'homemade-drinks',
    level: 'drinks',
    group: 'soft',
    icon: '🍋',
    title: { AM: 'Տնական ըմպելիքներ', EN: 'Homemade Drinks', RU: 'Домашние напитки' },
    items: [
      {
        id: 'tnakan-limonad',
        image: img('lemonade'),
        price: 1400,
        name: { AM: 'Տնական լիմոնադ', EN: 'Homemade Lemonade', RU: 'Домашний лимонад' },
        description: {
          AM: 'Թարմ պատրաստված տնական լիմոնադ',
          EN: 'Freshly made homemade lemonade',
          RU: 'Свежий домашний лимонад',
        },
        badge: 'best',
      },
      {
        id: 'tan',
        image: img('yogurt,drink'),
        price: 900,
        name: { AM: 'Թան', EN: 'Tan', RU: 'Тан' },
        description: {
          AM: 'Ավանդական հայկական թան',
          EN: 'Traditional Armenian tan',
          RU: 'Традиционный армянский тан',
        },
      },
      {
        id: 'tan-grafin',
        image: img('ayran,carafe,drink'),
        price: 2500,
        name: { AM: 'Թան գրաֆին', EN: 'Tan Carafe', RU: 'Тан графин' },
        description: {
          AM: 'Թան գրաֆինով (1լ)',
          EN: 'Tan in a carafe (1L)',
          RU: 'Тан в графине (1л)',
        },
      },
      {
        id: 'kompot',
        image: img('compote,fruit,drink'),
        price: 1200,
        name: { AM: 'Կոմպոտ', EN: 'Compote', RU: 'Компот' },
        description: {
          AM: 'Չորամրգի կոմպոտ',
          EN: 'Dried-fruit compote',
          RU: 'Компот из сухофруктов',
        },
      },
      {
        id: 'mors',
        image: img('berry,drink,juice'),
        price: 1500,
        name: { AM: 'Մորս', EN: 'Mors', RU: 'Морс' },
        description: {
          AM: 'Հատապտուղների մորս',
          EN: 'Berry mors',
          RU: 'Ягодный морс',
        },
      },
    ],
  },
  {
    id: 'coffee',
    level: 'drinks',
    group: 'soft',
    icon: '☕',
    title: { AM: 'Սուրճ', EN: 'Coffee', RU: 'Кофе' },
    items: [
      {
        id: 'haykakan-surch',
        image: img('turkish,coffee'),
        price: 900,
        name: { AM: 'Հայկական սուրճ', EN: 'Armenian Coffee', RU: 'Армянский кофе' },
        description: {
          AM: 'Ավանդական հայկական սուրճ',
          EN: 'Traditional Armenian coffee',
          RU: 'Традиционный армянский кофе',
        },
        badge: 'hit',
      },
      {
        id: 'espresso',
        image: img('espresso,coffee'),
        price: 1100,
        name: { AM: 'Էսպրեսսո', EN: 'Espresso', RU: 'Эспрессо' },
        description: {
          AM: 'Խտացված էսպրեսսո',
          EN: 'Concentrated espresso',
          RU: 'Насыщенный эспрессо',
        },
      },
      {
        id: 'americano',
        image: img('americano,coffee'),
        price: 1300,
        name: { AM: 'Ամերիկանո', EN: 'Americano', RU: 'Американо' },
        description: { AM: 'Ամերիկանո', EN: 'Americano', RU: 'Американо' },
      },
      {
        id: 'cappuccino',
        image: img('cappuccino'),
        price: 1600,
        name: { AM: 'Կապուչինո', EN: 'Cappuccino', RU: 'Капучино' },
        description: {
          AM: 'Կաթնափրփուրով կապուչինո',
          EN: 'Cappuccino with milk foam',
          RU: 'Капучино с молочной пеной',
        },
      },
      {
        id: 'latte',
        image: img('latte,coffee'),
        price: 1800,
        name: { AM: 'Լատտե', EN: 'Latte', RU: 'Латте' },
        description: { AM: 'Մեղմ լատտե', EN: 'Smooth latte', RU: 'Мягкий латте' },
      },
      {
        id: 'glase',
        image: img('iced,coffee'),
        price: 1900,
        name: { AM: 'Գլասե', EN: 'Iced Coffee (Glacé)', RU: 'Гляссе' },
        description: {
          AM: 'Սառը գլասե պաղպաղակով',
          EN: 'Iced coffee with ice cream',
          RU: 'Холодный кофе с мороженым',
        },
      },
    ],
  },
  {
    id: 'tea',
    level: 'drinks',
    group: 'soft',
    icon: '🍵',
    title: { AM: 'Թեյ', EN: 'Tea', RU: 'Чай' },
    items: [
      {
        id: 'sev-tey',
        image: img('black,tea'),
        price: 900,
        name: { AM: 'Սև թեյ', EN: 'Black Tea', RU: 'Чёрный чай' },
        description: { AM: 'Անուշաբույր սև թեյ', EN: 'Aromatic black tea', RU: 'Ароматный чёрный чай' },
      },
      {
        id: 'kanach-tey',
        image: img('green,tea'),
        price: 900,
        name: { AM: 'Կանաչ թեյ', EN: 'Green Tea', RU: 'Зелёный чай' },
        description: { AM: 'Կանաչ թեյ', EN: 'Green tea', RU: 'Зелёный чай' },
      },
      {
        id: 'mrgayin-tey',
        image: img('fruit,tea'),
        price: 1400,
        name: { AM: 'Մրգային թեյ', EN: 'Fruit Tea', RU: 'Фруктовый чай' },
        description: { AM: 'Մրգային թեյ', EN: 'Fruit tea', RU: 'Фруктовый чай' },
      },
      {
        id: 'chichkhani-tey',
        image: img('seabuckthorn,tea'),
        price: 1600,
        name: { AM: 'Չիչխանի թեյ', EN: 'Sea Buckthorn Tea', RU: 'Облепиховый чай' },
        description: {
          AM: 'Չիչխանի վիտամինային թեյ',
          EN: 'Vitamin-rich sea buckthorn tea',
          RU: 'Витаминный облепиховый чай',
        },
        badge: 'new',
      },
      {
        id: 'busakan-tey',
        image: img('herbal,tea'),
        price: 1200,
        name: { AM: 'Բուսական թեյ', EN: 'Herbal Tea', RU: 'Травяной чай' },
        description: {
          AM: 'Լեռնային խոտաբույսերի թեյ',
          EN: 'Mountain herbal tea',
          RU: 'Горный травяной чай',
        },
      },
    ],
  },
  {
    id: 'fresh-juices',
    level: 'drinks',
    group: 'soft',
    icon: '🧃',
    title: { AM: 'Թարմ քամած հյութեր', EN: 'Fresh Juices', RU: 'Свежевыжатые соки' },
    items: [
      {
        id: 'narnji-fresh',
        image: img('orange,juice'),
        price: 1600,
        name: { AM: 'Նարնջի ֆրեշ', EN: 'Orange Juice', RU: 'Апельсиновый фреш' },
        description: {
          AM: 'Թարմ քամած նարնջի հյութ',
          EN: 'Freshly squeezed orange juice',
          RU: 'Свежевыжатый апельсиновый сок',
        },
      },
      {
        id: 'khndzori-fresh',
        image: img('apple,juice'),
        price: 1500,
        name: { AM: 'Խնձորի ֆրեշ', EN: 'Apple Juice', RU: 'Яблочный фреш' },
        description: { AM: 'Թարմ խնձորի հյութ', EN: 'Fresh apple juice', RU: 'Свежий яблочный сок' },
      },
      {
        id: 'gazari-fresh',
        image: img('carrot,juice'),
        price: 1500,
        name: { AM: 'Գազարի ֆրեշ', EN: 'Carrot Juice', RU: 'Морковный фреш' },
        description: { AM: 'Թարմ գազարի հյութ', EN: 'Fresh carrot juice', RU: 'Свежий морковный сок' },
      },
      {
        id: 'nrran-fresh',
        image: img('pomegranate,juice'),
        price: 2200,
        name: { AM: 'Նռան ֆրեշ', EN: 'Pomegranate Juice', RU: 'Гранатовый фреш' },
        description: {
          AM: 'Հայկական նռան թարմ հյութ',
          EN: 'Fresh Armenian pomegranate juice',
          RU: 'Свежий армянский гранатовый сок',
        },
        badge: 'best',
      },
      {
        id: 'khary-fresh',
        image: img('mixed,fruit,juice'),
        price: 1900,
        name: { AM: 'Խառը ֆրեշ', EN: 'Mixed Juice', RU: 'Микс фреш' },
        description: { AM: 'Մրգային խառը ֆրեշ', EN: 'Mixed fruit juice', RU: 'Микс фруктовый фреш' },
      },
    ],
  },
  {
    id: 'non-alcoholic-cocktails',
    level: 'drinks',
    group: 'soft',
    icon: '🍹',
    title: { AM: 'Անալկոհոլ կոկտեյլներ', EN: 'Non-Alcoholic Cocktails', RU: 'Безалкогольные коктейли' },
    items: [
      {
        id: 'virgin-mojito',
        image: img('mojito,mocktail'),
        price: 1900,
        name: { AM: 'Virgin Mojito', EN: 'Virgin Mojito', RU: 'Virgin Mojito' },
        description: {
          AM: 'Անալկոհոլ մոխիտո՝ լայմ և անանուխ',
          EN: 'Non-alcoholic mojito with lime and mint',
          RU: 'Безалкогольный мохито с лаймом и мятой',
        },
        badge: 'hit',
      },
      {
        id: 'tropical-mix',
        image: img('tropical,cocktail'),
        price: 2200,
        name: { AM: 'Tropical Mix', EN: 'Tropical Mix', RU: 'Tropical Mix' },
        description: {
          AM: 'Արևադարձային մրգերի միքս',
          EN: 'Tropical fruit mix',
          RU: 'Микс тропических фруктов',
        },
      },
      {
        id: 'berry-fresh',
        image: img('berry,cocktail'),
        price: 2200,
        name: { AM: 'Berry Fresh', EN: 'Berry Fresh', RU: 'Berry Fresh' },
        description: {
          AM: 'Հատապտուղային թարմ կոկտեյլ',
          EN: 'Fresh berry cocktail',
          RU: 'Свежий ягодный коктейль',
        },
      },
      {
        id: 'citrus-energy',
        image: img('citrus,cocktail'),
        price: 2100,
        name: { AM: 'Citrus Energy', EN: 'Citrus Energy', RU: 'Citrus Energy' },
        description: {
          AM: 'Ցիտրուսային էներգետիկ կոկտեյլ',
          EN: 'Citrus energy cocktail',
          RU: 'Цитрусовый энергетический коктейль',
        },
      },
    ],
  },

  // ════════════════════════════ ALCOHOL ════════════════════════════
  {
    id: 'beer',
    level: 'drinks',
    group: 'alcohol',
    icon: '🍺',
    title: { AM: 'Գարեջուր', EN: 'Beer', RU: 'Пиво' },
    items: [
      {
        id: 'kilikia-draft',
        image: img('draft,beer'),
        price: 1200,
        name: { AM: 'Կիլիկիա սափորի 0.5լ', EN: 'Kilikia Draft 0.5L', RU: 'Киликия разливное 0.5л' },
        description: {
          AM: 'Հայկական Կիլիկիա սափորի գարեջուր',
          EN: 'Armenian Kilikia draft beer',
          RU: 'Армянское разливное пиво Киликия',
        },
        badge: 'best',
      },
      {
        id: 'dargett-draft',
        image: img('craft,beer'),
        price: 1800,
        name: { AM: 'Dargett սափորի 0.5լ', EN: 'Dargett Draft 0.5L', RU: 'Dargett разливное 0.5л' },
        description: {
          AM: 'Dargett craft սափորի գարեջուր',
          EN: 'Dargett craft draft beer',
          RU: 'Крафтовое разливное пиво Dargett',
        },
      },
      {
        id: 'heineken',
        image: img('beer,bottle'),
        price: 1900,
        name: { AM: 'Heineken', EN: 'Heineken', RU: 'Heineken' },
        description: { AM: 'Heineken գարեջուր', EN: 'Heineken beer', RU: 'Пиво Heineken' },
      },
      {
        id: 'corona',
        image: img('corona,beer,lime'),
        price: 2400,
        name: { AM: 'Corona', EN: 'Corona', RU: 'Corona' },
        description: {
          AM: 'Corona Extra լայմով',
          EN: 'Corona Extra with lime',
          RU: 'Corona Extra с лаймом',
        },
      },
    ],
  },
  {
    id: 'wine',
    level: 'drinks',
    group: 'alcohol',
    icon: '🍷',
    title: { AM: 'Գինի', EN: 'Wine', RU: 'Вино' },
    items: [
      {
        id: 'red-wine-glass',
        image: img('red,wine,glass'),
        price: 1800,
        name: {
          AM: 'Հայկական կարմիր գինի (բաժակ)',
          EN: 'Armenian Red Wine (glass)',
          RU: 'Армянское красное вино (бокал)',
        },
        description: { AM: 'Բաժակ կարմիր գինի', EN: 'Glass of red wine', RU: 'Бокал красного вина' },
      },
      {
        id: 'white-wine-glass',
        image: img('white,wine,glass'),
        price: 1800,
        name: {
          AM: 'Հայկական սպիտակ գինի (բաժակ)',
          EN: 'Armenian White Wine (glass)',
          RU: 'Армянское белое вино (бокал)',
        },
        description: { AM: 'Բաժակ սպիտակ գինի', EN: 'Glass of white wine', RU: 'Бокал белого вина' },
      },
      {
        id: 'karas-red-bottle',
        image: img('red,wine,bottle'),
        price: 9500,
        name: { AM: 'Karas կարմիր (շիշ)', EN: 'Karas Red (bottle)', RU: 'Karas красное (бутылка)' },
        description: {
          AM: 'Շիշ Karas կարմիր գինի',
          EN: 'Bottle of Karas red wine',
          RU: 'Бутылка Karas красное',
        },
        badge: 'best',
      },
      {
        id: 'karas-white-bottle',
        image: img('white,wine,bottle'),
        price: 9500,
        name: { AM: 'Karas սպիտակ (շիշ)', EN: 'Karas White (bottle)', RU: 'Karas белое (бутылка)' },
        description: {
          AM: 'Շիշ Karas սպիտակ գինի',
          EN: 'Bottle of Karas white wine',
          RU: 'Бутылка Karas белое',
        },
      },
    ],
  },
  {
    id: 'cognac',
    level: 'drinks',
    group: 'alcohol',
    icon: '🥃',
    title: { AM: 'Կոնյակ', EN: 'Cognac', RU: 'Коньяк' },
    items: [
      {
        id: 'ararat-3',
        image: img('cognac,brandy,glass'),
        price: 2200,
        name: { AM: 'ԱՐԱՐԱՏ 3 տարի', EN: 'Ararat 3 Years', RU: 'Арарат 3 года' },
        description: { AM: '50մլ', EN: '50ml', RU: '50мл' },
      },
      {
        id: 'ararat-5',
        image: img('brandy,glass'),
        price: 2900,
        name: { AM: 'ԱՐԱՐԱՏ 5 տարի', EN: 'Ararat 5 Years', RU: 'Арарат 5 лет' },
        description: { AM: '50մլ', EN: '50ml', RU: '50мл' },
      },
      {
        id: 'ararat-akhtamar',
        image: img('cognac,premium,glass'),
        price: 4200,
        name: { AM: 'ԱՐԱՐԱՏ Ախթամար', EN: 'Ararat Akhtamar', RU: 'Арарат Ахтамар' },
        description: { AM: '50մլ', EN: '50ml', RU: '50мл' },
        badge: 'best',
      },
    ],
  },
  {
    id: 'whiskey',
    level: 'drinks',
    group: 'alcohol',
    icon: '🥃',
    title: { AM: 'Վիսկի', EN: 'Whiskey', RU: 'Виски' },
    items: [
      {
        id: 'jameson',
        image: img('whiskey,glass'),
        price: 3200,
        name: { AM: 'Jameson', EN: 'Jameson', RU: 'Jameson' },
        description: {
          AM: 'Իռլանդական վիսկի (50մլ)',
          EN: 'Irish whiskey (50ml)',
          RU: 'Ирландский виски (50мл)',
        },
      },
      {
        id: 'jack-daniels',
        image: img('whiskey,bourbon'),
        price: 3800,
        name: { AM: "Jack Daniel's", EN: "Jack Daniel's", RU: "Jack Daniel's" },
        description: {
          AM: 'Tennessee վիսկի (50մլ)',
          EN: 'Tennessee whiskey (50ml)',
          RU: 'Виски Теннесси (50мл)',
        },
      },
      {
        id: 'chivas-12',
        image: img('scotch,whiskey'),
        price: 4200,
        name: { AM: 'Chivas Regal 12', EN: 'Chivas Regal 12', RU: 'Chivas Regal 12' },
        description: {
          AM: 'Շոտլանդական 12 տարի (50մլ)',
          EN: 'Scotch 12 years (50ml)',
          RU: 'Шотландский 12 лет (50мл)',
        },
      },
    ],
  },
  {
    id: 'vodka',
    level: 'drinks',
    group: 'alcohol',
    icon: '🍸',
    title: { AM: 'Օղի', EN: 'Vodka', RU: 'Водка' },
    items: [
      {
        id: 'artsakh-vodka',
        image: img('vodka,glass'),
        price: 2200,
        name: { AM: 'Արցախ', EN: 'Artsakh Vodka', RU: 'Водка Арцах' },
        description: {
          AM: 'Արցախ թթի օղի (50մլ)',
          EN: 'Artsakh mulberry vodka (50ml)',
          RU: 'Тутовая водка Арцах (50мл)',
        },
      },
      {
        id: 'finlandia',
        image: img('vodka,bottle'),
        price: 2500,
        name: { AM: 'Finlandia', EN: 'Finlandia', RU: 'Finlandia' },
        description: {
          AM: 'Ֆինլանդական օղի (50մլ)',
          EN: 'Finnish vodka (50ml)',
          RU: 'Финская водка (50мл)',
        },
      },
      {
        id: 'absolut',
        image: img('vodka,premium'),
        price: 2900,
        name: { AM: 'Absolut', EN: 'Absolut', RU: 'Absolut' },
        description: {
          AM: 'Շվեդական օղի (50մլ)',
          EN: 'Swedish vodka (50ml)',
          RU: 'Шведская водка (50мл)',
        },
      },
    ],
  },
  {
    id: 'gin',
    level: 'drinks',
    group: 'alcohol',
    icon: '🍸',
    title: { AM: 'Ջին', EN: 'Gin', RU: 'Джин' },
    items: [
      {
        id: 'gordons',
        image: img('gin,glass'),
        price: 2600,
        name: { AM: "Gordon's", EN: "Gordon's", RU: "Gordon's" },
        description: { AM: "Gordon's ջին (50մլ)", EN: "Gordon's gin (50ml)", RU: 'Джин Gordon’s (50мл)' },
      },
      {
        id: 'beefeater',
        image: img('gin,tonic'),
        price: 3200,
        name: { AM: 'Beefeater', EN: 'Beefeater', RU: 'Beefeater' },
        description: {
          AM: 'Beefeater London Dry (50մլ)',
          EN: 'Beefeater London Dry (50ml)',
          RU: 'Beefeater London Dry (50мл)',
        },
      },
    ],
  },
  {
    id: 'tequila',
    level: 'drinks',
    group: 'alcohol',
    icon: '🥃',
    title: { AM: 'Տեկիլա', EN: 'Tequila', RU: 'Текила' },
    items: [
      {
        id: 'olmeca-silver',
        image: img('tequila,shot,lime'),
        price: 3200,
        name: { AM: 'Olmeca Silver', EN: 'Olmeca Silver', RU: 'Olmeca Silver' },
        description: {
          AM: 'Olmeca Silver տեկիլա (50մլ)',
          EN: 'Olmeca Silver tequila (50ml)',
          RU: 'Текила Olmeca Silver (50мл)',
        },
      },
      {
        id: 'olmeca-gold',
        image: img('tequila,gold'),
        price: 3500,
        name: { AM: 'Olmeca Gold', EN: 'Olmeca Gold', RU: 'Olmeca Gold' },
        description: {
          AM: 'Olmeca Gold տեկիլա (50մլ)',
          EN: 'Olmeca Gold tequila (50ml)',
          RU: 'Текила Olmeca Gold (50мл)',
        },
      },
    ],
  },
  {
    id: 'liqueurs',
    level: 'drinks',
    group: 'alcohol',
    icon: '🍶',
    title: { AM: 'Լիկյորներ', EN: 'Liqueurs', RU: 'Ликёры' },
    items: [
      {
        id: 'baileys',
        image: img('baileys,cream,liqueur'),
        price: 2800,
        name: { AM: 'Baileys', EN: 'Baileys', RU: 'Baileys' },
        description: {
          AM: 'Կրեմային լիկյոր (50մլ)',
          EN: 'Cream liqueur (50ml)',
          RU: 'Сливочный ликёр (50мл)',
        },
      },
      {
        id: 'jagermeister',
        image: img('herbal,liqueur,shot'),
        price: 2600,
        name: { AM: 'Jägermeister', EN: 'Jägermeister', RU: 'Jägermeister' },
        description: {
          AM: 'Խոտաբույսային լիկյոր (50մլ)',
          EN: 'Herbal liqueur (50ml)',
          RU: 'Травяной ликёр (50мл)',
        },
      },
      {
        id: 'cointreau',
        image: img('orange,liqueur'),
        price: 3000,
        name: { AM: 'Cointreau', EN: 'Cointreau', RU: 'Cointreau' },
        description: {
          AM: 'Նարնջի լիկյոր (50մլ)',
          EN: 'Orange liqueur (50ml)',
          RU: 'Апельсиновый ликёр (50мл)',
        },
      },
      {
        id: 'limoncello',
        image: img('limoncello,lemon,liqueur'),
        price: 2400,
        name: { AM: 'Limoncello', EN: 'Limoncello', RU: 'Limoncello' },
        description: {
          AM: 'Իտալական կիտրոնի լիկյոր (50մլ)',
          EN: 'Italian lemon liqueur (50ml)',
          RU: 'Итальянский лимонный ликёр (50мл)',
        },
      },
    ],
  },
  {
    id: 'alcoholic-cocktails',
    level: 'drinks',
    group: 'alcohol',
    icon: '🍹',
    title: { AM: 'Ալկոհոլային կոկտեյլներ', EN: 'Alcoholic Cocktails', RU: 'Алкогольные коктейли' },
    items: [
      {
        id: 'mojito',
        image: img('mojito,cocktail'),
        price: 2900,
        name: { AM: 'Mojito', EN: 'Mojito', RU: 'Мохито' },
        description: {
          AM: 'Ռոմ, լայմ, անանուխ',
          EN: 'Rum, lime, mint',
          RU: 'Ром, лайм, мята',
        },
        badge: 'hit',
      },
      {
        id: 'aperol-spritz',
        image: img('aperol,spritz,cocktail'),
        price: 3900,
        name: { AM: 'Aperol Spritz', EN: 'Aperol Spritz', RU: 'Aperol Spritz' },
        description: {
          AM: 'Պրոսեկկո, Aperol, գազ',
          EN: 'Prosecco, Aperol, soda',
          RU: 'Просекко, Aperol, сода',
        },
        badge: 'best',
      },
      {
        id: 'negroni',
        image: img('negroni,cocktail'),
        price: 3500,
        name: { AM: 'Negroni', EN: 'Negroni', RU: 'Negroni' },
        description: {
          AM: 'Ջին, վերմուտ, Campari',
          EN: 'Gin, vermouth, Campari',
          RU: 'Джин, вермут, Campari',
        },
      },
      {
        id: 'long-island',
        image: img('longisland,cocktail'),
        price: 4500,
        name: { AM: 'Long Island', EN: 'Long Island', RU: 'Long Island' },
        description: {
          AM: 'Long Island Iced Tea',
          EN: 'Long Island Iced Tea',
          RU: 'Long Island Iced Tea',
        },
      },
      {
        id: 'margarita',
        image: img('margarita,cocktail'),
        price: 3500,
        name: { AM: 'Margarita', EN: 'Margarita', RU: 'Маргарита' },
        description: {
          AM: 'Տեկիլա, լայմ, աղ',
          EN: 'Tequila, lime, salt',
          RU: 'Текила, лайм, соль',
        },
      },
    ],
  },
]
