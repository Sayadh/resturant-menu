// ─────────────────────────────────────────────────────────────────────────
// Blog articles — the core of the SEO content strategy. Each article is a
// data entry rendered by pages/blog/[slug].vue with its own <title>,
// description, canonical and Article JSON-LD.
//
// i18n note: the Armenian fields are the DEFAULT (SSR-rendered) content and
// drive <head> meta + JSON-LD, so SEO keyword targeting stays in `hy`. The
// `i18n.ru` / `i18n.en` blocks provide the VISIBLE translation shown when the
// visitor switches language client-side (see useLandingI18n + localizeArticle).
// ─────────────────────────────────────────────────────────────────────────
export interface BlogBlock { h2?: string; p: string }

export interface BlogContent {
  title: string
  description: string
  excerpt: string
  body: BlogBlock[]
}

export interface BlogArticle extends BlogContent {
  slug: string
  date: string // ISO yyyy-mm-dd
  keyword: string
  published: boolean
  i18n?: { ru: BlogContent; en: BlogContent }
}

export type BlogLang = 'hy' | 'ru' | 'en'

export const blogArticles: BlogArticle[] = [
  {
    slug: 'what-is-qr-menu',
    title: 'Ինչ է QR Menu-ն և ինչպես է այն աշխատում',
    description: 'QR Menu-ն թվային մենյու է, որը հաճախորդը բացում է հեռախոսով՝ QR կոդը սկանավորելով։ Բացատրում ենք ինչ է դա և ինչպես է աշխատում։',
    date: '2026-07-01',
    keyword: 'QR Menu',
    excerpt: 'QR Menu-ն ժամանակակից թվային մենյու է, որը փոխարինում է թղթային մենյուին։ Ահա թե ինչ է դա և ինչպես է աշխատում։',
    body: [
      { p: 'QR Menu-ն ռեստորանի կամ սրճարանի թվային մենյու է, որը հաճախորդը բացում է իր հեռախոսով՝ սեղանի վրա տեղադրված QR կոդը սկանավորելով։ Ոչ մի հավելված ներբեռնելու կարիք չկա — բավական է բացել տեսախցիկը։' },
      { h2: 'Ինչպես է այն աշխատում', p: 'Ռեստորանը ստեղծում է իր թվային մենյուն, ստանում եզակի QR կոդ և տպում այն սեղանների վրա։ Հաճախորդը սկանավորում է կոդը և ակնթարթորեն տեսնում ամբողջ մենյուն՝ լուսանկարներով, գներով և նկարագրություններով։' },
      { h2: 'Ինչու է դա հարմար', p: 'QR Menu-ն միշտ արդիական է․ գնի կամ ապրանքի ցանկացած փոփոխություն երևում է անմիջապես, առանց վերատպելու։ Այն նաև կարող է լինել բազմալեզու՝ հայերեն, ռուսերեն և անգլերեն։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Что такое QR Menu и как оно работает',
        description: 'QR Menu — это цифровое меню, которое гость открывает на телефоне, сканируя QR-код. Объясняем, что это и как работает.',
        excerpt: 'QR Menu — это современное цифровое меню, которое заменяет бумажное. Вот что это такое и как оно работает.',
        body: [
          { p: 'QR Menu — это цифровое меню ресторана или кафе, которое гость открывает на своём телефоне, сканируя QR-код на столе. Никаких приложений скачивать не нужно — достаточно открыть камеру.' },
          { h2: 'Как это работает', p: 'Заведение создаёт своё цифровое меню, получает уникальный QR-код и печатает его для столов. Гость сканирует код и мгновенно видит всё меню — с фото, ценами и описаниями.' },
          { h2: 'Почему это удобно', p: 'QR Menu всегда актуально: любое изменение цены или товара отображается сразу, без перепечатки. Оно также может быть многоязычным — армянский, русский и английский.' },
        ],
      },
      en: {
        title: 'What is a QR Menu and how does it work',
        description: 'A QR Menu is a digital menu the guest opens on their phone by scanning a QR code. We explain what it is and how it works.',
        excerpt: 'A QR Menu is a modern digital menu that replaces the paper one. Here is what it is and how it works.',
        body: [
          { p: 'A QR Menu is a restaurant or café’s digital menu that the guest opens on their phone by scanning a QR code placed on the table. No app to download — just open the camera.' },
          { h2: 'How it works', p: 'The venue creates its digital menu, gets a unique QR code and prints it for the tables. The guest scans the code and instantly sees the full menu — with photos, prices and descriptions.' },
          { h2: 'Why it’s convenient', p: 'A QR Menu is always up to date: any price or item change appears immediately, with no reprinting. It can also be multilingual — Armenian, Russian and English.' },
        ],
      },
    },
  },
  {
    slug: 'qr-menu-vs-paper-menu',
    title: 'Ինչու է QR Menu-ն ավելի լավ, քան թղթային մենյուն',
    description: 'QR Menu vs թղթային մենյու․ ծախս, արագություն, հիգիենա և ճկունություն։ Համեմատում ենք երկուսը։',
    date: '2026-07-02',
    keyword: 'QR Menu',
    excerpt: 'Թղթային մենյուն թանկ է և արագ հնանում։ Ահա 5 պատճառ, թե ինչու QR Menu-ն ավելի լավն է։',
    body: [
      { p: 'Թղթային մենյուն ծանոթ է բոլորին, բայց ունի թերություններ․ վերատպությունը ծախսատար է, փոփոխությունները դանդաղ են, իսկ մենյուն արագ մաշվում է։ QR Menu-ն լուծում է այս բոլորը։' },
      { h2: 'Ծախս', p: 'Ամեն գնի փոփոխության դեպքում թղթային մենյուն պետք է վերատպել։ QR Menu-ն թարմացվում է անվճար մեկ սեղմումով։' },
      { h2: 'Արագություն և ճկունություն', p: 'Վաճառված ապրանքը կարող եք ակնթարթորեն նշել «սպառված», ավելացնել նոր ուտեստներ կամ սեզոնային առաջարկներ՝ առանց ուշացման։' },
      { h2: 'Հիգիենա և փորձառություն', p: 'QR Menu-ն չի անցնում ձեռքից ձեռք, ցույց է տալիս գեղեցիկ լուսանկարներ և բարձրացնում միջին չեկը՝ ախորժալի ներկայացմամբ։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Почему QR Menu лучше бумажного меню',
        description: 'QR Menu против бумажного меню: стоимость, скорость, гигиена и гибкость. Сравниваем оба варианта.',
        excerpt: 'Бумажное меню дорогое и быстро устаревает. Вот 5 причин, почему QR Menu лучше.',
        body: [
          { p: 'Бумажное меню знакомо всем, но у него есть недостатки: перепечатка дорогая, изменения медленные, а само меню быстро изнашивается. QR Menu решает всё это.' },
          { h2: 'Стоимость', p: 'При каждом изменении цены бумажное меню нужно перепечатывать. QR Menu обновляется бесплатно, в один клик.' },
          { h2: 'Скорость и гибкость', p: 'Проданный товар можно мгновенно отметить как «нет в наличии», добавить новые блюда или сезонные предложения — без задержек.' },
          { h2: 'Гигиена и впечатление', p: 'QR Menu не передаётся из рук в руки, показывает красивые фото и повышает средний чек за счёт аппетитной подачи.' },
        ],
      },
      en: {
        title: 'Why a QR Menu is better than a paper menu',
        description: 'QR Menu vs paper menu: cost, speed, hygiene and flexibility. We compare the two.',
        excerpt: 'A paper menu is expensive and quickly outdated. Here are 5 reasons a QR Menu is better.',
        body: [
          { p: 'Everyone knows the paper menu, but it has downsides: reprinting is costly, changes are slow, and the menu wears out fast. A QR Menu solves all of this.' },
          { h2: 'Cost', p: 'Every price change means reprinting a paper menu. A QR Menu updates for free, in one click.' },
          { h2: 'Speed and flexibility', p: 'You can instantly mark a sold-out item as “unavailable”, add new dishes or seasonal offers — with no delay.' },
          { h2: 'Hygiene and experience', p: 'A QR Menu is not passed hand to hand, shows beautiful photos and raises the average check with appetizing presentation.' },
        ],
      },
    },
  },
  {
    slug: 'how-to-create-qr-menu',
    title: 'Ինչպես ստեղծել QR Menu ձեր ռեստորանի համար',
    description: 'Քայլ առ քայլ ուղեցույց՝ ինչպես ստեղծել QR Menu ձեր ռեստորանի կամ սրճարանի համար menus.am-ում։',
    date: '2026-07-03',
    keyword: 'QR Menu',
    excerpt: 'QR Menu ստեղծելը տևում է րոպեներ։ Ահա պարզ քայլերը՝ գրանցումից մինչև տպված QR կոդ։',
    body: [
      { p: 'QR Menu ստեղծելը հեշտ է և չի պահանջում տեխնիկական գիտելիք։ Ահա հիմնական քայլերը menus.am-ում։' },
      { h2: '1. Գրանցվեք և ընտրեք թեմա', p: 'Ստեղծեք հաշիվ և ընտրեք ձեր բրենդին համապատասխան պրեմիում թեմա։' },
      { h2: '2. Ավելացրեք մենյուն', p: 'Ադմին վահանակից ավելացրեք բաժիններ, կատեգորիաներ և ապրանքներ՝ գներով, նկարագրություններով և լուսանկարներով, 3 լեզվով։' },
      { h2: '3. Ստացեք QR կոդը', p: 'Համակարգը ավտոմատ գեներացնում է ձեր QR կոդը։ Տպեք այն և տեղադրեք սեղանների վրա — պատրաստ է։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Как создать QR Menu для вашего ресторана',
        description: 'Пошаговое руководство: как создать QR Menu для вашего ресторана или кафе на menus.am.',
        excerpt: 'Создание QR Menu занимает минуты. Вот простые шаги — от регистрации до напечатанного QR-кода.',
        body: [
          { p: 'Создать QR Menu легко и не требует технических знаний. Вот основные шаги на menus.am.' },
          { h2: '1. Зарегистрируйтесь и выберите тему', p: 'Создайте аккаунт и выберите премиум-тему под ваш бренд.' },
          { h2: '2. Добавьте меню', p: 'В админ-панели добавьте разделы, категории и товары — с ценами, описаниями и фото, на 3 языках.' },
          { h2: '3. Получите QR-код', p: 'Система автоматически генерирует ваш QR-код. Распечатайте его и разместите на столах — готово.' },
        ],
      },
      en: {
        title: 'How to create a QR Menu for your restaurant',
        description: 'A step-by-step guide: how to create a QR Menu for your restaurant or café on menus.am.',
        excerpt: 'Creating a QR Menu takes minutes. Here are the simple steps — from sign-up to a printed QR code.',
        body: [
          { p: 'Creating a QR Menu is easy and requires no technical knowledge. Here are the main steps on menus.am.' },
          { h2: '1. Sign up and choose a theme', p: 'Create an account and pick a premium theme that matches your brand.' },
          { h2: '2. Add your menu', p: 'From the admin panel, add sections, categories and products — with prices, descriptions and photos, in 3 languages.' },
          { h2: '3. Get your QR code', p: 'The system automatically generates your QR code. Print it and place it on the tables — done.' },
        ],
      },
    },
  },
  {
    slug: 'best-qr-menu-platforms',
    title: 'Լավագույն QR Menu համակարգերը',
    description: 'Ինչ չափանիշներով ընտրել QR Menu համակարգ․ բազմալեզու աջակցություն, թեմաներ, կառավարում և գին։',
    date: '2026-07-04',
    keyword: 'QR Menu',
    excerpt: 'Ինչպես ընտրել ճիշտ QR Menu համակարգը ձեր բիզնեսի համար։ Հիմնական չափանիշները։',
    body: [
      { p: 'Շուկայում կան բազմաթիվ QR Menu համակարգեր։ Ահա հիմնական չափանիշները, որոնց վրա արժե ուշադրություն դարձնել ընտրելիս։' },
      { h2: 'Բազմալեզու աջակցություն', p: 'Ձեր մենյուն պետք է հասանելի լինի հայերեն, ռուսերեն և անգլերեն՝ տեղացիների և զբոսաշրջիկների համար։' },
      { h2: 'Հեշտ կառավարում և գին', p: 'Լավ համակարգը թույլ է տալիս ինքնուրույն թարմացնել մենյուն և ունի թափանցիկ գնացուցակ՝ առանց թաքնված վճարների։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Лучшие системы QR Menu',
        description: 'По каким критериям выбрать систему QR Menu: многоязычная поддержка, темы, управление и цена.',
        excerpt: 'Как выбрать правильную систему QR Menu для вашего бизнеса. Основные критерии.',
        body: [
          { p: 'На рынке есть множество систем QR Menu. Вот основные критерии, на которые стоит обратить внимание при выборе.' },
          { h2: 'Многоязычная поддержка', p: 'Ваше меню должно быть доступно на армянском, русском и английском — для местных и туристов.' },
          { h2: 'Простое управление и цена', p: 'Хорошая система позволяет самостоятельно обновлять меню и имеет прозрачные тарифы без скрытых платежей.' },
        ],
      },
      en: {
        title: 'The best QR Menu systems',
        description: 'What criteria to choose a QR Menu system by: multilingual support, themes, management and price.',
        excerpt: 'How to choose the right QR Menu system for your business. The key criteria.',
        body: [
          { p: 'There are many QR Menu systems on the market. Here are the key criteria worth paying attention to when choosing.' },
          { h2: 'Multilingual support', p: 'Your menu should be available in Armenian, Russian and English — for locals and tourists.' },
          { h2: 'Easy management and price', p: 'A good system lets you update the menu yourself and has transparent pricing with no hidden fees.' },
        ],
      },
    },
  },
  {
    slug: 'how-to-update-menu',
    title: 'Ինչպես թարմացնել ռեստորանի մենյուն առցանց',
    description: 'Ինչպես ակնթարթորեն թարմացնել ձեր ռեստորանի մենյուն առցանց՝ գներ, ապրանքներ, հասանելիություն։',
    date: '2026-07-05',
    keyword: 'Online Menu',
    excerpt: 'Առցանց մենյուն թարմացվում է վայրկյանների ընթացքում։ Ահա ինչպես։',
    body: [
      { p: 'Թվային մենյուի ամենամեծ առավելություններից մեկը ակնթարթային թարմացումն է։ Ահա ինչպես դա անել առցանց։' },
      { h2: 'Գների և ապրանքների փոփոխություն', p: 'Ադմին վահանակից բացեք ապրանքը, փոխեք գինը կամ նկարագրությունը և պահեք — փոփոխությունը երևում է անմիջապես բոլոր հաճախորդների մոտ։' },
      { h2: 'Հասանելիության կառավարում', p: 'Վաճառված ուտեստը նշեք «սպառված»՝ մեկ սեղմումով, և հաճախորդները չեն պատվիրի այն։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Как обновить меню ресторана онлайн',
        description: 'Как мгновенно обновить меню вашего ресторана онлайн: цены, товары, наличие.',
        excerpt: 'Онлайн-меню обновляется за секунды. Вот как.',
        body: [
          { p: 'Одно из главных преимуществ цифрового меню — мгновенное обновление. Вот как это сделать онлайн.' },
          { h2: 'Изменение цен и товаров', p: 'В админ-панели откройте товар, измените цену или описание и сохраните — изменение сразу видно всем гостям.' },
          { h2: 'Управление наличием', p: 'Проданное блюдо отметьте как «нет в наличии» в один клик, и гости не будут его заказывать.' },
        ],
      },
      en: {
        title: 'How to update your restaurant menu online',
        description: 'How to instantly update your restaurant menu online: prices, items, availability.',
        excerpt: 'An online menu updates in seconds. Here’s how.',
        body: [
          { p: 'One of the biggest advantages of a digital menu is instant updating. Here’s how to do it online.' },
          { h2: 'Changing prices and items', p: 'In the admin panel, open the item, change the price or description and save — the change is instantly visible to all guests.' },
          { h2: 'Managing availability', p: 'Mark a sold-out dish as “unavailable” in one click, and guests won’t order it.' },
        ],
      },
    },
  },
  {
    slug: 'digital-menu',
    title: 'Ինչու ընտրել թվային մենյու',
    description: 'Թվային մենյուի առավելությունները ռեստորանների և սրճարանների համար՝ ծախս, փորձառություն, ճկունություն։',
    date: '2026-07-06',
    keyword: 'Digital Menu',
    excerpt: 'Թվային մենյուն ոչ միայն ժամանակակից է, այլև խնայող ու ճկուն։ Ահա ինչու։',
    body: [
      { p: 'Թվային մենյուն արագ դառնում է ստանդարտ սննդի ոլորտում։ Ահա հիմնական պատճառները, թե ինչու են բիզնեսներն ընտրում այն։' },
      { h2: 'Ծախսերի խնայողություն', p: 'Ոչ մի վերատպություն — մենյուն թարմացվում է թվային եղանակով, անվճար։' },
      { h2: 'Ավելի լավ փորձառություն', p: 'Լուսանկարներ, բազմալեզու ներկայացում և հարմար նավիգացիա՝ ավելի բավարարված հաճախորդներ։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Почему стоит выбрать цифровое меню',
        description: 'Преимущества цифрового меню для ресторанов и кафе: стоимость, впечатление, гибкость.',
        excerpt: 'Цифровое меню не только современно, но и экономно и гибко. Вот почему.',
        body: [
          { p: 'Цифровое меню быстро становится стандартом в сфере питания. Вот основные причины, почему бизнесы его выбирают.' },
          { h2: 'Экономия расходов', p: 'Никаких перепечаток — меню обновляется в цифровом виде, бесплатно.' },
          { h2: 'Лучшее впечатление', p: 'Фото, многоязычная подача и удобная навигация — более довольные гости.' },
        ],
      },
      en: {
        title: 'Why choose a digital menu',
        description: 'The advantages of a digital menu for restaurants and cafés: cost, experience, flexibility.',
        excerpt: 'A digital menu is not only modern but also economical and flexible. Here’s why.',
        body: [
          { p: 'A digital menu is quickly becoming the standard in the food industry. Here are the main reasons businesses choose it.' },
          { h2: 'Cost savings', p: 'No reprinting — the menu updates digitally, for free.' },
          { h2: 'A better experience', p: 'Photos, multilingual presentation and convenient navigation — more satisfied guests.' },
        ],
      },
    },
  },
  {
    slug: 'qr-menu-benefits',
    title: 'QR Menu-ի առավելությունները',
    description: 'QR Menu-ի հիմնական առավելությունները ռեստորանների համար՝ արագություն, ճկունություն, խնայողություն, հիգիենա։',
    date: '2026-07-07',
    keyword: 'QR Menu',
    excerpt: 'QR Menu-ի 6 հիմնական առավելությունը, որ կփոխեն ձեր ռեստորանի աշխատանքը։',
    body: [
      { p: 'QR Menu-ն առաջարկում է մի շարք առավելություններ ինչպես բիզնեսի, այնպես էլ հաճախորդի համար։' },
      { h2: 'Բիզնեսի համար', p: 'Ծախսերի խնայողություն, ակնթարթային թարմացումներ, վիճակագրություն և ավելի բարձր միջին չեկ։' },
      { h2: 'Հաճախորդի համար', p: 'Արագ հասանելիություն, գեղեցիկ լուսանկարներ, բազմալեզու մենյու և հիգիենիկ փորձառություն։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Преимущества QR Menu',
        description: 'Основные преимущества QR Menu для ресторанов: скорость, гибкость, экономия, гигиена.',
        excerpt: '6 ключевых преимуществ QR Menu, которые изменят работу вашего ресторана.',
        body: [
          { p: 'QR Menu предлагает ряд преимуществ как для бизнеса, так и для гостя.' },
          { h2: 'Для бизнеса', p: 'Экономия расходов, мгновенные обновления, статистика и более высокий средний чек.' },
          { h2: 'Для гостя', p: 'Быстрый доступ, красивые фото, многоязычное меню и гигиеничный опыт.' },
        ],
      },
      en: {
        title: 'The advantages of a QR Menu',
        description: 'The main advantages of a QR Menu for restaurants: speed, flexibility, savings, hygiene.',
        excerpt: '6 key advantages of a QR Menu that will change how your restaurant works.',
        body: [
          { p: 'A QR Menu offers a range of advantages for both the business and the guest.' },
          { h2: 'For the business', p: 'Cost savings, instant updates, analytics and a higher average check.' },
          { h2: 'For the guest', p: 'Fast access, beautiful photos, a multilingual menu and a hygienic experience.' },
        ],
      },
    },
  },
  {
    slug: 'restaurant-digital-menu-guide',
    title: 'Restaurant Digital Menu Guide',
    description: 'Ամբողջական ուղեցույց ռեստորանի թվային մենյուի մասին՝ ինչպես ստեղծել, կառավարել և օպտիմիզացնել այն։',
    date: '2026-07-08',
    keyword: 'Restaurant Menu',
    excerpt: 'Ամեն ինչ, ինչ պետք է իմանաք ռեստորանի թվային մենյուի մասին՝ մեկ ուղեցույցում։',
    body: [
      { p: 'Ռեստորանի թվային մենյուն (Restaurant Digital Menu) ձեր ապրանքների ամբողջական թվային ներկայացումն է։ Այս ուղեցույցը ընդգրկում է հիմունքները։' },
      { h2: 'Կառուցվածք', p: 'Կազմակերպեք մենյուն բաժիններով և կատեգորիաներով՝ ուտեստներ, ըմպելիքներ, աղանդեր, որպեսզի հաճախորդը հեշտ գտնի ուզածը։' },
      { h2: 'Օպտիմիզացիա', p: 'Ավելացրեք լուսանկարներ, հստակ նկարագրություններ և առանձնացրեք հիթ ապրանքները վաճառքը մեծացնելու համար։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Руководство по цифровому меню ресторана',
        description: 'Полное руководство по цифровому меню ресторана: как создать, управлять и оптимизировать его.',
        excerpt: 'Всё, что нужно знать о цифровом меню ресторана, — в одном руководстве.',
        body: [
          { p: 'Цифровое меню ресторана (Restaurant Digital Menu) — это полное цифровое представление ваших товаров. Это руководство охватывает основы.' },
          { h2: 'Структура', p: 'Организуйте меню разделами и категориями — блюда, напитки, десерты, чтобы гость легко нашёл нужное.' },
          { h2: 'Оптимизация', p: 'Добавьте фото, чёткие описания и выделите хиты продаж, чтобы увеличить продажи.' },
        ],
      },
      en: {
        title: 'Restaurant Digital Menu Guide',
        description: 'A complete guide to a restaurant’s digital menu: how to create, manage and optimize it.',
        excerpt: 'Everything you need to know about a restaurant’s digital menu — in one guide.',
        body: [
          { p: 'A Restaurant Digital Menu is the full digital presentation of your products. This guide covers the basics.' },
          { h2: 'Structure', p: 'Organize the menu into sections and categories — dishes, drinks, desserts — so guests easily find what they want.' },
          { h2: 'Optimization', p: 'Add photos, clear descriptions and highlight best-sellers to increase sales.' },
        ],
      },
    },
  },
  {
    slug: 'online-menu-vs-paper-menu',
    title: 'Online Menu vs Paper Menu',
    description: 'Online Menu-ի և թղթային մենյուի համեմատություն․ ո՞րն է ավելի լավը ձեր ռեստորանի համար։',
    date: '2026-07-09',
    keyword: 'Online Menu',
    excerpt: 'Online Menu թե՞ թղթ․ ուղիղ համեմատություն՝ գնի, արագության և փորձառության վրա։',
    body: [
      { p: 'Online Menu-ն և թղթային մենյուն սպասարկում են նույն նպատակին, բայց շատ տարբեր են արդյունավետությամբ։' },
      { h2: 'Երբ թղթ, երբ առցանց', p: 'Թղթը ծանոթ է, բայց ստատիկ և ծախսատար։ Online Menu-ն դինամիկ է, թարմացվող և բազմալեզու։' },
      { h2: 'Եզրակացություն', p: 'Աճող թվով ռեստորաններ անցնում են Online Menu-ի ճկունության և խնայողության համար, հաճախ երկուսը զուգակցելով անցումային շրջանում։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'Онлайн-меню против бумажного меню',
        description: 'Сравнение онлайн-меню и бумажного меню: что лучше для вашего ресторана.',
        excerpt: 'Онлайн-меню или бумага? Прямое сравнение по цене, скорости и впечатлению.',
        body: [
          { p: 'Онлайн-меню и бумажное меню служат одной цели, но сильно различаются по эффективности.' },
          { h2: 'Когда бумага, когда онлайн', p: 'Бумага привычна, но статична и затратна. Онлайн-меню динамично, обновляемо и многоязычно.' },
          { h2: 'Вывод', p: 'Всё больше ресторанов переходят на онлайн-меню ради гибкости и экономии, часто совмещая оба на переходном этапе.' },
        ],
      },
      en: {
        title: 'Online Menu vs Paper Menu',
        description: 'A comparison of an online menu and a paper menu: which is better for your restaurant.',
        excerpt: 'Online menu or paper? A direct comparison on cost, speed and experience.',
        body: [
          { p: 'An online menu and a paper menu serve the same purpose but differ greatly in efficiency.' },
          { h2: 'When paper, when online', p: 'Paper is familiar but static and costly. An online menu is dynamic, updatable and multilingual.' },
          { h2: 'Conclusion', p: 'A growing number of restaurants switch to an online menu for flexibility and savings, often combining both during the transition.' },
        ],
      },
    },
  },
  {
    slug: 'qr-menu-armenia',
    title: 'QR Menu Armenia — QR մենյու Հայաստանում',
    description: 'QR Menu-ն Հայաստանում․ ինչպես հայկական ռեստորաններն ու սրճարանները անցնում են թվային մենյուի։',
    date: '2026-07-10',
    keyword: 'QR Menu Armenia',
    excerpt: 'Ինչպես է QR Menu-ն տարածվում Հայաստանում և ինչու է դա կարևոր տեղական բիզնեսների համար։',
    body: [
      { p: 'Հայաստանում QR Menu-ն արագ դառնում է ստանդարտ ռեստորանների, սրճարանների և բարերի համար՝ հատկապես զբոսաշրջության աճի ֆոնին։' },
      { h2: 'Տեղական կարիքներ', p: 'Հայկական բիզնեսներին պետք է հայերեն ինտերֆեյս, դրամով գնագոյացում և բազմալեզու մենյու տեղացիների ու զբոսաշրջիկների համար։' },
      { h2: 'menus.am-ը', p: 'menus.am-ը հայկական հարթակ է, ստեղծված հենց այս կարիքների համար՝ տեղական աջակցությամբ և հայկական խոհանոցին հարմար թեմաներով։' },
    ],
    published: true,
    i18n: {
      ru: {
        title: 'QR Menu Armenia — QR-меню в Армении',
        description: 'QR Menu в Армении: как армянские рестораны и кафе переходят на цифровое меню.',
        excerpt: 'Как QR Menu распространяется в Армении и почему это важно для местного бизнеса.',
        body: [
          { p: 'В Армении QR Menu быстро становится стандартом для ресторанов, кафе и баров — особенно на фоне роста туризма.' },
          { h2: 'Локальные потребности', p: 'Армянскому бизнесу нужен интерфейс на армянском, ценообразование в драмах и многоязычное меню — для местных и туристов.' },
          { h2: 'menus.am', p: 'menus.am — армянская платформа, созданная именно под эти потребности: с локальной поддержкой и темами под армянскую кухню.' },
        ],
      },
      en: {
        title: 'QR Menu Armenia — QR menu in Armenia',
        description: 'QR Menu in Armenia: how Armenian restaurants and cafés are moving to a digital menu.',
        excerpt: 'How QR Menu is spreading in Armenia and why it matters for local businesses.',
        body: [
          { p: 'In Armenia, QR Menu is quickly becoming the standard for restaurants, cafés and bars — especially amid growing tourism.' },
          { h2: 'Local needs', p: 'Armenian businesses need an Armenian interface, pricing in drams and a multilingual menu — for locals and tourists.' },
          { h2: 'menus.am', p: 'menus.am is an Armenian platform built for exactly these needs — with local support and themes suited to Armenian cuisine.' },
        ],
      },
    },
  },
]

/** Return the article with its visible fields swapped to the chosen language.
 *  `hy` (or a missing translation) returns the base article unchanged, so SSR
 *  and <head>/JSON-LD keep the Armenian content for SEO. */
export const localizeArticle = (a: BlogArticle, lang: BlogLang): BlogArticle => {
  if (lang === 'hy' || !a.i18n?.[lang]) return a
  const t = a.i18n[lang]
  return { ...a, title: t.title, description: t.description, excerpt: t.excerpt, body: t.body }
}

export const publishedArticles = () =>
  [...blogArticles].filter((a) => a.published).sort((a, b) => b.date.localeCompare(a.date))

export const getArticle = (slug: string) => blogArticles.find((a) => a.slug === slug && a.published)
