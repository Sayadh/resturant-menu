import { menu as tunMenu, levels as defaultLevels } from '~/data/menu'
import type { MenuCategory, MenuLevel } from '~/data/menu'

export interface RestaurantMenu {
  levels: MenuLevel[]
  categories: MenuCategory[]
}

const LEVELS: MenuLevel[] = defaultLevels

// Compact helper to declare a product quickly.
const p = (
  id: string,
  am: string,
  en: string,
  ru: string,
  price: number,
  descAm = '',
): MenuCategory['items'][number] => ({
  id,
  image: '',
  price,
  name: { AM: am, EN: en, RU: ru },
  description: { AM: descAm, EN: '', RU: '' },
  available: true,
})

// ── Yasaman (Maison theme) ───────────────────────────────────────────────
const yasaman: RestaurantMenu = {
  levels: LEVELS,
  categories: [
    {
      id: 'ya-mezze',
      level: 'food',
      icon: '🥙',
      title: { AM: 'Մեզե', EN: 'Mezze', RU: 'Мезе' },
      items: [
        p('ya-hummus', 'Հումմուս', 'Hummus', 'Хуммус', 2200, 'Սիսեռի կրեմ թահինիով'),
        p('ya-mutabal', 'Մութաբալ', 'Mutabbal', 'Мутабаль', 2400),
        p('ya-falafel', 'Ֆալաֆել', 'Falafel', 'Фалафель', 2000),
      ],
    },
    {
      id: 'ya-grill',
      level: 'food',
      icon: '🍖',
      title: { AM: 'Գրիլ', EN: 'Grill', RU: 'Гриль' },
      items: [
        p('ya-kebab', 'Քյաբաբ', 'Kebab', 'Кебаб', 3600),
        p('ya-shish', 'Շիշ-Թաուք', 'Shish Tawook', 'Шиш-таук', 3400),
      ],
    },
    {
      id: 'ya-tea',
      level: 'drinks',
      group: 'soft',
      icon: '🍵',
      title: { AM: 'Թեյ', EN: 'Tea', RU: 'Чай' },
      items: [
        p('ya-mint', 'Անանուխի թեյ', 'Mint Tea', 'Мятный чай', 1200),
        p('ya-black', 'Սև թեյ', 'Black Tea', 'Чёрный чай', 900),
      ],
    },
    {
      id: 'ya-wine',
      level: 'drinks',
      group: 'alcohol',
      icon: '🍷',
      title: { AM: 'Գինի', EN: 'Wine', RU: 'Вино' },
      items: [p('ya-red', 'Կարմիր գինի', 'Red Wine', 'Красное вино', 2200)],
    },
  ],
}

// ── Karas (Atelier theme) ────────────────────────────────────────────────
const karas: RestaurantMenu = {
  levels: LEVELS,
  categories: [
    {
      id: 'ka-starters',
      level: 'food',
      icon: '🥗',
      title: { AM: 'Մեկնարկ', EN: 'Starters', RU: 'Закуски' },
      items: [
        p('ka-tartare', 'Տավարի թարթար', 'Beef Tartare', 'Тартар из говядины', 4900),
        p('ka-burrata', 'Բուրատա', 'Burrata', 'Буррата', 4200),
      ],
    },
    {
      id: 'ka-mains',
      level: 'food',
      icon: '🍽',
      title: { AM: 'Հիմնական', EN: 'Mains', RU: 'Основные' },
      items: [
        p('ka-lamb', 'Գառան կողիկ', 'Lamb Rack', 'Каре ягнёнка', 8900),
        p('ka-trout', 'Իշխան', 'Trout', 'Форель', 6200),
      ],
    },
    {
      id: 'ka-coffee',
      level: 'drinks',
      group: 'soft',
      icon: '☕',
      title: { AM: 'Սուրճ', EN: 'Coffee', RU: 'Кофе' },
      items: [p('ka-espresso', 'Էսպրեսսո', 'Espresso', 'Эспрессо', 1100)],
    },
    {
      id: 'ka-cognac',
      level: 'drinks',
      group: 'alcohol',
      icon: '🥃',
      title: { AM: 'Կոնյակ', EN: 'Cognac', RU: 'Коньяк' },
      items: [p('ka-ararat', 'ԱՐԱՐԱՏ 5', 'Ararat 5', 'Арарат 5', 2900)],
    },
  ],
}

// Normalized lookup: restaurantId → its menu (deep-cloned on read by services).
export const menusByRestaurant: Record<string, RestaurantMenu> = {
  'tun-lahmajo': { levels: defaultLevels, categories: tunMenu },
  yasaman,
  karas,
}
