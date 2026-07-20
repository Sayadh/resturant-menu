// ─────────────────────────────────────────────────────────────────────────
// Landing i18n — hy / ru / en for the entire marketing site (nav, hero,
// features, how-it-works, demo, themes, pricing, about, faq, cta, footer,
// contact modal). Professional translations.
//
// SEO note: the page is SSR-rendered in Armenian by DEFAULT (Google indexes hy),
// and the switcher changes text CLIENT-SIDE only — so SEO keyword targeting is
// untouched. Keyword SEO pages (/qr-menu …) and <meta> are intentionally NOT
// driven by this and stay Armenian.
// ─────────────────────────────────────────────────────────────────────────
export type LandingLang = 'hy' | 'ru' | 'en'

interface Feature { icon: string; color: string; title: string; desc: string }
interface Step { icon: string; title: string; desc: string }
interface Faq { q: string; a: string }

interface Dict {
  nav: { features: string; demo: string; themes: string; pricing: string; blog: string; about: string; login: string; start: string }
  hero: { badge: string; titleA: string; titleB: string; subtitle: string; start: string; watchDemo: string; stats: { partners: string; products: string; uptime: string; support: string } }
  features: { title: string; highlight: string; subtitle: string; items: Feature[] }
  how: { titleA: string; highlight: string; subtitle: string; steps: Step[] }
  demo: { titleA: string; highlight: string; subtitle: string; bullets: string[]; openFull: string; scanHint: string; scanShort: string }
  themes: { titleA: string; highlight: string; titleC: string; subtitle: string; descs: string[] }
  about: { badge: string; company: string; suffix: string; lead: string; paragraphs: string[]; visionEyebrow: string; vision: string; values: { title: string; desc: string }[]; closing: string }
  faq: { titleA: string; highlight: string; subtitle: string; items: Faq[] }
  cta: { badge: string; titleA: string; highlight: string; subtitle: string; start: string }
  footer: { tagline: string; product: string; guides: string; company: string; contact: string; city: string; rights: string; madeIn: string; links: { features: string; themes: string; pricing: string; demo: string; about: string; faq: string; blog: string } }
  admin: { titleA: string; highlight: string; subtitle: string; features: string[]; stats: { products: string; categories: string; languages: string; themes: string }; recent: string; addProduct: string; cols: { name: string; category: string; price: string; actions: string }; dishes: { name: string; cat: string; price: string; inStock: boolean }[]; statusIn: string; statusOut: string }
  blog: { badge: string; title: string; subtitle: string; read: string; back: string; ctaTitle: string; ctaText: string; ctaBtn: string; related: string; locale: string }
  contact: { badge: string; title: string; subtitle: string; namePh: string; phonePh: string; messagePh: string; sending: string; send: string; or: string; call: string; successTitle: string; successText: string; close: string; invalidPhone: string; failed: string }
  pricing: {
    badge: string; titleA: string; highlight: string; subtitle: string
    periods: { monthly: string; quarterly: string; semi: string; yearly: string }
    periodsShort: { monthly: string; quarterly: string; semi: string; yearly: string }
    perMonth: string; save: string; from: string; custom: string; customShort: string; freeMonths: string; oneStarter: string; yearlyLabel: string; view: string
    starter: string; professional: string; business: string
    starterHint: string; proHint: string; bizHint: string; popular: string
    startBtn: string; choosePro: string; chooseBiz: string
    starterFeatures: string[]; proFeatures: string[]; bizFeatures: string[]
    compareTitle: string; compareCols: { feature: string }
    compare: { label: string; s: boolean | string; p: boolean | string; b: boolean | string }[]
    unlimited: string
  }
}

const dict: Record<LandingLang, Dict> = {
  hy: {
    nav: { features: 'Հնարավորություններ', demo: 'Դեմո', themes: 'Թեմաներ', pricing: 'Գնացուցակ', blog: 'Բլոգ', about: 'Մեր մասին', login: 'Մուտք', start: 'Սկսել հիմա' },
    hero: {
      badge: 'Ձեր թվային մենյուն, ակնթարթորեն',
      titleA: 'Ձեր մենյուն՝', titleB: 'թվային, գեղեցիկ և միշտ արդիական',
      subtitle: 'Ստեղծված ռեստորանների, սրճարանների, բարերի և սննդի ոլորտի բոլոր բիզնեսների համար։ Ստեղծեք ձեր թվային մենյուն վայրկյանների ընթացքում՝ գեղեցիկ և հեշտ կառավարվող, առանց ծրագրավորման։',
      start: 'Սկսել հիմա', watchDemo: 'Դիտել դեմո',
      stats: { partners: 'գործընկեր', products: 'ապրանք', uptime: 'Մշտական հասանելիություն', support: 'աջակցություն' },
    },
    features: {
      title: 'Մենք լուծում ենք ձեր', highlight: 'խնդիրները',
      subtitle: 'Թարմացրեք ձեր մենյուն վայրկյանների ընթացքում, կառավարեք ամեն ինչ մեկ տեղից և ստեղծեք ժամանակակից փորձառություն յուրաքանչյուր հաճախորդի համար։',
      items: [
        { icon: '🍽', color: 'from-rose-500 to-orange-500', title: 'Թվային մենյու րոպեների ընթացքում', desc: 'Ստեղծեք տպավորիչ մենյուներ վայրկյանների ընթացքում առանց ծրագրավորման։' },
        { icon: '🎨', color: 'from-amber-500 to-yellow-500', title: 'Թեմաներ և ձևավորում', desc: 'Ընտրեք ձեր բրենդին համապատասխան պրեմիում թեմա մեկ սեղմումով։' },
        { icon: '🌐', color: 'from-violet-500 to-purple-500', title: 'Բազմալեզու մենյուներ', desc: 'Ներկայացրեք ձեր մենյուն հայերեն, ռուսերեն և անգլերեն լեզուներով։' },
        { icon: '⚡', color: 'from-emerald-500 to-teal-500', title: 'Ակնթարթային թարմացումներ', desc: 'Փոփոխեք գներն ու ապրանքները իրական ժամանակում՝ ամենուր, միանգամից։' },
        { icon: '📱', color: 'from-indigo-500 to-blue-500', title: 'QR կոդ և հասանելիություն', desc: 'Ձեր հաճախորդները բացում են մենյուն ցանկացած սարքից մեկ սկանավորմամբ։' },
      ],
    },
    how: {
      titleA: 'Ինչպես է', highlight: 'աշխատում', subtitle: 'Հինգ պարզ քայլ ձեր թվային մենյուն գործարկելու համար։',
      steps: [
        { icon: '👤', title: 'Գրանցվում եք', desc: 'Մենք ստեղծում ենք Ձեր հաշիվը մի քանի վայրկյանում։' },
        { icon: '🎨', title: 'Ընտրում եք թեմա', desc: 'Ընտրեք Ձեր բրենդին համապատասխան դիզայնը։' },
        { icon: '📋', title: 'Ավելացնում եք մենյուն', desc: 'Ավելացրեք բաժիններ, կատեգորիաներ և ապրանքներ։' },
        { icon: '📱', title: 'Ստանում եք QR կոդ', desc: 'Ստացեք Ձեր անհատական QR կոդը տպելու համար։' },
        { icon: '⚡', title: 'Պատրաստ է', desc: 'Հաճախորդները տեսնում են ձեր մենյուն ակնթարթորեն։' },
      ],
    },
    demo: {
      titleA: 'Փորձեք մեր', highlight: 'դեմոն', subtitle: 'Փոխեք թեման ու լեզուն ուղիղ այստեղ, կամ սկանավորեք QR-ը՝ կենդանի մենյուն ձեր հեռախոսում բացելու համար։',
      bullets: ['Ընտրեք թեմա', 'Փորձեք լեզուն', 'Դիտեք իրական մենյու'], openFull: 'Բացել ամբողջական դեմոն ↗', scanHint: 'Սկանավորեք հեռախոսով', scanShort: 'Սկանավորեք',
    },
    themes: { titleA: 'Գեղեցիկ', highlight: 'թեմաներ', titleC: 'ձեր բրենդին համապատասխան', subtitle: 'Ընտրեք պատրաստի պրեմիում թեմաներ ձեր հաստատության ոճին համապատասխան։', descs: ['Ժամանակակից և պարզ', 'Էլեգանտ և մուգ', 'Ջերմ և բնական', 'Դասական և ավանդական'] },
    about: {
      badge: 'Մեր մասին', company: 'Rosami', suffix: 'ՍՊԸ',
      lead: 'Rosami ՍՊԸ-ն հայկական տեխնոլոգիական ընկերություն է, որը ստեղծում է ժամանակակից թվային լուծումներ բիզնեսների համար։',
      paragraphs: [
        'Մեր նպատակն է օգնել սննդի և հյուրընկալության ոլորտի բիզնեսներին անցնել ժամանակակից թվային լուծումների՝ պարզեցնելով կառավարման գործընթացները և բարելավելով հաճախորդների փորձառությունը։',
        'Menus.am-ը ժամանակակից SaaS հարթակ է, որը ստեղծվել է սննդի և հյուրընկալության ոլորտի բիզնեսներին օգնելու թվայնացնել իրենց աշխատանքը։ Մեր առաքելությունն է պարզեցնել ամենօրյա գործընթացները, խնայել ժամանակը և ապահովել արագ, գեղեցիկ ու պրոֆեսիոնալ թվային փորձառություն։',
      ],
      visionEyebrow: 'Սակայն սա միայն սկիզբն է',
      vision: 'Մեր տեսլականն է ստեղծել թվային լուծումների ամբողջական էկո համակարգ, որը կօգնի տարբեր ոլորտների բիզնեսներին աշխատել ավելի արդյունավետ, զարգանալ և մրցունակ մնալ թվային աշխարհում։',
      values: [
        { title: 'Որակ', desc: 'Ամեն արտադրանք կառուցում ենք բարձր ստանդարտներով։' },
        { title: 'Պարզություն', desc: 'Հեշտ, ինտուիտիվ լուծումներ առանց ավելորդ բարդության։' },
        { title: 'Նորարարություն', desc: 'Անընդհատ զարգանում ենք թվային աշխարհի հետ միասին։' },
      ],
      closing: 'Rosami ՍՊԸ-ում մենք հավատում ենք, որ յուրաքանչյուր գաղափար կարող է վերածվել հզոր թվային արտադրանքի, եթե այն կառուցվում է որակի, պարզության և նորարարության սկզբունքներով։',
    },
    faq: {
      titleA: 'Հաճախ տրվող', highlight: 'հարցեր', subtitle: 'Այն ամենն, ինչ պետք է իմանաք գնացուցակի և ծառայությունների մասին։',
      items: [
        { q: 'Կարո՞ղ եմ հետո բարձրացնել փաթեթը', a: 'Այո։ Ցանկացած պահի կարող եք անցնել ավելի բարձր փաթեթի՝ առանց տվյալների կորստի։ Ձեր մենյուն, թեմաներն ու կարգավորումները մնում են անփոփոխ։' },
        { q: 'Կարո՞ղ եմ չեղարկել ցանկացած պահի', a: 'Այո, բաժանորդագրությունը կարող եք չեղարկել ցանկացած պահի։ Ընթացիկ ժամանակահատվածի ավարտից հետո վճարումներ չեն գանձվի։' },
        { q: 'Կկորցնե՞մ իմ մենյուն', a: 'Ոչ։ Ձեր բոլոր տվյալները պահվում են ապահով և կրկնօրինակվում են։ Պլան փոխելիս կամ չեղարկելիս մենյուն մնում է անվնաս։' },
        { q: 'Կարո՞ղ եմ հետո փոխել թեման', a: 'Այո, ցանկացած պահի կարող եք փոխել թեման ադմին վահանակից՝ մեկ սեղմումով, առանց մենյուն վերստեղծելու։' },
        { q: 'Կարո՞ղ եմ միացնել իմ սեփական դոմեյնը', a: 'Այո, Business պլանը թույլ է տալիս միացնել Ձեր սեփական դոմեյնը (օր․՝ menu.yourrestaurant.am)։' },
        { q: 'Կարո՞ղ եմ ավելացնել լեզուներ', a: 'Professional և Business պլանները ներառում են մինչև 3 լեզու (հայերեն, ռուսերեն, անգլերեն)՝ ավտոմատ լեզվի փոխարկումով։' },
      ],
    },
    cta: { badge: 'Պարզ և թափանցիկ գնացուցակ՝ առանց թաքնված վճարների', titleA: 'Սկսեք այսօր, բարձրացրեք', highlight: 'ցանկացած պահի', subtitle: 'Ստեղծեք ձեր թվային մենյուն րոպեների ընթացքում։ Առանց պարտավորությունների ցանկացած պահ կարող եք փոխել կամ ընդլայնել ձեր պլանը։', start: 'Սկսել հիմա' },
    footer: {
      tagline: 'Ձեր թվային մենյուն՝ գեղեցիկ, արագ և միշտ արդիական։',
      product: 'Ապրանք', guides: 'Ուղեցույցներ', company: 'Ընկերություն', contact: 'Կապ', city: 'Երևան, Հայաստան',
      rights: 'Բոլոր իրավունքները պաշտպանված են։', madeIn: 'Ստեղծված է ❤ Հայաստանում',
      links: { features: 'Հնարավորություններ', themes: 'Թեմաներ', pricing: 'Գնացուցակ', demo: 'Դեմո', about: 'Մեր մասին', faq: 'Հաճախ տրվող հարցեր', blog: 'Բլոգ' },
    },
    admin: {
      titleA: 'Հզոր', highlight: 'ադմին վահանակ',
      subtitle: 'Կառավարեք ամեն ինչ մեկ վայրից՝ պարզ, արագ և ինտուիտիվ ինտերֆեյսով։',
      features: ['Ամբողջական վահանակ', 'Ապրանքների կառավարում', 'Թեմաների ընտրություն', 'QR կոդի կառավարում', 'Բազմալեզու աջակցություն', 'Հասանելիության վերահսկում'],
      stats: { products: 'Ապրանք', categories: 'Կատեգորիա', languages: 'Լեզու', themes: 'Թեմա' },
      recent: 'Վերջին ապրանքները', addProduct: '+ Ապրանք',
      cols: { name: 'Անուն', category: 'Կատեգորիա', price: 'Գին', actions: 'Կարգ.' },
      dishes: [
        { name: 'Խորոված', cat: 'Ուտեստներ', price: '3 800', inStock: true },
        { name: 'Լիմոնադ', cat: 'Ըմպելիքներ', price: '1 200', inStock: true },
        { name: 'Տոլմա', cat: 'Ուտեստներ', price: '2 900', inStock: false },
      ],
      statusIn: 'Առկա է', statusOut: 'Առկա չէ',
    },
    blog: {
      badge: 'Բլոգ', title: 'QR Menu և թվային մենյու',
      subtitle: 'Ուղեցույցներ, խորհուրդներ և հոդվածներ QR Menu-ի, Online Menu-ի և ռեստորանի թվային մենյուի մասին։',
      read: 'Կարդալ →', back: '← Բլոգ',
      ctaTitle: 'Ստեղծեք ձեր QR Menu-ն այսօր', ctaText: 'Թվային մենյու, 3 լեզու, AI թարգմանություն և հեշտ կառավարում՝ menus.am-ում։', ctaBtn: 'Դիտել փաթեթները',
      related: 'Կարդացեք նաև', locale: 'hy-AM',
    },
    contact: {
      badge: 'Սկսենք հիմա', title: 'Թողեք ձեր հայտը', subtitle: 'Ուղարկեք ձեր հեռախոսահամարը՝ մենք կկապվենք ձեզ հետ, կամ զանգահարեք մեզ ուղիղ։',
      namePh: 'Ձեր անունը (ըստ ցանկության)', phonePh: 'Հեռախոսահամար *', messagePh: 'Հաղորդագրություն (ըստ ցանկության)',
      sending: 'Ուղարկվում է…', send: 'Ուղարկել հայտը', or: 'կամ', call: 'Զանգահարել՝',
      successTitle: 'Շնորհակալություն!', successText: 'Ձեր հայտը ստացվեց։ Մենք կկապվենք ձեզ հետ շատ շուտով։', close: 'Փակել',
      invalidPhone: 'Խնդրում ենք մուտքագրել վավեր հեռախոսահամար', failed: 'Չհաջողվեց ուղարկել, խնդրում ենք զանգահարել',
    },
    pricing: {
      badge: 'Պարզ և թափանցիկ գնացուցակ', titleA: 'Ընտրեք Ձեր', highlight: 'կատարյալ փաթեթը', subtitle: 'Սկսեք Ձեր կարիքներին համապատասխան փաթեթով և բարձրացրեք ցանկացած պահի առանց տվյալների կորստի։',
      periods: { monthly: 'Ամսական', quarterly: 'Եռամսյակ', semi: 'Կիսամյակ', yearly: 'Տարեկան' },
      periodsShort: { monthly: '/ամիս', quarterly: '/3 ամիս', semi: '/6 ամիս', yearly: '/տարի' },
      perMonth: '֏/ամիս', save: 'Խնայեք', from: 'Սկսած', custom: 'Անհատական՝ ըստ ձեր կարիքների', customShort: 'անհատական', freeMonths: '≈ 2 ամիս անվճար', oneStarter: 'Առաջին 30 հաստատության համար', yearlyLabel: 'տարեկան', view: 'Դիտել գները',
      starter: 'Starter', professional: 'Professional', business: 'Business',
      starterHint: 'Սկսնակ բիզնեսների համար', proHint: 'Զարգացող բիզնեսների համար', bizHint: 'Մեծ բիզնեսների և ցանցերի համար', popular: 'Ամենապահանջված',
      startBtn: 'Սկսել', choosePro: 'Ընտրել Professional', chooseBiz: 'Ընտրել Business',
      starterFeatures: ['⚙️ Անձնական կառավարման վահանակ', '📋 Մինչև 250 ապրանք', '🗂️ Մինչև 10 կատեգորիա', '🌍 2 լեզու', '🎨 1 դիզայն', '📷 Մինչև 250 լուսանկար', '🛠️ Տեխնիկական աջակցություն'],
      proFeatures: ['✨ AI նկարագրություններ', '🌍 AI թարգմանություն', '⚙️ Անձնական կառավարման վահանակ', '📋 Անսահմանափակ ապրանքներ', '🗂️ Անսահմանափակ կատեգորիաներ', '🌍 3 լեզու', '🎨 Բոլոր դիզայնները', '🔳 Գունավոր QR դիզայն՝ լոգոյով', '📷 Անսահմանափակ լուսանկարներ', '👁️ Առկա է / Առկա չէ կարգավիճակ', '⚡ Մենյուի ակնթարթային թարմացում', '🛠️ Տեխնիկական աջակցություն'],
      bizFeatures: ['✅ Ներառում է Professional փաթեթի բոլոր հնարավորությունները', '🌐 Ձեր սեփական դոմենը', '👥 Բազմաթիվ օգտատերեր', '📊 Ընդլայնված վիճակագրություն', '🎨 Անհատական դիզայն', '🍽️ Սեղանից պատվեր և մատուցողի կանչ', '🚀 Առաջնահերթ աջակցություն'],
      compareTitle: 'Փաթեթների համեմատություն', compareCols: { feature: 'Հնարավորություն' },
      compare: [
        { label: 'QR մենյու և հոսթինգ', s: true, p: true, b: true },
        { label: '✨ AI նկարագրություններ', s: false, p: 'Անսահ.', b: 'Անսահ.' },
        { label: '🌍 AI թարգմանություն', s: false, p: 'Անսահ.', b: 'Անսահ.' },
        { label: 'Ապրանքներ', s: '250', p: 'Անսահ.', b: 'Անսահ.' },
        { label: 'Կատեգորիաներ', s: '10', p: 'Անսահ.', b: 'Անսահ.' },
        { label: 'Լեզուներ', s: '2', p: '3', b: '3+' },
        { label: 'Ադմին վահանակ', s: true, p: true, b: true },
        { label: 'Թեմաներ', s: '1', p: 'Բոլորը', b: 'Բոլորը' },
        { label: 'Ավտոմատ թարմացումներ', s: false, p: true, b: true },
        { label: 'Օնլայն վճարում և պատվեր', s: false, p: false, b: true },
        { label: 'Սեփական դոմեյն', s: false, p: false, b: true },
        { label: 'Բազմաթիվ օգտատերեր', s: false, p: false, b: true },
        { label: 'Վիճակագրություն', s: false, p: false, b: true },
        { label: 'Առաջնահերթ աջակցություն', s: true, p: true, b: true },
      ],
      unlimited: 'Անսահ.',
    },
  },

  ru: {
    nav: { features: 'Возможности', demo: 'Демо', themes: 'Темы', pricing: 'Тарифы', blog: 'Блог', about: 'О нас', login: 'Вход', start: 'Начать' },
    hero: {
      badge: 'Ваше цифровое меню, мгновенно',
      titleA: 'Ваше меню —', titleB: 'цифровое, красивое и всегда актуальное',
      subtitle: 'Создано для ресторанов, кафе, баров и всех бизнесов сферы питания. Создайте цифровое меню за секунды — красивое и простое в управлении, без программирования.',
      start: 'Начать', watchDemo: 'Смотреть демо',
      stats: { partners: 'партнёров', products: 'товаров', uptime: 'Всегда доступно', support: 'поддержка' },
    },
    features: {
      title: 'Мы решаем ваши', highlight: 'задачи',
      subtitle: 'Обновляйте меню за секунды, управляйте всем из одного места и создавайте современный опыт для каждого гостя.',
      items: [
        { icon: '🍽', color: 'from-rose-500 to-orange-500', title: 'Цифровое меню за минуты', desc: 'Создавайте впечатляющие меню за секунды — без программирования.' },
        { icon: '🎨', color: 'from-amber-500 to-yellow-500', title: 'Темы и оформление', desc: 'Выберите премиум-тему под ваш бренд в один клик.' },
        { icon: '🌐', color: 'from-violet-500 to-purple-500', title: 'Многоязычные меню', desc: 'Показывайте меню на армянском, русском и английском.' },
        { icon: '⚡', color: 'from-emerald-500 to-teal-500', title: 'Мгновенные обновления', desc: 'Меняйте цены и товары в реальном времени — везде и сразу.' },
        { icon: '📱', color: 'from-indigo-500 to-blue-500', title: 'QR-код и доступность', desc: 'Гости открывают меню с любого устройства одним сканированием.' },
      ],
    },
    how: {
      titleA: 'Как это', highlight: 'работает', subtitle: 'Пять простых шагов, чтобы запустить ваше цифровое меню.',
      steps: [
        { icon: '👤', title: 'Регистрация', desc: 'Мы создаём ваш аккаунт за несколько секунд.' },
        { icon: '🎨', title: 'Выбор темы', desc: 'Выберите дизайн под ваш бренд.' },
        { icon: '📋', title: 'Добавление меню', desc: 'Добавьте разделы, категории и товары.' },
        { icon: '📱', title: 'Получение QR-кода', desc: 'Получите ваш персональный QR-код для печати.' },
        { icon: '⚡', title: 'Готово', desc: 'Гости видят ваше меню мгновенно.' },
      ],
    },
    demo: {
      titleA: 'Попробуйте наше', highlight: 'демо', subtitle: 'Переключайте тему и язык прямо здесь или отсканируйте QR, чтобы открыть живое меню на телефоне.',
      bullets: ['Выберите тему', 'Попробуйте язык', 'Смотрите реальное меню'], openFull: 'Открыть полное демо ↗', scanHint: 'Отсканируйте телефоном', scanShort: 'Сканируйте',
    },
    themes: { titleA: 'Красивые', highlight: 'темы', titleC: 'под ваш бренд', subtitle: 'Выбирайте готовые премиум-темы под стиль вашего заведения.', descs: ['Современная и простая', 'Элегантная и тёмная', 'Тёплая и природная', 'Классическая и традиционная'] },
    about: {
      badge: 'О нас', company: 'Rosami', suffix: 'ООО',
      lead: 'Rosami ООО — армянская технологическая компания, создающая современные цифровые решения для бизнеса.',
      paragraphs: [
        'Наша цель — помочь бизнесам сферы питания и гостеприимства перейти на современные цифровые решения, упрощая процессы управления и улучшая клиентский опыт.',
        'Menus.am — современная SaaS-платформа, созданная, чтобы помочь бизнесам сферы питания оцифровать работу. Наша миссия — упростить ежедневные процессы, сэкономить время и обеспечить быстрый, красивый и профессиональный цифровой опыт.',
      ],
      visionEyebrow: 'Но это только начало',
      vision: 'Наше видение — создать целую экосистему цифровых решений, которая поможет бизнесам разных сфер работать эффективнее, расти и оставаться конкурентоспособными в цифровом мире.',
      values: [
        { title: 'Качество', desc: 'Каждый продукт создаём по высоким стандартам.' },
        { title: 'Простота', desc: 'Лёгкие, интуитивные решения — без лишней сложности.' },
        { title: 'Инновации', desc: 'Постоянно развиваемся вместе с цифровым миром.' },
      ],
      closing: 'В Rosami ООО мы верим, что каждая идея может превратиться в мощный цифровой продукт, если строить её на принципах качества, простоты и инноваций.',
    },
    faq: {
      titleA: 'Часто задаваемые', highlight: 'вопросы', subtitle: 'Всё, что нужно знать о тарифах и услугах.',
      items: [
        { q: 'Могу ли я позже повысить тариф?', a: 'Да. В любой момент можно перейти на более высокий тариф без потери данных. Ваше меню, темы и настройки остаются без изменений.' },
        { q: 'Могу ли я отменить в любой момент?', a: 'Да, подписку можно отменить в любой момент. После окончания текущего периода списаний не будет.' },
        { q: 'Потеряю ли я своё меню?', a: 'Нет. Все ваши данные хранятся надёжно и резервируются. При смене плана или отмене меню остаётся целым.' },
        { q: 'Могу ли я позже сменить тему?', a: 'Да, в любой момент можно сменить тему из админ-панели в один клик, не пересоздавая меню.' },
        { q: 'Могу ли я подключить свой домен?', a: 'Да, план Business позволяет подключить собственный домен (например, menu.yourrestaurant.am).' },
        { q: 'Могу ли я добавить языки?', a: 'Планы Professional и Business включают до 3 языков (армянский, русский, английский) с автопереключением.' },
      ],
    },
    cta: { badge: 'Простые и прозрачные тарифы — без скрытых платежей', titleA: 'Начните сегодня, повышайте', highlight: 'в любой момент', subtitle: 'Создайте цифровое меню за минуты. Без обязательств — вы можете сменить или расширить план в любое время.', start: 'Начать' },
    footer: {
      tagline: 'Ваше цифровое меню — красивое, быстрое и всегда актуальное.',
      product: 'Продукт', guides: 'Гайды', company: 'Компания', contact: 'Контакты', city: 'Ереван, Армения',
      rights: 'Все права защищены.', madeIn: 'Сделано с ❤ в Армении',
      links: { features: 'Возможности', themes: 'Темы', pricing: 'Тарифы', demo: 'Демо', about: 'О нас', faq: 'Частые вопросы', blog: 'Блог' },
    },
    admin: {
      titleA: 'Мощная', highlight: 'админ-панель',
      subtitle: 'Управляйте всем из одного места — простой, быстрый и интуитивный интерфейс.',
      features: ['Полная панель управления', 'Управление товарами', 'Выбор тем', 'Управление QR-кодом', 'Многоязычная поддержка', 'Контроль доступности'],
      stats: { products: 'Товар', categories: 'Категория', languages: 'Язык', themes: 'Тема' },
      recent: 'Последние товары', addProduct: '+ Товар',
      cols: { name: 'Название', category: 'Категория', price: 'Цена', actions: 'Действ.' },
      dishes: [
        { name: 'Хоровац', cat: 'Блюда', price: '3 800', inStock: true },
        { name: 'Лимонад', cat: 'Напитки', price: '1 200', inStock: true },
        { name: 'Толма', cat: 'Блюда', price: '2 900', inStock: false },
      ],
      statusIn: 'В наличии', statusOut: 'Нет в наличии',
    },
    blog: {
      badge: 'Блог', title: 'QR Menu и цифровое меню',
      subtitle: 'Руководства, советы и статьи о QR Menu, онлайн-меню и цифровом меню ресторана.',
      read: 'Читать →', back: '← Блог',
      ctaTitle: 'Создайте своё QR Menu сегодня', ctaText: 'Цифровое меню, 3 языка, AI-перевод и простое управление — на menus.am.', ctaBtn: 'Смотреть тарифы',
      related: 'Читайте также', locale: 'ru-RU',
    },
    contact: {
      badge: 'Начнём', title: 'Оставьте заявку', subtitle: 'Отправьте свой номер — мы свяжемся с вами, или позвоните нам напрямую.',
      namePh: 'Ваше имя (по желанию)', phonePh: 'Номер телефона *', messagePh: 'Сообщение (по желанию)',
      sending: 'Отправка…', send: 'Отправить заявку', or: 'или', call: 'Позвонить:',
      successTitle: 'Спасибо!', successText: 'Ваша заявка получена. Мы скоро свяжемся с вами.', close: 'Закрыть',
      invalidPhone: 'Пожалуйста, введите корректный номер телефона', failed: 'Не удалось отправить, пожалуйста, позвоните',
    },
    pricing: {
      badge: 'Простые и прозрачные тарифы', titleA: 'Выберите свой', highlight: 'идеальный тариф', subtitle: 'Начните с тарифа под ваши задачи и повышайте в любой момент без потери данных.',
      periods: { monthly: 'Ежемесячно', quarterly: 'Квартал', semi: 'Полгода', yearly: 'Год' },
      periodsShort: { monthly: '/мес', quarterly: '/3 мес', semi: '/6 мес', yearly: '/год' },
      perMonth: '֏/мес', save: 'Экономия', from: 'От', custom: 'Индивидуально под ваши задачи', customShort: 'индивидуально', freeMonths: '≈ 2 месяца бесплатно', oneStarter: 'Для первых 30 заведений', yearlyLabel: 'в год', view: 'Смотреть цены',
      starter: 'Starter', professional: 'Professional', business: 'Business',
      starterHint: 'Для начинающих бизнесов', proHint: 'Для растущих бизнесов', bizHint: 'Для крупных бизнесов и сетей', popular: 'Популярный',
      startBtn: 'Начать', choosePro: 'Выбрать Professional', chooseBiz: 'Выбрать Business',
      starterFeatures: ['⚙️ Личная панель управления', '📋 До 250 товаров', '🗂️ До 10 категорий', '🌍 2 языка', '🎨 1 дизайн', '📷 До 250 фото', '🛠️ Техническая поддержка'],
      proFeatures: ['✨ AI-описания', '🌍 AI-перевод', '⚙️ Личная панель управления', '📋 Неограниченно товаров', '🗂️ Неограниченно категорий', '🌍 3 языка', '🎨 Все дизайны', '🔳 Цветной дизайн QR с логотипом', '📷 Неограниченно фото', '👁️ Статус «В наличии / Нет в наличии»', '⚡ Мгновенное обновление меню', '🛠️ Техническая поддержка'],
      bizFeatures: ['✅ Включает все возможности Professional', '🌐 Ваш собственный домен', '👥 Несколько пользователей', '📊 Расширенная статистика', '🎨 Индивидуальный дизайн', '🍽️ Заказ со столика и вызов официанта', '🚀 Приоритетная поддержка'],
      compareTitle: 'Сравнение тарифов', compareCols: { feature: 'Возможность' },
      compare: [
        { label: 'QR-меню и хостинг', s: true, p: true, b: true },
        { label: '✨ AI-описания', s: false, p: 'Безлим.', b: 'Безлим.' },
        { label: '🌍 AI-перевод', s: false, p: 'Безлим.', b: 'Безлим.' },
        { label: 'Товары', s: '250', p: 'Безлим.', b: 'Безлим.' },
        { label: 'Категории', s: '10', p: 'Безлим.', b: 'Безлим.' },
        { label: 'Языки', s: '2', p: '3', b: '3+' },
        { label: 'Админ-панель', s: true, p: true, b: true },
        { label: 'Темы', s: '1', p: 'Все', b: 'Все' },
        { label: 'Автообновления', s: false, p: true, b: true },
        { label: 'Онлайн-оплата и заказ', s: false, p: false, b: true },
        { label: 'Свой домен', s: false, p: false, b: true },
        { label: 'Несколько пользователей', s: false, p: false, b: true },
        { label: 'Статистика', s: false, p: false, b: true },
        { label: 'Приоритетная поддержка', s: true, p: true, b: true },
      ],
      unlimited: 'Безлим.',
    },
  },

  en: {
    nav: { features: 'Features', demo: 'Demo', themes: 'Themes', pricing: 'Pricing', blog: 'Blog', about: 'About', login: 'Log in', start: 'Get started' },
    hero: {
      badge: 'Your digital menu, instantly',
      titleA: 'Your menu —', titleB: 'digital, beautiful and always up to date',
      subtitle: 'Built for restaurants, cafés, bars and every food & hospitality business. Create your digital menu in seconds — beautiful and easy to manage, no coding.',
      start: 'Get started', watchDemo: 'Watch demo',
      stats: { partners: 'partners', products: 'products', uptime: 'Always available', support: 'support' },
    },
    features: {
      title: 'We solve your', highlight: 'problems',
      subtitle: 'Update your menu in seconds, manage everything from one place and create a modern experience for every guest.',
      items: [
        { icon: '🍽', color: 'from-rose-500 to-orange-500', title: 'Digital menu in minutes', desc: 'Create stunning menus in seconds — no coding required.' },
        { icon: '🎨', color: 'from-amber-500 to-yellow-500', title: 'Themes & design', desc: 'Pick a premium theme that matches your brand in one click.' },
        { icon: '🌐', color: 'from-violet-500 to-purple-500', title: 'Multilingual menus', desc: 'Show your menu in Armenian, Russian and English.' },
        { icon: '⚡', color: 'from-emerald-500 to-teal-500', title: 'Instant updates', desc: 'Change prices and items in real time — everywhere, at once.' },
        { icon: '📱', color: 'from-indigo-500 to-blue-500', title: 'QR code & access', desc: 'Guests open the menu from any device with a single scan.' },
      ],
    },
    how: {
      titleA: 'How it', highlight: 'works', subtitle: 'Five simple steps to launch your digital menu.',
      steps: [
        { icon: '👤', title: 'Sign up', desc: 'We create your account in a few seconds.' },
        { icon: '🎨', title: 'Choose a theme', desc: 'Pick the design that fits your brand.' },
        { icon: '📋', title: 'Add your menu', desc: 'Add sections, categories and products.' },
        { icon: '📱', title: 'Get your QR code', desc: 'Get your personal QR code, ready to print.' },
        { icon: '⚡', title: 'Done', desc: 'Guests see your menu instantly.' },
      ],
    },
    demo: {
      titleA: 'Try our', highlight: 'demo', subtitle: 'Switch the theme and language right here, or scan the QR to open the live menu on your phone.',
      bullets: ['Choose a theme', 'Try the language', 'See a real menu'], openFull: 'Open the full demo ↗', scanHint: 'Scan with your phone', scanShort: 'Scan',
    },
    themes: { titleA: 'Beautiful', highlight: 'themes', titleC: 'that match your brand', subtitle: 'Choose ready-made premium themes that match your venue’s style.', descs: ['Modern and clean', 'Elegant and dark', 'Warm and natural', 'Classic and traditional'] },
    about: {
      badge: 'About us', company: 'Rosami', suffix: 'LLC',
      lead: 'Rosami LLC is an Armenian technology company building modern digital solutions for businesses.',
      paragraphs: [
        'Our goal is to help food & hospitality businesses move to modern digital solutions — simplifying management and improving the customer experience.',
        'Menus.am is a modern SaaS platform built to help food & hospitality businesses digitize their work. Our mission is to simplify everyday processes, save time and deliver a fast, beautiful and professional digital experience.',
      ],
      visionEyebrow: 'But this is only the beginning',
      vision: 'Our vision is to build a complete ecosystem of digital solutions that helps businesses across industries work more efficiently, grow and stay competitive in the digital world.',
      values: [
        { title: 'Quality', desc: 'We build every product to high standards.' },
        { title: 'Simplicity', desc: 'Easy, intuitive solutions — without needless complexity.' },
        { title: 'Innovation', desc: 'We keep evolving together with the digital world.' },
      ],
      closing: 'At Rosami LLC we believe any idea can become a powerful digital product when built on quality, simplicity and innovation.',
    },
    faq: {
      titleA: 'Frequently asked', highlight: 'questions', subtitle: 'Everything you need to know about pricing and services.',
      items: [
        { q: 'Can I upgrade later?', a: 'Yes. You can move to a higher plan any time without losing data. Your menu, themes and settings stay unchanged.' },
        { q: 'Can I cancel any time?', a: 'Yes, you can cancel the subscription at any time. No charges after the current period ends.' },
        { q: 'Will I lose my menu?', a: 'No. All your data is stored securely and backed up. Your menu stays intact when changing plans or cancelling.' },
        { q: 'Can I change the theme later?', a: 'Yes, you can switch themes from the admin panel any time in one click, without rebuilding the menu.' },
        { q: 'Can I connect my own domain?', a: 'Yes, the Business plan lets you connect your own domain (e.g. menu.yourrestaurant.am).' },
        { q: 'Can I add languages?', a: 'Professional and Business plans include up to 3 languages (Armenian, Russian, English) with automatic switching.' },
      ],
    },
    cta: { badge: 'Simple, transparent pricing — no hidden fees', titleA: 'Start today, upgrade', highlight: 'any time', subtitle: 'Create your digital menu in minutes. No commitment — change or expand your plan any time.', start: 'Get started' },
    footer: {
      tagline: 'Your digital menu — beautiful, fast and always up to date.',
      product: 'Product', guides: 'Guides', company: 'Company', contact: 'Contact', city: 'Yerevan, Armenia',
      rights: 'All rights reserved.', madeIn: 'Made with ❤ in Armenia',
      links: { features: 'Features', themes: 'Themes', pricing: 'Pricing', demo: 'Demo', about: 'About', faq: 'FAQ', blog: 'Blog' },
    },
    admin: {
      titleA: 'Powerful', highlight: 'admin panel',
      subtitle: 'Manage everything from one place — a simple, fast and intuitive interface.',
      features: ['Full dashboard', 'Product management', 'Theme selection', 'QR code management', 'Multilingual support', 'Availability control'],
      stats: { products: 'Products', categories: 'Categories', languages: 'Languages', themes: 'Themes' },
      recent: 'Recent products', addProduct: '+ Product',
      cols: { name: 'Name', category: 'Category', price: 'Price', actions: 'Act.' },
      dishes: [
        { name: 'Grilled meat', cat: 'Dishes', price: '3 800', inStock: true },
        { name: 'Lemonade', cat: 'Drinks', price: '1 200', inStock: true },
        { name: 'Tolma', cat: 'Dishes', price: '2 900', inStock: false },
      ],
      statusIn: 'In stock', statusOut: 'Out of stock',
    },
    blog: {
      badge: 'Blog', title: 'QR Menu & digital menu',
      subtitle: 'Guides, tips and articles about QR Menu, online menus and restaurant digital menus.',
      read: 'Read →', back: '← Blog',
      ctaTitle: 'Create your QR Menu today', ctaText: 'Digital menu, 3 languages, AI translation and easy management — on menus.am.', ctaBtn: 'View plans',
      related: 'Read also', locale: 'en-US',
    },
    contact: {
      badge: 'Let’s start', title: 'Leave a request', subtitle: 'Send your phone number — we’ll get in touch, or call us directly.',
      namePh: 'Your name (optional)', phonePh: 'Phone number *', messagePh: 'Message (optional)',
      sending: 'Sending…', send: 'Send request', or: 'or', call: 'Call:',
      successTitle: 'Thank you!', successText: 'Your request was received. We’ll get in touch very soon.', close: 'Close',
      invalidPhone: 'Please enter a valid phone number', failed: 'Could not send, please call us',
    },
    pricing: {
      badge: 'Simple, transparent pricing', titleA: 'Choose your', highlight: 'perfect plan', subtitle: 'Start with the plan that fits your needs and upgrade any time without losing data.',
      periods: { monthly: 'Monthly', quarterly: 'Quarterly', semi: 'Semi-annual', yearly: 'Yearly' },
      periodsShort: { monthly: '/mo', quarterly: '/3 mo', semi: '/6 mo', yearly: '/yr' },
      perMonth: '֏/mo', save: 'Save', from: 'From', custom: 'Custom, tailored to your needs', customShort: 'custom', freeMonths: '≈ 2 months free', oneStarter: 'For the first 30 venues', yearlyLabel: 'per year', view: 'View prices',
      starter: 'Starter', professional: 'Professional', business: 'Business',
      starterHint: 'For starting businesses', proHint: 'For growing businesses', bizHint: 'For large businesses and chains', popular: 'Most popular',
      startBtn: 'Start', choosePro: 'Choose Professional', chooseBiz: 'Choose Business',
      starterFeatures: ['⚙️ Personal management panel', '📋 Up to 250 products', '🗂️ Up to 10 categories', '🌍 2 languages', '🎨 1 design', '📷 Up to 250 photos', '🛠️ Technical support'],
      proFeatures: ['✨ AI descriptions', '🌍 AI translation', '⚙️ Personal management panel', '📋 Unlimited products', '🗂️ Unlimited categories', '🌍 3 languages', '🎨 All designs', '🔳 Colorful QR design with logo', '📷 Unlimited photos', '👁️ In stock / Out of stock status', '⚡ Instant menu updates', '🛠️ Technical support'],
      bizFeatures: ['✅ Everything in Professional', '🌐 Your own domain', '👥 Multiple users', '📊 Advanced analytics', '🎨 Custom design', '🍽️ Table ordering & waiter call', '🚀 Priority support'],
      compareTitle: 'Compare plans', compareCols: { feature: 'Feature' },
      compare: [
        { label: 'QR menu & hosting', s: true, p: true, b: true },
        { label: '✨ AI descriptions', s: false, p: 'Unltd', b: 'Unltd' },
        { label: '🌍 AI translation', s: false, p: 'Unltd', b: 'Unltd' },
        { label: 'Products', s: '250', p: 'Unltd', b: 'Unltd' },
        { label: 'Categories', s: '10', p: 'Unltd', b: 'Unltd' },
        { label: 'Languages', s: '2', p: '3', b: '3+' },
        { label: 'Admin panel', s: true, p: true, b: true },
        { label: 'Themes', s: '1', p: 'All', b: 'All' },
        { label: 'Automatic updates', s: false, p: true, b: true },
        { label: 'Online payment & ordering', s: false, p: false, b: true },
        { label: 'Custom domain', s: false, p: false, b: true },
        { label: 'Multiple users', s: false, p: false, b: true },
        { label: 'Analytics', s: false, p: false, b: true },
        { label: 'Priority support', s: true, p: true, b: true },
      ],
      unlimited: 'Unltd',
    },
  },
}

/**
 * Landing language, driven by the URL locale (hy at root, `/ru`, `/en`).
 * This makes every language a distinct, SSR-rendered, crawlable URL — real
 * multi-language SEO — while switching languages simply navigates to the
 * localized path (which also gives users shareable per-language links).
 */
export function useLandingI18n() {
  const langs: LandingLang[] = ['hy', 'ru', 'en']
  const { locale, basePath, toLocale } = useLocale()
  const lang = locale // Locale ('hy'|'ru'|'en') is identical to LandingLang
  const L = computed(() => dict[lang.value])
  const setLang = (l: LandingLang) => {
    if (l !== lang.value) navigateTo(toLocale(basePath.value, l))
  }
  return { lang, L, langs, setLang }
}
