// Admin-panel UI translations (separate from the public menu language).
// The admin can view the panel in Armenian / Russian / English.
export type AdminLang = 'hy' | 'ru' | 'en'

type Dict = Record<string, Record<AdminLang, string>>

const T: Dict = {
  // AI (Professional/Business)
  aiTranslate: { hy: 'Թարգմանել', ru: 'Перевести', en: 'Translate' },
  aiDescribe: { hy: 'AI նկարագրություն', ru: 'AI-описание', en: 'AI description' },
  aiWorking: { hy: 'Կատարվում է…', ru: 'Обработка…', en: 'Working…' },
  aiDone: { hy: 'Պատրաստ է ✓', ru: 'Готово ✓', en: 'Done ✓' },
  aiFailed: { hy: 'AI-ը ձախողվեց', ru: 'Ошибка AI', en: 'AI failed' },
  aiNeedText: { hy: 'Նախ լրացրու գոնե մեկ լեզվով', ru: 'Сначала заполните хотя бы один язык', en: 'Fill at least one language first' },
  aiNeedName: { hy: 'Նախ լրացրու անվանումը', ru: 'Сначала заполните название', en: 'Fill the name first' },
  plan: { hy: 'Փաթեթ', ru: 'Тариф', en: 'Plan' },
  iconImage: { hy: 'Փոքր նկար', ru: 'Иконка', en: 'Icon image' },
  bannerImage: { hy: 'Մեծ նկար', ru: 'Баннер', en: 'Banner image' },
  sectionImage: { hy: 'Բաժնի նկար', ru: 'Изображение раздела', en: 'Section image' },
  upload: { hy: 'Վերբեռնել', ru: 'Загрузить', en: 'Upload' },
  remove: { hy: 'Հեռացնել', ru: 'Удалить', en: 'Remove' },
  bannerDesktop: { hy: 'Դեսքթոփ նկար', ru: 'Десктоп', en: 'Desktop' },
  bannerMobile: { hy: 'Մոբայլ նկար', ru: 'Мобильный', en: 'Mobile' },
  qrColor: { hy: 'Գույն', ru: 'Цвет', en: 'Color' },
  qrBackground: { hy: 'Ֆոն', ru: 'Фон', en: 'Background' },
  qrStyle: { hy: 'Ոճ', ru: 'Стиль', en: 'Style' },
  qrCorners: { hy: 'Անկյուններ', ru: 'Углы', en: 'Corners' },
  qrLogo: { hy: 'Ցուցադրել լոգոն կենտրոնում', ru: 'Показать лого в центре', en: 'Show logo in center' },
  qrSquare: { hy: 'Քառակուսի', ru: 'Квадрат', en: 'Square' },
  qrRounded: { hy: 'Կլորացված', ru: 'Скруглённый', en: 'Rounded' },
  qrDots: { hy: 'Կետեր', ru: 'Точки', en: 'Dots' },
  qrClassy: { hy: 'Էլեգանտ', ru: 'Элегантный', en: 'Classy' },
  qrExtraRounded: { hy: 'Շատ կլոր', ru: 'Очень круглый', en: 'Extra rounded' },
  qrHint: { hy: 'Հղումը մնում է նույնը՝ փոխվում է միայն դիզայնը։ Բարձր հակադրություն պահպանիր՝ սկանավորումը չկտրվի։', ru: 'Ссылка остаётся прежней — меняется только дизайн. Сохраняйте высокий контраст, чтобы код сканировался.', en: 'The link stays the same — only the design changes. Keep high contrast so the code stays scannable.' },
  downloadPng: { hy: 'Ներբեռնել PNG', ru: 'Скачать PNG', en: 'Download PNG' },
  downloadSvg: { hy: 'Ներբեռնել SVG', ru: 'Скачать SVG', en: 'Download SVG' },

  // nav
  dashboard: { hy: 'Վահանակ', ru: 'Панель', en: 'Dashboard' },
  restaurantInfo: { hy: 'Հաստատության մասին', ru: 'О заведении', en: 'About' },
  menuBuilder: { hy: 'Մենյուի կառուցում', ru: 'Конструктор меню', en: 'Menu Builder' },
  products: { hy: 'Ապրանքներ', ru: 'Товары', en: 'Products' },
  design: { hy: 'Դիզայն', ru: 'Дизайн', en: 'Design' },
  customization: { hy: 'Կարգավորում', ru: 'Кастомизация', en: 'Customization' },
  languages: { hy: 'Լեզուներ', ru: 'Языки', en: 'Languages' },
  qrCode: { hy: 'QR կոդ', ru: 'QR-код', en: 'QR Code' },
  settings: { hy: 'Կարգավորումներ', ru: 'Настройки', en: 'Settings' },

  // header
  adminSubtitle: { hy: 'QR Մենյու · ադմին', ru: 'QR Меню · админ', en: 'QR Menu Admin' },
  viewMenu: { hy: 'Տեսնել մենյուն', ru: 'Открыть меню', en: 'View menu' },
  logout: { hy: 'Ելք', ru: 'Выход', en: 'Log out' },

  // dashboard
  totalProducts: { hy: 'Ընդհանուր ապրանքներ', ru: 'Всего товаров', en: 'Total products' },
  categoriesCount: { hy: 'Կատեգորիաներ', ru: 'Категории', en: 'Categories' },
  available: { hy: 'Հասանելի', ru: 'Доступно', en: 'Available' },
  activeTheme: { hy: 'Ակտիվ թեմա', ru: 'Активная тема', en: 'Active theme' },
  qrMenuLink: { hy: 'QR մենյուի հղում', ru: 'Ссылка QR-меню', en: 'QR menu link' },
  copy: { hy: 'Պատճենել', ru: 'Копировать', en: 'Copy' },
  quickActions: { hy: 'Արագ գործողություններ', ru: 'Быстрые действия', en: 'Quick actions' },
  changeTheme: { hy: 'Փոխել թեման', ru: 'Сменить тему', en: 'Change theme' },

  // common
  addSection: { hy: '+ Բաժին', ru: '+ Раздел', en: '+ Section' },
  addCategory: { hy: '+ Կատեգորիա', ru: '+ Категория', en: '+ Category' },
  addProduct: { hy: '+ Ապրանք', ru: '+ Товар', en: '+ Product' },
  // Plan-limit upgrade dialog
  limitTitle: { hy: 'Հասել եք փաթեթի սահմանին', ru: 'Достигнут лимит тарифа', en: 'Plan limit reached' },
  limitLead: { hy: 'Starter փաթեթով հասանելի է առավելագույնը', ru: 'На тарифе Starter доступно максимум', en: 'The Starter plan allows up to' },
  limitProductsWord: { hy: 'ապրանք', ru: 'товаров', en: 'products' },
  limitCategoriesWord: { hy: 'կատեգորիա', ru: 'категорий', en: 'categories' },
  limitUpsell: { hy: 'Ավելին ավելացնելու համար անցեք Professional փաթեթին։', ru: 'Чтобы добавить больше, перейдите на тариф Professional.', en: 'Upgrade to Professional to add more.' },
  limitUpgradeCta: { hy: 'Անցնել Professional-ի', ru: 'Перейти на Professional', en: 'Upgrade to Professional' },
  limitUsage: { hy: 'Օգտագործված', ru: 'Использовано', en: 'Used' },
  designLockedHint: { hy: 'Starter փաթեթում դիզայնը կողպված է՝ հասանելի է միայն ձեզ նշանակված թեման։ Բոլոր դիզայնները բացելու համար անցեք Professional փաթեթին։', ru: 'На тарифе Starter дизайн заблокирован — доступна только назначенная вам тема. Для всех дизайнов перейдите на Professional.', en: 'On Starter the design is locked to your assigned theme. Upgrade to Professional to unlock all designs.' },
  qrLockedTitle: { hy: 'QR դիզայնը հասանելի է Professional-ում', ru: 'Дизайн QR доступен в Professional', en: 'QR design is available on Professional' },
  qrLockedHint: { hy: 'Starter փաթեթում QR կոդը սև-սպիտակ է։ Գունավոր դիզայնի, ոճերի և լոգոյի համար անցեք Professional փաթեթին։', ru: 'На тарифе Starter QR-код чёрно-белый. Для цветного дизайна, стилей и логотипа перейдите на Professional.', en: 'On Starter the QR code is black & white. Upgrade to Professional for color, styles and a logo.' },
  // Plan-upgrade request form
  upgradeReqTitle: { hy: 'Փաթեթի փոփոխման հայտ', ru: 'Заявка на смену тарифа', en: 'Plan upgrade request' },
  upgradeReqHint: { hy: 'Լրացրեք տվյալները՝ մենք կկապվենք ձեզ հետ փաթեթը փոխելու համար։', ru: 'Заполните данные — мы свяжемся с вами для смены тарифа.', en: 'Fill in your details and we will contact you to change the plan.' },
  orgName: { hy: 'Կազմակերպության անվանում', ru: 'Название организации', en: 'Organization name' },
  phone: { hy: 'Հեռախոսահամար', ru: 'Номер телефона', en: 'Phone number' },
  planChange: { hy: 'Փաթեթի փոփոխություն', ru: 'Смена тарифа', en: 'Plan change' },
  sendRequest: { hy: 'Ուղարկել հայտ', ru: 'Отправить заявку', en: 'Send request' },
  phoneRequired: { hy: 'Հեռախոսահամարը պարտադիր է', ru: 'Телефон обязателен', en: 'Phone is required' },
  upgradeSent: { hy: 'Հայտն ուղարկված է ✅', ru: 'Заявка отправлена ✅', en: 'Request sent ✅' },
  upgradeFailed: { hy: 'Չհաջողվեց ուղարկել հայտը', ru: 'Не удалось отправить заявку', en: 'Could not send the request' },
  save: { hy: 'Պահպանել', ru: 'Сохранить', en: 'Save' },
  saving: { hy: 'Պահպանում…', ru: 'Сохранение…', en: 'Saving…' },
  cancel: { hy: 'Չեղարկել', ru: 'Отмена', en: 'Cancel' },
  delete: { hy: 'Ջնջել', ru: 'Удалить', en: 'Delete' },
  deleting: { hy: 'Ջնջում…', ru: 'Удаление…', en: 'Deleting…' },
  edit: { hy: 'Խմբագրել', ru: 'Изменить', en: 'Edit' },
  active: { hy: 'Ակտիվ', ru: 'Активно', en: 'Active' },
  search: { hy: 'Որոնել…', ru: 'Поиск…', en: 'Search…' },
  all: { hy: 'Բոլորը', ru: 'Все', en: 'All' },
  optional: { hy: 'ըստ ցանկության', ru: 'необязательно', en: 'optional' },

  // menu builder / lists
  noSections: { hy: 'Բաժին չկա — ավելացրու «+ Բաժին»', ru: 'Нет разделов — добавьте «+ Раздел»', en: 'No sections — add “+ Section”' },
  noCategories: { hy: 'Կատեգորիա չկա', ru: 'Нет категорий', en: 'No categories' },
  noProducts: { hy: 'Ապրանք չկա', ru: 'Нет товаров', en: 'No products' },
  itemsWord: { hy: 'ապրանք', ru: 'товаров', en: 'items' },

  // products table
  colProduct: { hy: 'Ապրանք', ru: 'Товар', en: 'Product' },
  colCategory: { hy: 'Կատեգորիա', ru: 'Категория', en: 'Category' },
  colPrice: { hy: 'Գին', ru: 'Цена', en: 'Price' },
  colStatus: { hy: 'Կարգավիճակ', ru: 'Статус', en: 'Status' },
  inStock: { hy: 'Առկա է', ru: 'В наличии', en: 'Available' },
  outOfStock: { hy: 'Առկա չէ', ru: 'Нет в наличии', en: 'Sold out' },

  // fields / modals
  icon: { hy: 'Իկոն', ru: 'Иконка', en: 'Icon' },
  sectionField: { hy: 'Բաժին', ru: 'Раздел', en: 'Section' },
  nameTranslations: { hy: 'Անվանում · թարգմանություններ', ru: 'Название · переводы', en: 'Name · translations' },
  descTranslations: { hy: 'Նկարագրություն · թարգմանություններ', ru: 'Описание · переводы', en: 'Description · translations' },
  category: { hy: 'Կատեգորիա', ru: 'Категория', en: 'Category' },
  price: { hy: 'Գին', ru: 'Цена', en: 'Price' },
  badges: { hy: 'Պիտակներ', ru: 'Бейджи', en: 'Badges' },
  image: { hy: 'Նկար', ru: 'Изображение', en: 'Image' },
  newSection: { hy: 'Նոր բաժին', ru: 'Новый раздел', en: 'New section' },
  editSection: { hy: 'Խմբագրել բաժինը', ru: 'Изменить раздел', en: 'Edit section' },
  newCategory: { hy: 'Նոր կատեգորիա', ru: 'Новая категория', en: 'New category' },
  editCategory: { hy: 'Խմբագրել կատեգորիան', ru: 'Изменить категорию', en: 'Edit category' },
  newProduct: { hy: 'Նոր ապրանք', ru: 'Новый товар', en: 'New product' },
  editProduct: { hy: 'Խմբագրել ապրանքը', ru: 'Изменить товар', en: 'Edit product' },

  // toasts
  saved: { hy: 'Պահպանված է', ru: 'Сохранено', en: 'Saved' },
  deleted: { hy: 'Ջնջված է', ru: 'Удалено', en: 'Deleted' },
  loadFailed: { hy: 'Չհաջողվեց բեռնել', ru: 'Не удалось загрузить', en: 'Failed to load' },
  createFailed: { hy: 'Չհաջողվեց ստեղծել', ru: 'Не удалось создать', en: 'Failed to create' },

  // super-admin · restaurants
  restaurants: { hy: 'Հաստատություններ', ru: 'Заведения', en: 'Businesses' },
  restaurantsHint: {
    hy: 'Կառավարեք հարթակի բոլոր հաստատությունները և ավելացրեք նորերը',
    ru: 'Управляйте всеми заведениями платформы и добавляйте новые',
    en: 'Manage all businesses on the platform and add new ones',
  },
  addRestaurant: { hy: '+ Ավելացնել հաստատություն', ru: '+ Добавить заведение', en: '+ Add business' },
  creating: { hy: 'Ստեղծվում է…', ru: 'Создание…', en: 'Creating…' },
  name: { hy: 'Անվանում', ru: 'Название', en: 'Name' },
  namePlaceholder: { hy: 'Իմ սրճարանը', ru: 'Моё кафе', en: 'My Cafe' },
  slug: { hy: 'Հասցե (slug)', ru: 'Адрес (slug)', en: 'Slug' },
  theme: { hy: 'Թեմա', ru: 'Тема', en: 'Theme' },
  defaultLang: { hy: 'Հիմնական լեզու', ru: 'Язык по умолчанию', en: 'Default language' },
  ownerEmail: { hy: 'Սեփականատիրոջ էլ. հասցե', ru: 'Email владельца', en: 'Owner email' },
  ownerPassword: { hy: 'Սեփականատիրոջ գաղտնաբառ', ru: 'Пароль владельца', en: 'Owner password' },
  slugInvalid: {
    hy: 'Հասցեն պետք է լինի փոքրատառ, թվեր կամ գծիկ (2–40)',
    ru: 'Адрес: строчные буквы, цифры или дефис (2–40)',
    en: 'Slug must be lowercase letters, numbers or dashes (2–40)',
  },
  nameRequired: { hy: 'Անվանումը պարտադիր է', ru: 'Название обязательно', en: 'Name is required' },
  restaurantCreated: { hy: 'Հաստատությունը հաջողությամբ ստեղծվել է', ru: 'Заведение успешно создано', en: 'Business created successfully' },
  publicUrl: { hy: 'Հանրային հղում', ru: 'Публичная ссылка', en: 'Public URL' },
  ownerLogin: { hy: 'Մուտք', ru: 'Вход', en: 'Login' },
  sectionsCount: { hy: 'Բաժիններ', ru: 'Разделы', en: 'Sections' },
  productsCount: { hy: 'Ապրանքներ', ru: 'Товары', en: 'Products' },
  view: { hy: 'Դիտել', ru: 'Открыть', en: 'View' },
  noRestaurants: { hy: 'Հաստատություններ դեռ չկան', ru: 'Пока нет заведений', en: 'No businesses yet' },
  editRestaurant: { hy: 'Խմբագրել հաստատությունը', ru: 'Редактировать заведение', en: 'Edit business' },
  activeRestaurant: { hy: 'Ակտիվ (հասանելի է հանրության համար)', ru: 'Активен (виден публично)', en: 'Active (publicly visible)' },
  deleteRestaurant: { hy: 'Ջնջե՞լ հաստատությունը', ru: 'Удалить заведение?', en: 'Delete business?' },
  deleteRestaurantConfirm: {
    hy: '«{name}» հաստատությունը և դրա բոլոր բաժինները, կատեգորիաները, մենյուի տարրերը և հարակից տվյալները մշտապես կհեռացվեն։ Այս գործողությունը հնարավոր չէ հետարկել։',
    ru: 'Заведение «{name}» и все его разделы, категории, позиции меню и связанные данные будут удалены навсегда. Это действие нельзя отменить.',
    en: 'The business “{name}” and all of its sections, categories, menu items, and related data will be permanently deleted. This action cannot be undone.',
  },
}

export const ADMIN_LANGS: { code: AdminLang; label: string }[] = [
  { code: 'hy', label: 'ՀԱՅ' },
  { code: 'ru', label: 'РУС' },
  { code: 'en', label: 'ENG' },
]

export const useAdminI18n = () => {
  const lang = useState<AdminLang>('admin-lang', () => 'hy')

  // Restore persisted choice on the client.
  if (import.meta.client) {
    const saved = localStorage.getItem('admin-lang') as AdminLang | null
    if (saved && saved !== lang.value) lang.value = saved
  }

  const setLang = (l: AdminLang) => {
    lang.value = l
    if (import.meta.client) localStorage.setItem('admin-lang', l)
  }

  const t = (key: keyof typeof T): string => T[key]?.[lang.value] ?? String(key)

  return { lang, setLang, t, langs: ADMIN_LANGS }
}
