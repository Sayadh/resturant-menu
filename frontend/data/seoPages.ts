// ─────────────────────────────────────────────────────────────────────────
// Keyword-targeted SEO landing (pillar) pages. Rendered through the shared
// <SeoLandingPage> component. Rich, unique content per page (not thin) so each
// genuinely earns rankings: multiple sections + a real FAQ per page.
// Adding a page = one entry here + a 3-line page file under pages/.
//
// i18n note: the Armenian fields are the DEFAULT (SSR-rendered) content and
// drive <title>/description + JSON-LD, so keyword SEO stays in `hy`. The
// `i18n.ru` / `i18n.en` blocks are the VISIBLE translation shown when the
// visitor switches language (see useLandingI18n + localizeSeoPage). keyword,
// title and description intentionally stay Armenian for search targeting.
// ─────────────────────────────────────────────────────────────────────────
import type { FaqItem } from './seo'

export interface SeoContent {
  h1: string
  intro: string
  sections: { h2: string; body: string }[]
  faq: FaqItem[]
}

export interface SeoPage extends SeoContent {
  slug: string
  keyword: string
  title: string // <title>
  description: string // meta description
  i18n?: { ru: SeoContent; en: SeoContent }
}

export type SeoLang = 'hy' | 'ru' | 'en'

export const seoPages: Record<string, SeoPage> = {
  'qr-menu': {
    slug: 'qr-menu',
    keyword: 'QR Menu',
    title: 'QR Menu ռեստորանի համար | Ստեղծել QR մենյու — menus.am',
    description:
      'Ստեղծեք QR Menu ձեր ռեստորանի կամ սրճարանի համար։ Թվային QR մենյու, 3 լեզու, AI թարգմանություն, ակնթարթային թարմացումներ՝ menus.am-ում։',
    h1: 'QR Menu ձեր ռեստորանի համար',
    intro:
      'QR Menu-ն ժամանակակից թվային մենյու է, որը հաճախորդը բացում է հեռախոսով՝ սեղանի QR կոդը սկանավորելով։ Առանց թղթի, առանց հավելվածի — մաքուր, արագ և միշտ արդիական։ menus.am-ը թույլ է տալիս ստեղծել ձեր QR Menu-ն րոպեների ընթացքում, 3 լեզվով և պրոֆեսիոնալ տեսքով։',
    sections: [
      { h2: 'Ինչ է QR Menu-ն', body: 'QR Menu-ն ռեստորանի կամ սրճարանի մենյուն է թվային տեսքով, հասանելի QR կոդի միջոցով։ Հաճախորդը սկանավորում է կոդը հեռախոսի տեսախցիկով և ակնթարթորեն տեսնում ամբողջ մենյուն՝ լուսանկարներով, գներով և նկարագրություններով, առանց հավելված ներբեռնելու։' },
      { h2: 'Ինչպես է աշխատում QR Menu-ն', body: 'Դուք ստեղծում եք ձեր թվային մենյուն ադմին վահանակից, համակարգը ավտոմատ գեներացնում է եզակի QR կոդ, իսկ դուք տպում և տեղադրում եք այն սեղանների վրա։ Հաճախորդը սկանավորում է և պատվիրում՝ տեսնելով ձեր բրենդին համապատասխան դիզայն։' },
      { h2: 'QR Menu-ի առավելությունները', body: 'QR Menu-ն թույլ է տալիս ակնթարթորեն թարմացնել գներն ու ապրանքները՝ առանց վերատպելու, ցուցադրել ախորժալի լուսանկարներ, աշխատել բազմալեզու (հայերեն, ռուսերեն, անգլերեն), նշել վաճառված ուտեստները և խնայել տպագրության ծախսերը։' },
      { h2: 'Ինչպես ստեղծել QR Menu քայլ առ քայլ', body: '1) Գրանցվեք menus.am-ում։ 2) Ընտրեք ձեր բրենդին համապատասխան պրեմիում թեմա։ 3) Ավելացրեք բաժիններ, կատեգորիաներ և ապրանքներ՝ գներով, նկարագրություններով և լուսանկարներով։ 4) Ստացեք ձեր QR կոդը և տպեք այն։ Ամբողջ գործընթացը տևում է րոպեներ։' },
      { h2: 'QR Menu vs թղթային մենյու', body: 'Թղթային մենյուն ծախսատար է վերատպելու, արագ մաշվում է և ստատիկ է։ QR Menu-ն թարմացվում է անվճար՝ մեկ սեղմումով, միշտ մաքուր է և ցույց է տալիս իրական ժամանակի գներ ու հասանելիություն։ Աճող թվով ռեստորաններ ամբողջովին անցնում են QR Menu-ի։' },
      { h2: 'QR Menu-ի գինը', body: 'menus.am-ում QR Menu-ն սկսվում է ամսական 4 900 ֏-ից՝ Starter փաթեթով, որը ներառում է ադմին վահանակ, 2 լեզու և մինչև 250 ապրանք։ Professional փաթեթը ավելացնում է անսահմանափակ ապրանքներ, 3 լեզու, բոլոր թեմաներն ու AI հնարավորությունները։' },
    ],
    faq: [
      { q: 'Ինչ է QR Menu-ն?', a: 'QR Menu-ն թվային մենյու է, որը բացվում է հեռախոսով՝ QR կոդը սկանավորելով, առանց թղթային մենյուի և առանց հավելված ներբեռնելու։' },
      { q: 'Ինչպես ստեղծել QR Menu?', a: 'menus.am-ում գրանցվեք, ընտրեք թեմա, լցրեք մենյուն ադմին վահանակից և ստացեք ձեր QR կոդը՝ պատրաստ տպելու։' },
      { q: 'Ինչ արժե QR Menu-ն?', a: 'QR Menu-ն menus.am-ում սկսվում է ամսական 4 900 ֏-ից։ Կան Professional և Business փաթեթներ ավելի մեծ հնարավորություններով։' },
      { q: 'QR Menu-ն աշխատո՞ւմ է iPhone-ում և Android-ում։', a: 'Այո, QR Menu-ն բացվում է ցանկացած iPhone-ի կամ Android-ի տեսախցիկով՝ առանց հավելված ներբեռնելու։' },
      { q: 'Կարո՞ղ եմ ինքս թարմացնել մենյուն։', a: 'Այո, ադմին վահանակից ցանկացած պահի կարող եք փոխել գներն ու ապրանքները՝ ակնթարթորեն։' },
    ],
    i18n: {
      ru: {
        h1: 'QR Menu для вашего ресторана',
        intro:
          'QR Menu — это современное цифровое меню, которое гость открывает на телефоне, сканируя QR-код на столе. Без бумаги, без приложения — чисто, быстро и всегда актуально. menus.am позволяет создать ваше QR Menu за минуты, на 3 языках и в профессиональном виде.',
        sections: [
          { h2: 'Что такое QR Menu', body: 'QR Menu — это меню ресторана или кафе в цифровом виде, доступное через QR-код. Гость сканирует код камерой телефона и мгновенно видит всё меню — с фото, ценами и описаниями, без скачивания приложения.' },
          { h2: 'Как работает QR Menu', body: 'Вы создаёте цифровое меню в админ-панели, система автоматически генерирует уникальный QR-код, а вы печатаете его и размещаете на столах. Гость сканирует и заказывает, видя дизайн под ваш бренд.' },
          { h2: 'Преимущества QR Menu', body: 'QR Menu позволяет мгновенно обновлять цены и товары без перепечатки, показывать аппетитные фото, работать многоязычно (армянский, русский, английский), отмечать проданные блюда и экономить на печати.' },
          { h2: 'Как создать QR Menu пошагово', body: '1) Зарегистрируйтесь на menus.am. 2) Выберите премиум-тему под ваш бренд. 3) Добавьте разделы, категории и товары — с ценами, описаниями и фото. 4) Получите ваш QR-код и распечатайте его. Весь процесс занимает минуты.' },
          { h2: 'QR Menu против бумажного меню', body: 'Бумажное меню дорого перепечатывать, быстро изнашивается и статично. QR Menu обновляется бесплатно в один клик, всегда чистое и показывает цены и наличие в реальном времени. Всё больше ресторанов полностью переходят на QR Menu.' },
          { h2: 'Стоимость QR Menu', body: 'На menus.am QR Menu начинается от 4 900 ֏ в месяц с тарифом Starter, включающим админ-панель, 2 языка и до 250 товаров. Тариф Professional добавляет неограниченно товаров, 3 языка, все темы и AI-возможности.' },
        ],
        faq: [
          { q: 'Что такое QR Menu?', a: 'QR Menu — это цифровое меню, которое открывается на телефоне сканированием QR-кода, без бумажного меню и без скачивания приложения.' },
          { q: 'Как создать QR Menu?', a: 'На menus.am зарегистрируйтесь, выберите тему, заполните меню в админ-панели и получите ваш QR-код, готовый к печати.' },
          { q: 'Сколько стоит QR Menu?', a: 'QR Menu на menus.am начинается от 4 900 ֏ в месяц. Есть тарифы Professional и Business с большими возможностями.' },
          { q: 'Работает ли QR Menu на iPhone и Android?', a: 'Да, QR Menu открывается камерой любого iPhone или Android без скачивания приложения.' },
          { q: 'Могу ли я сам обновлять меню?', a: 'Да, в админ-панели вы в любой момент можете изменить цены и товары — мгновенно.' },
        ],
      },
      en: {
        h1: 'QR Menu for your restaurant',
        intro:
          'A QR Menu is a modern digital menu the guest opens on their phone by scanning the QR code on the table. No paper, no app — clean, fast and always up to date. menus.am lets you create your QR Menu in minutes, in 3 languages and with a professional look.',
        sections: [
          { h2: 'What is a QR Menu', body: 'A QR Menu is a restaurant or café menu in digital form, accessible via a QR code. The guest scans the code with their phone camera and instantly sees the full menu — with photos, prices and descriptions, without downloading an app.' },
          { h2: 'How a QR Menu works', body: 'You create your digital menu in the admin panel, the system automatically generates a unique QR code, and you print and place it on the tables. The guest scans and orders, seeing a design that matches your brand.' },
          { h2: 'Advantages of a QR Menu', body: 'A QR Menu lets you instantly update prices and items without reprinting, show appetizing photos, work multilingually (Armenian, Russian, English), mark sold-out dishes and save on printing costs.' },
          { h2: 'How to create a QR Menu step by step', body: '1) Sign up on menus.am. 2) Choose a premium theme for your brand. 3) Add sections, categories and products — with prices, descriptions and photos. 4) Get your QR code and print it. The whole process takes minutes.' },
          { h2: 'QR Menu vs paper menu', body: 'A paper menu is costly to reprint, wears out fast and is static. A QR Menu updates for free in one click, is always clean and shows real-time prices and availability. A growing number of restaurants switch fully to a QR Menu.' },
          { h2: 'QR Menu price', body: 'On menus.am a QR Menu starts at 4,900 ֏/month with the Starter plan, which includes the admin panel, 2 languages and up to 250 products. The Professional plan adds unlimited products, 3 languages, all themes and AI features.' },
        ],
        faq: [
          { q: 'What is a QR Menu?', a: 'A QR Menu is a digital menu opened on the phone by scanning a QR code, with no paper menu and no app download.' },
          { q: 'How do I create a QR Menu?', a: 'On menus.am sign up, choose a theme, fill in the menu from the admin panel and get your QR code, ready to print.' },
          { q: 'How much does a QR Menu cost?', a: 'A QR Menu on menus.am starts at 4,900 ֏/month. There are Professional and Business plans with more features.' },
          { q: 'Does a QR Menu work on iPhone and Android?', a: 'Yes, a QR Menu opens with any iPhone or Android camera without downloading an app.' },
          { q: 'Can I update the menu myself?', a: 'Yes, from the admin panel you can change prices and items any time — instantly.' },
        ],
      },
    },
  },
  'online-menu': {
    slug: 'online-menu',
    keyword: 'Online Menu',
    title: 'Online Menu ռեստորանի համար | Օնլայն մենյու — menus.am',
    description:
      'Online Menu ձեր բիզնեսի համար՝ հասանելի ցանկացած սարքից։ Օնլայն մենյու 3 լեզվով, հեշտ կառավարում, ակնթարթային թարմացումներ՝ menus.am-ում։',
    h1: 'Online Menu — ձեր մենյուն առցանց',
    intro:
      'Online Menu-ն ձեր ռեստորանի մենյուն է, հասանելի ինտերնետով՝ ցանկացած հեռախոսից կամ համակարգչից։ Կիսվեք հղումով, տեղադրեք QR կոդ, ավելացրեք այն Google Business Profile-ում և թարմացրեք մեկ սեղմումով։',
    sections: [
      { h2: 'Ինչ է Online Menu-ն', body: 'Online Menu-ն ձեր մենյուն է առցանց՝ հասանելի եզակի հղումով կամ QR կոդով։ Հաճախորդները կարող են դիտել այն նախքան այցելելը, կիսվել ընկերների հետ և պատվիրել տեղում՝ ցանկացած սարքից։' },
      { h2: 'Online Menu vs թղթային մենյու', body: 'Առցանց մենյուն թարմացվում է ակնթարթորեն, ցույց է տալիս լուսանկարներ ու գներ իրական ժամանակում և չի պահանջում վերատպում։ Այն նաև օգնում է ձեզ գտնվել Google-ում, երբ մարդիկ որոնում են ձեր ռեստորանը։' },
      { h2: 'Բազմալեզու Online Menu', body: 'Ներկայացրեք ձեր մենյուն հայերեն, ռուսերեն և անգլերեն՝ ավտոմատ լեզվի փոխարկումով։ Սա հատկապես կարևոր է զբոսաշրջիկների և բազմազգ հաճախորդների համար։' },
      { h2: 'Ինչպես դնել ձեր մենյուն առցանց', body: 'menus.am-ում գրանցվեք, ավելացրեք ձեր ապրանքները ադմին վահանակից, ընտրեք թեմա և ստացեք ձեր առցանց մենյուի հղումը՝ պատրաստ կիսվելու սոցցանցերում, Google-ում կամ QR կոդով։' },
      { h2: 'Online Menu և Google-ում գտնվելը', body: 'Ձեր առցանց մենյուն ունի իր հասցեն և կարող է հայտնվել Google-ի որոնման արդյունքներում։ Դա նշանակում է, որ նոր հաճախորդները կարող են գտնել ձեր ռեստորանն ու մենյուն ուղիղ որոնումից։' },
    ],
    faq: [
      { q: 'Ինչ է Online Menu-ն?', a: 'Online Menu-ն ձեր մենյուն է առցանց՝ հասանելի հղումով կամ QR կոդով ցանկացած սարքից։' },
      { q: 'Կարո՞ղ եմ թարմացնել Online Menu-ն ինքս։', a: 'Այո, ադմին վահանակից կարող եք ցանկացած պահի փոխել գներն ու ապրանքները՝ ակնթարթորեն։' },
      { q: 'Online Menu-ն ունի՞ QR կոդ։', a: 'Այո, ձեր առցանց մենյուն ավտոմատ ունի QR կոդ, որը կարող եք տպել և տեղադրել սեղանների վրա։' },
      { q: 'Հաճախորդներին հավելված պե՞տք է։', a: 'Ոչ, Online Menu-ն բացվում է ցանկացած բրաուզերում՝ առանց հավելված ներբեռնելու։' },
    ],
    i18n: {
      ru: {
        h1: 'Online Menu — ваше меню онлайн',
        intro:
          'Online Menu — это меню вашего ресторана, доступное через интернет с любого телефона или компьютера. Делитесь ссылкой, размещайте QR-код, добавляйте его в Google Business Profile и обновляйте в один клик.',
        sections: [
          { h2: 'Что такое Online Menu', body: 'Online Menu — это ваше меню онлайн, доступное по уникальной ссылке или QR-коду. Гости могут посмотреть его до визита, поделиться с друзьями и заказать на месте с любого устройства.' },
          { h2: 'Online Menu против бумажного меню', body: 'Онлайн-меню обновляется мгновенно, показывает фото и цены в реальном времени и не требует перепечатки. Оно также помогает вам находиться в Google, когда люди ищут ваш ресторан.' },
          { h2: 'Многоязычное Online Menu', body: 'Показывайте меню на армянском, русском и английском с автоматическим переключением языка. Это особенно важно для туристов и многонациональных гостей.' },
          { h2: 'Как разместить меню онлайн', body: 'На menus.am зарегистрируйтесь, добавьте товары в админ-панели, выберите тему и получите ссылку на онлайн-меню, готовую к публикации в соцсетях, Google или через QR-код.' },
          { h2: 'Online Menu и присутствие в Google', body: 'У вашего онлайн-меню есть свой адрес, и оно может появляться в результатах поиска Google. Это значит, что новые гости могут найти ваш ресторан и меню прямо из поиска.' },
        ],
        faq: [
          { q: 'Что такое Online Menu?', a: 'Online Menu — это ваше меню онлайн, доступное по ссылке или QR-коду с любого устройства.' },
          { q: 'Могу ли я обновлять Online Menu сам?', a: 'Да, в админ-панели вы можете в любой момент изменить цены и товары — мгновенно.' },
          { q: 'Есть ли у Online Menu QR-код?', a: 'Да, у вашего онлайн-меню автоматически есть QR-код, который можно распечатать и разместить на столах.' },
          { q: 'Нужно ли гостям приложение?', a: 'Нет, Online Menu открывается в любом браузере без скачивания приложения.' },
        ],
      },
      en: {
        h1: 'Online Menu — your menu online',
        intro:
          'An Online Menu is your restaurant’s menu, accessible over the internet from any phone or computer. Share a link, place a QR code, add it to your Google Business Profile and update it in one click.',
        sections: [
          { h2: 'What is an Online Menu', body: 'An Online Menu is your menu online, accessible via a unique link or QR code. Guests can view it before visiting, share it with friends and order on the spot from any device.' },
          { h2: 'Online Menu vs paper menu', body: 'An online menu updates instantly, shows photos and prices in real time and needs no reprinting. It also helps you appear on Google when people search for your restaurant.' },
          { h2: 'Multilingual Online Menu', body: 'Show your menu in Armenian, Russian and English with automatic language switching. This is especially important for tourists and multinational guests.' },
          { h2: 'How to put your menu online', body: 'On menus.am sign up, add your products in the admin panel, choose a theme and get your online menu link, ready to share on social media, Google or via a QR code.' },
          { h2: 'Online Menu and being found on Google', body: 'Your online menu has its own address and can appear in Google search results. That means new guests can find your restaurant and menu straight from search.' },
        ],
        faq: [
          { q: 'What is an Online Menu?', a: 'An Online Menu is your menu online, accessible via a link or QR code from any device.' },
          { q: 'Can I update the Online Menu myself?', a: 'Yes, from the admin panel you can change prices and items any time — instantly.' },
          { q: 'Does the Online Menu have a QR code?', a: 'Yes, your online menu automatically has a QR code you can print and place on the tables.' },
          { q: 'Do guests need an app?', a: 'No, the Online Menu opens in any browser without downloading an app.' },
        ],
      },
    },
  },
  'restaurant-menu': {
    slug: 'restaurant-menu',
    keyword: 'Restaurant Menu',
    title: 'Restaurant Menu — ռեստորանի թվային մենյու | menus.am',
    description:
      'Ստեղծեք ձեր ռեստորանի թվային մենյուն (Restaurant Digital Menu)՝ QR կոդով, բազմալեզու և հեշտ կառավարվող՝ menus.am-ում։',
    h1: 'Restaurant Menu — ձեր ռեստորանի թվային մենյուն',
    intro:
      'Ժամանակակից ռեստորանի մենյուն թվային է․ QR կոդ սեղանին, գեղեցիկ լուսանկարներ, բազմալեզու ներկայացում և ակնթարթային թարմացումներ։ menus.am-ը ձեզ տալիս է ամեն ինչ՝ պրոֆեսիոնալ ռեստորանի մենյու ստեղծելու համար։',
    sections: [
      { h2: 'Ինչպես կառուցել ռեստորանի մենյուն', body: 'Կազմակերպեք մենյուն բաժիններով և կատեգորիաներով՝ ուտեստներ, ըմպելիքներ, աղանդեր, որպեսզի հաճախորդը հեշտ գտնի ուզածը։ Ավելացրեք հստակ նկարագրություններ, գներ և բարձրորակ լուսանկարներ։' },
      { h2: 'Menu engineering — ինչպես ավելացնել վաճառքը', body: 'Առանձնացրեք բարձր եկամտաբեր ապրանքները, օգտագործեք ախորժալի լուսանկարներ և ճիշտ նկարագրություններ։ Հիթ ապրանքների նշումը և ճիշտ դասավորությունը բարձրացնում են միջին չեկը։' },
      { h2: 'Բազմալեզու ռեստորանի մենյու', body: 'Ցուցադրեք ձեր մենյուն հայերեն, ռուսերեն և անգլերեն։ Զբոսաշրջիկների համար բազմալեզու մենյուն մեծացնում է պատվերները և բարելավում փորձառությունը։' },
      { h2: 'Ինչու թվային մենյու ռեստորանի համար', body: 'Խնայեք տպագրության ծախսերի վրա, թարմացրեք գները ակնթարթորեն, նշեք վաճառված ուտեստները և պահեք մենյուն միշտ արդիական՝ առանց վերատպելու։' },
      { h2: 'Restaurant Digital Menu Guide', body: 'Ընտրեք պրեմիում թեմա, կառուցեք մենյուն, ավելացրեք լուսանկարներ, ստացեք QR կոդ և կիսվեք հղումով։ menus.am-ը միավորում է մենյուի կառավարումն ու QR կոդը մեկ պլատֆորմում։' },
    ],
    faq: [
      { q: 'Ինչպես ստեղծել ռեստորանի թվային մենյու?', a: 'menus.am-ում գրանցվեք, ընտրեք թեմա, լցրեք մենյուն և ստացեք QR կոդ՝ ձեր ռեստորանի համար։' },
      { q: 'Կարո՞ղ եմ ավելացնել լուսանկարներ։', a: 'Այո, ամեն ապրանք կարող է ունենալ բարձրորակ լուսանկար՝ ախորժալի ներկայացման համար։' },
      { q: 'Քանի՞ լեզու է աջակցվում։', a: 'Մինչև 3 լեզու՝ հայերեն, ռուսերեն և անգլերեն, ավտոմատ փոխարկումով։' },
      { q: 'Կարո՞ղ եմ մի քանի մասնաճյուղ կառավարել։', a: 'Այո, Business փաթեթը թույլ է տալիս կառավարել բազմաթիվ օգտատերեր և մասնաճյուղեր։' },
    ],
    i18n: {
      ru: {
        h1: 'Restaurant Menu — цифровое меню вашего ресторана',
        intro:
          'Современное меню ресторана — цифровое: QR-код на столе, красивые фото, многоязычная подача и мгновенные обновления. menus.am даёт вам всё для создания профессионального меню ресторана.',
        sections: [
          { h2: 'Как построить меню ресторана', body: 'Организуйте меню разделами и категориями — блюда, напитки, десерты, чтобы гость легко нашёл нужное. Добавьте чёткие описания, цены и качественные фото.' },
          { h2: 'Menu engineering — как увеличить продажи', body: 'Выделяйте высокомаржинальные товары, используйте аппетитные фото и правильные описания. Отметка хитов и правильная расстановка повышают средний чек.' },
          { h2: 'Многоязычное меню ресторана', body: 'Показывайте меню на армянском, русском и английском. Для туристов многоязычное меню увеличивает заказы и улучшает впечатление.' },
          { h2: 'Почему цифровое меню для ресторана', body: 'Экономьте на печати, обновляйте цены мгновенно, отмечайте проданные блюда и держите меню всегда актуальным без перепечатки.' },
          { h2: 'Restaurant Digital Menu Guide', body: 'Выберите премиум-тему, постройте меню, добавьте фото, получите QR-код и делитесь ссылкой. menus.am объединяет управление меню и QR-код на одной платформе.' },
        ],
        faq: [
          { q: 'Как создать цифровое меню ресторана?', a: 'На menus.am зарегистрируйтесь, выберите тему, заполните меню и получите QR-код для вашего ресторана.' },
          { q: 'Могу ли я добавлять фото?', a: 'Да, каждый товар может иметь качественное фото для аппетитной подачи.' },
          { q: 'Сколько языков поддерживается?', a: 'До 3 языков — армянский, русский и английский, с автоматическим переключением.' },
          { q: 'Могу ли я управлять несколькими филиалами?', a: 'Да, тариф Business позволяет управлять несколькими пользователями и филиалами.' },
        ],
      },
      en: {
        h1: 'Restaurant Menu — your restaurant’s digital menu',
        intro:
          'A modern restaurant menu is digital: a QR code on the table, beautiful photos, multilingual presentation and instant updates. menus.am gives you everything to create a professional restaurant menu.',
        sections: [
          { h2: 'How to build a restaurant menu', body: 'Organize the menu into sections and categories — dishes, drinks, desserts — so guests easily find what they want. Add clear descriptions, prices and high-quality photos.' },
          { h2: 'Menu engineering — how to increase sales', body: 'Highlight high-margin items, use appetizing photos and the right descriptions. Marking best-sellers and the right layout raise the average check.' },
          { h2: 'Multilingual restaurant menu', body: 'Show your menu in Armenian, Russian and English. For tourists, a multilingual menu increases orders and improves the experience.' },
          { h2: 'Why a digital menu for a restaurant', body: 'Save on printing, update prices instantly, mark sold-out dishes and keep the menu always up to date without reprinting.' },
          { h2: 'Restaurant Digital Menu Guide', body: 'Choose a premium theme, build the menu, add photos, get a QR code and share a link. menus.am combines menu management and the QR code on one platform.' },
        ],
        faq: [
          { q: 'How do I create a restaurant digital menu?', a: 'On menus.am sign up, choose a theme, fill in the menu and get a QR code for your restaurant.' },
          { q: 'Can I add photos?', a: 'Yes, each product can have a high-quality photo for an appetizing presentation.' },
          { q: 'How many languages are supported?', a: 'Up to 3 languages — Armenian, Russian and English, with automatic switching.' },
          { q: 'Can I manage multiple locations?', a: 'Yes, the Business plan lets you manage multiple users and locations.' },
        ],
      },
    },
  },
  'smart-menu': {
    slug: 'smart-menu',
    keyword: 'Smart Menu',
    title: 'Smart Menu — խելացի թվային մենյու AI-ով | menus.am',
    description:
      'Smart Menu՝ խելացի թվային մենյու AI թարգմանությամբ, AI նկարագրություններով, բազմալեզու աջակցությամբ և ակնթարթային կառավարմամբ՝ menus.am-ում։',
    h1: 'Smart Menu — խելացի թվային մենյու',
    intro:
      'Smart Menu-ն ավելին է, քան պարզ մենյուն․ AI թարգմանություն, AI նկարագրություններ, բազմալեզու ներկայացում և խելացի կառավարում մեկ վահանակից։ Այն օգնում է ձեզ խնայել ժամանակ և ստեղծել պրոֆեսիոնալ մենյու։',
    sections: [
      { h2: 'Ինչ է Smart Menu-ն', body: 'Smart Menu-ն թվային մենյու է, որն օգտագործում է ավտոմատացում և AI՝ մենյուն ավելի արագ ստեղծելու և կառավարելու համար։ Այն ինքնաբերաբար կարող է թարգմանել և գեներացնել նկարագրություններ։' },
      { h2: 'AI նկարագրություններ', body: 'Ստեղծեք ապրանքների ախորժալի նկարագրություններ AI-ի օգնությամբ՝ մեկ սեղմումով, խնայելով ժամանակ և ստանալով պրոֆեսիոնալ տեքստեր։' },
      { h2: 'AI թարգմանություն', body: 'Թարգմանեք ձեր ամբողջ մենյուն հայերեն, ռուսերեն և անգլերեն ավտոմատ՝ առանց ձեռքով թարգմանելու։ Ձեր օտարերկրյա հյուրերը միշտ կհասկանան մենյուն։' },
      { h2: 'Խելացի կառավարում', body: 'Հասանելիության վերահսկում, ակնթարթային թարմացումներ և վիճակագրություն՝ մեկ ադմին վահանակից։ Դուք վերահսկում եք ամեն ինչ իրական ժամանակում։' },
    ],
    faq: [
      { q: 'Ինչո՞վ է Smart Menu-ն տարբերվում սովորական մենյուից։', a: 'Smart Menu-ն ավելացնում է AI թարգմանություն, AI նկարագրություններ և խելացի կառավարում՝ խնայելով ձեր ժամանակը։' },
      { q: 'AI-ն ինքնաբերաբա՞ր է թարգմանում։', a: 'Այո, AI թարգմանությունը մեկ սեղմումով թարգմանում է ձեր մենյուն 3 լեզվով։' },
      { q: 'Կարո՞ղ եմ խմբագրել AI-ի ստեղծած տեքստը։', a: 'Այո, ցանկացած AI-ի ստեղծած նկարագրություն կամ թարգմանություն կարող եք խմբագրել ձեռքով։' },
    ],
    i18n: {
      ru: {
        h1: 'Smart Menu — умное цифровое меню',
        intro:
          'Smart Menu — это больше, чем просто меню: AI-перевод, AI-описания, многоязычная подача и умное управление из одной панели. Оно помогает вам экономить время и создавать профессиональное меню.',
        sections: [
          { h2: 'Что такое Smart Menu', body: 'Smart Menu — это цифровое меню, использующее автоматизацию и AI, чтобы создавать и управлять меню быстрее. Оно может автоматически переводить и генерировать описания.' },
          { h2: 'AI-описания', body: 'Создавайте аппетитные описания товаров с помощью AI в один клик, экономя время и получая профессиональные тексты.' },
          { h2: 'AI-перевод', body: 'Переводите всё меню на армянский, русский и английский автоматически, без ручного перевода. Ваши иностранные гости всегда поймут меню.' },
          { h2: 'Умное управление', body: 'Контроль наличия, мгновенные обновления и статистика из одной админ-панели. Вы контролируете всё в реальном времени.' },
        ],
        faq: [
          { q: 'Чем Smart Menu отличается от обычного меню?', a: 'Smart Menu добавляет AI-перевод, AI-описания и умное управление, экономя ваше время.' },
          { q: 'AI переводит автоматически?', a: 'Да, AI-перевод в один клик переводит ваше меню на 3 языка.' },
          { q: 'Могу ли я редактировать текст, созданный AI?', a: 'Да, любое созданное AI описание или перевод можно отредактировать вручную.' },
        ],
      },
      en: {
        h1: 'Smart Menu — a smart digital menu',
        intro:
          'A Smart Menu is more than a plain menu: AI translation, AI descriptions, multilingual presentation and smart management from one panel. It helps you save time and create a professional menu.',
        sections: [
          { h2: 'What is a Smart Menu', body: 'A Smart Menu is a digital menu that uses automation and AI to create and manage the menu faster. It can automatically translate and generate descriptions.' },
          { h2: 'AI descriptions', body: 'Create appetizing product descriptions with AI in one click, saving time and getting professional copy.' },
          { h2: 'AI translation', body: 'Translate your entire menu into Armenian, Russian and English automatically, with no manual translation. Your foreign guests will always understand the menu.' },
          { h2: 'Smart management', body: 'Availability control, instant updates and analytics from one admin panel. You control everything in real time.' },
        ],
        faq: [
          { q: 'How is a Smart Menu different from a regular menu?', a: 'A Smart Menu adds AI translation, AI descriptions and smart management, saving you time.' },
          { q: 'Does the AI translate automatically?', a: 'Yes, AI translation translates your menu into 3 languages in one click.' },
          { q: 'Can I edit the AI-generated text?', a: 'Yes, any AI-generated description or translation can be edited manually.' },
        ],
      },
    },
  },
  'qr-menu-armenia': {
    slug: 'qr-menu-armenia',
    keyword: 'QR Menu Armenia',
    title: 'QR Menu Armenia — QR մենյու Հայաստանում | menus.am',
    description:
      'QR Menu Հայաստանում՝ ռեստորանների, սրճարանների և բարերի համար։ Հայերեն, ռուսերեն, անգլերեն, դրամով գնագոյացում, տեղական աջակցություն՝ menus.am-ում։',
    h1: 'QR Menu Armenia — QR մենյու Հայաստանում',
    intro:
      'menus.am-ը հայկական հարթակ է QR Menu-ի համար՝ ստեղծված Հայաստանի ռեստորանների, սրճարանների և սննդի բիզնեսների կարիքներով, տեղական աջակցությամբ և դրամով գնագոյացմամբ։',
    sections: [
      { h2: 'QR Menu Հայաստանում', body: 'Հայաստանում QR Menu-ն արագ դառնում է ստանդարտ ռեստորանների, սրճարանների և բարերի համար՝ հատկապես զբոսաշրջության աճի ֆոնին։ menus.am-ը այս անցումը դարձնում է հեշտ և մատչելի։' },
      { h2: 'Տեղական հարթակ հայկական բիզնեսների համար', body: 'Հայերեն ինտերֆեյս, դրամով գնագոյացում, տեղական աջակցություն և հայկական խոհանոցին հարմար պրեմիում թեմաներ։ Ամեն ինչ՝ հարմարեցված տեղական շուկային։' },
      { h2: 'Բազմալեզու հյուրերի համար', body: 'Ցուցադրեք ձեր մենյուն հայերեն, ռուսերեն և անգլերեն՝ զբոսաշրջիկների և տեղացիների համար։ Երևանի ռեստորանների համար բազմալեզու մենյուն էական է։' },
      { h2: 'Ինչպես սկսել Հայաստանում', body: 'Գրանցվեք menus.am-ում, ընտրեք թեմա, ավելացրեք ձեր մենյուն և ստացեք QR կոդ։ Տեղական թիմը կաջակցի ձեզ ամեն քայլում։' },
    ],
    faq: [
      { q: 'QR Menu-ն հասանելի՞ է Հայաստանում։', a: 'Այո, menus.am-ը հայկական հարթակ է՝ տեղական աջակցությամբ և դրամով գնագոյացմամբ։' },
      { q: 'Ինչ արժե QR Menu-ն Հայաստանում։', a: 'menus.am-ում QR Menu-ն սկսվում է ամսական 4 900 ֏-ից՝ Starter փաթեթով։' },
      { q: 'Աջակցությունը հայերե՞ն է։', a: 'Այո, տեղական թիմը աջակցում է հայերենով՝ ամեն քայլում։' },
    ],
    i18n: {
      ru: {
        h1: 'QR Menu Armenia — QR-меню в Армении',
        intro:
          'menus.am — армянская платформа для QR Menu, созданная под нужды ресторанов, кафе и заведений питания Армении, с локальной поддержкой и ценообразованием в драмах.',
        sections: [
          { h2: 'QR Menu в Армении', body: 'В Армении QR Menu быстро становится стандартом для ресторанов, кафе и баров — особенно на фоне роста туризма. menus.am делает этот переход лёгким и доступным.' },
          { h2: 'Локальная платформа для армянского бизнеса', body: 'Интерфейс на армянском, ценообразование в драмах, локальная поддержка и премиум-темы под армянскую кухню. Всё адаптировано под местный рынок.' },
          { h2: 'Для многоязычных гостей', body: 'Показывайте меню на армянском, русском и английском — для туристов и местных. Для ресторанов Еревана многоязычное меню необходимо.' },
          { h2: 'Как начать в Армении', body: 'Зарегистрируйтесь на menus.am, выберите тему, добавьте меню и получите QR-код. Локальная команда поддержит вас на каждом шаге.' },
        ],
        faq: [
          { q: 'Доступно ли QR Menu в Армении?', a: 'Да, menus.am — армянская платформа с локальной поддержкой и ценообразованием в драмах.' },
          { q: 'Сколько стоит QR Menu в Армении?', a: 'На menus.am QR Menu начинается от 4 900 ֏ в месяц с тарифом Starter.' },
          { q: 'Поддержка на армянском?', a: 'Да, локальная команда оказывает поддержку на армянском — на каждом шаге.' },
        ],
      },
      en: {
        h1: 'QR Menu Armenia — QR menu in Armenia',
        intro:
          'menus.am is an Armenian platform for QR Menu, built for the needs of Armenia’s restaurants, cafés and food businesses, with local support and pricing in drams.',
        sections: [
          { h2: 'QR Menu in Armenia', body: 'In Armenia, QR Menu is quickly becoming the standard for restaurants, cafés and bars — especially amid growing tourism. menus.am makes this transition easy and affordable.' },
          { h2: 'A local platform for Armenian businesses', body: 'An Armenian interface, pricing in drams, local support and premium themes suited to Armenian cuisine. Everything adapted to the local market.' },
          { h2: 'For multilingual guests', body: 'Show your menu in Armenian, Russian and English — for tourists and locals. For Yerevan restaurants a multilingual menu is essential.' },
          { h2: 'How to start in Armenia', body: 'Sign up on menus.am, choose a theme, add your menu and get a QR code. The local team will support you every step of the way.' },
        ],
        faq: [
          { q: 'Is QR Menu available in Armenia?', a: 'Yes, menus.am is an Armenian platform with local support and pricing in drams.' },
          { q: 'How much does QR Menu cost in Armenia?', a: 'On menus.am QR Menu starts at 4,900 ֏/month with the Starter plan.' },
          { q: 'Is support in Armenian?', a: 'Yes, the local team provides support in Armenian — every step of the way.' },
        ],
      },
    },
  },
}

/** Return the page with visible fields swapped to the chosen language.
 *  `hy` (or missing translation) returns the base page unchanged, so SSR and
 *  <head>/JSON-LD keep the Armenian content for SEO. */
export const localizeSeoPage = (p: SeoPage, lang: SeoLang): SeoPage =>
  lang === 'hy' || !p.i18n?.[lang] ? p : { ...p, ...p.i18n[lang] }

export const seoPageSlugs = Object.keys(seoPages)
