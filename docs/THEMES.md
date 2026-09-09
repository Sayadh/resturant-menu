# Թեմաների համակարգ

Ամեն ռեստորան ունի `themeId` (`aria` · `atelier` · `maison` · `heritage` · `noir` ·
`opaline`)։ Հրապարակային մենյուն render-վում է այդ թեմայի root component-ով։
**Ոչ մի switch statement** չկա app-ում — ամեն ինչ անցնում է մեկ registry-ով։

## Registry (`frontend/themes/registry.ts`)

```ts
export const themeRegistry: Record<string, Component> = {
  aria:     defineAsyncComponent(() => import('~/components/DesignAria.vue')),
  atelier:  defineAsyncComponent(() => import('~/themes/atelier/layouts/AtelierMenu.vue')),
  maison:   defineAsyncComponent(() => import('~/themes/maison/layouts/MaisonExperience.vue')),
  heritage: defineAsyncComponent(() => import('~/components/DesignHeritage.vue')),
  noir:     defineAsyncComponent(() => import('~/themes/noir/layouts/NoirMenu.vue')),
  opaline:  defineAsyncComponent(() => import('~/themes/opaline/layouts/OpalineMenu.vue')),
}
```

⚠️ **Ստատիկ `import` մի՛ գրիր։** Բոլոր թեմաները lazy են՝ որ հյուրը ներբեռնի **միայն
իր ռեստորանի թեման**։ Մեկ ստատիկ import-ը վեց թեմայի կոդն էլ սոսնձում է ընդհանուր
փաթեթին և զրոյացնում code splitting-ը։

Նույն ֆայլում է նաև `themeFontsHref(themeId)` — տես [Ֆոնտեր](#ֆոնտեր)։

## ThemeRenderer (`components/ThemeRenderer.vue`)

Միակ տեղն է, որ **data → presentation** կապում է՝

```
ThemeRenderer(props: restaurant, levels, categories)
  → rs.setCurrent(restaurant)                    // Pinia restaurant store
  → menu.setTenant(id, { levels, categories })   // Pinia menu store
  → <component :is="getThemeComponent(restaurant.themeId)" />
```

Թեմա-component-ները **state չեն ստանում props-ով** — կարդում են shared store-երից
(`useMenuStore`, `useRestaurantStore`, `useLanguage`, `useOrderStore`, `useBrand`)։

> ⚠️ Հետևանք, որի վրա արդեն մեկ անգամ սայթաքել ենք․ **էջի fetch-ը երբեք չպետք է
> կախված լինի restaurant store-ից**։ Store-ը լցնում է հենց այս render-ը, ուստի
> `useAsyncData`-ի `watch`-ում `useLanguage().lang`-ը դնելը փակում է օղակ՝ fetch →
> store → lang → fetch։ Լեզուն վերցրու հում `useState<Lang>('lang')`-ից։

## Թեմայի կառուցվածք (օր. `themes/atelier/`)

```
themes/atelier/
├── layouts/AtelierMenu.vue   # root (registry-ում սա է)
├── components/               # Atelier*-component-ներ (Header, Hero, MenuRow …)
├── styles/atelier.css        # scoped styles
├── config.ts                 # թեմայի տեքստեր/կարգավորումներ
└── animations.ts             # motion helpers
```

`aria` և `heritage`-ը ավելի պարզ են — մեկ ֆայլ (`components/DesignAria.vue`,
`DesignHeritage.vue`)։

---

# Պարտադիր կանոններ

Սրանք ոչ թե խորհուրդներ են — ամեն մեկը գրված է կոնկրետ խնդրից հետո, որը
production-ում արդեն երևացել է։

## Ֆոնտեր

Tailwind-ի `font-serif` = Cormorant Garamond, `font-display` = Cinzel
(`tailwind.config.ts`)։ Այդ ընտանիքները բեռնվում են **միայն** այն թեմաների համար,
որոնք իրոք օգտագործում են դրանք — որոշում է `themeFontsHref()`-ը registry-ում։

Երկու ճանապարհ նոր թեմայի համար՝

| Ընտրություն | Ինչ անել |
|---|---|
| Օգտագործում ես `font-serif`/`font-display` | Ոչինչ — ընդհանուր stylesheet-ը գալիս է ինքնաբերաբար |
| Ունես սեփական տառատեսակներ (ինչպես Opaline) | `themeFontsHref`-ում վերադարձրու `null` և բեռնիր քոնը թեմայի `useHead`-ում |

Երկուսը միասին **մի՛ արա** — հյուրը կստանա երկու հավաքածու։ Opaline-ը այս ուղղումից
առաջ ներբեռնում էր 3 ավելորդ ընտանիք, որոնցից Cormorant-ը՝ 10 տարբերակով։

Նոր քաշ (`font-black` և նմանները) օգտագործելուց առաջ ստուգիր, որ այն կա
`nuxt.config.ts`-ի Google Fonts URL-ում — հակառակ դեպքում բրաուզերը կնմանակի այն։

## Նկարներ

**Ամեն `<img>` անցնում է `imgUrl()`-ով** (`~/utils/image`)․

```vue
<script setup lang="ts">
import { imgUrl } from '~/utils/image'
</script>

<img :src="imgUrl(item.image, 600)" loading="lazy" decoding="async" ... />
```

Վերբեռնման պահին ոչինչ չի չափափոխվում — ռեստորանը կարող է հեռախոսից 5 MB
լուսանկար դնել։ `imgUrl`-ը Supabase-ի render endpoint-ով խնդրում է ցուցադրման
չափը, ուստի առաստաղը դրվում է **ցուցադրման կետում**, որտեղ պետք եղած լայնությունը
հայտնի է։

Լայնությունը = CSS արկղի չափը × 2–3 (retina)․

| Ինչ | px |
|---|---|
| Լոգո, զամբյուղի փոքր պատկեր, կատեգորիայի իկոն | 256 |
| Ուտեստի / բաժնի քարտ ցանցում | 600 |
| Մոբայլ բաններ | 1080 |
| Լայն բաններ, ուտեստի մոդալ | 1200 |
| Hero, lightbox | 1600 |

`loading="lazy" decoding="async"` — **բացի** վերևի հատվածի նկարներից (լոգո, hero)։
Դրանք eager են, այլապես ուշ են հայտնվում և էջը ցնցվում է։

Բացահայտ `import { imgUrl }` գրիր — auto-import-ի վրա մի՛ հենվիր, երբ util-ը
օգտագործվում է **միայն** template-ում։

## Պիտակներ

Կատալոգը մեկ տեղում է՝ `~/data/badges` (21 պիտակ, 4 խումբ, hy/ru/en)։ Թեմայում՝

```ts
import { visibleBadges } from '~/data/badges'
const badges = computed(() => visibleBadges(props.item))       // քարտ՝ մինչև 2
const badges = computed(() => visibleBadges(props.item, 4))    // detail՝ մինչև 4
```

Իր ցուցակ, իր իկոններ կամ իր թարգմանություններ **մի՛ սահմանիր**։ Ցուցադրման
հերթականությունը կատալոգի հերթականությունն է։

Key-երը պետք է գոյություն ունենան `badges` աղյուսակում, այլապես ապրանք պահելիս
լուռ դեն են նետվում (`ProductsService.resolveBadgeIds`) — տես միգրացիա
`20260828130000_badge_catalogue`։

## Տվյալ և վիճակ

- Բաժինները, կատեգորիաները, ապրանքները՝ `useMenuStore`-ից, **միշտ `sortOrder`-ով**։
- `item.showImage === false` → ոչ մի նկար, ոչ էլ placeholder։
- `item.available === false` → sold-out նշան, ոչ թե թաքցնել։
- `brand.ordering === false` → զամբյուղ/պատվեր ընդհանրապես չցուցադրել (վճարովի փաթեթ)։
- Լեզուն՝ `useLanguage()`-ի `t()`-ով; switcher-ը՝ `langLabel(l)`-ով (տառեր կամ
  դրոշներ՝ ըստ tenant-ի `languageDisplay` կարգավորման)։
- Թեմայում **fetch չկա**։ Տվյալը գալիս է էջից → ThemeRenderer → store։

## Ինչ ՉԱՆԵԼ

- ❌ Nuxt-ի experimental դրոշներ (`experimental.asyncContext` և նմանները) — SSR-ը
  կոտրել է production-ի նման build-ում։ Եթե անհրաժեշտ թվա, նախ առանձին ճյուղում փորձարկիր։
- ❌ `useAsyncData`-ի handler-ի ներսում composable կանչել **`await`-ից հետո** — SSR-ում
  Nuxt instance-ը կորչում է։ Բոլոր composable-ները կանչիր առաջին `await`-ից առաջ։
- ❌ `localStorage`/`window` թեմայի setup-ում առանց `import.meta.client` պաշտպանության։

---

## Ինչպես ավելացնել ՆՈՐ թեմա

1. **Root component**․ `themes/<name>/layouts/<Name>.vue` — կարդա store-երից
   (օրինակ՝ `AtelierMenu.vue`, կամ `OpalineMenu.vue` մակարդակներով նավիգացիայի համար)։
2. **Registry**․ `themes/registry.ts` → `<name>: defineAsyncComponent(() => import(...))`։
3. **Ֆոնտեր**․ եթե սեփականն ես բեռնում, `themeFontsHref`-ում ավելացրու `null`-ի ճյուղը։
4. **Catalog**․ `data/themeCatalog.ts` → `THEMES`-ում `{ id, name, description, bestFor, accent, available: true }`։
5. **Տիպ**․ `models/types.ts` → `ThemeId` union։
6. **Preview**․ `pages/[slug].vue` և `pages/demo.vue` → `VALID_THEMES` զանգված։
7. **Landing**․ `components/landing/LandingThemes.vue` → `THEME_CARDS` +
   `useLandingI18n.ts` → `themes.descs` (hy/ru/en — TypeScript-ը կպահանջի բոլորը)։
8. **Backend**․ `themes` աղյուսակում `key` տողը — dev-ի համար `prisma/seed.ts`,
   production-ի համար **միգրացիա** (`INSERT ... ON CONFLICT DO NOTHING`), քանի որ
   seed-ը prod-ում չի գործարկվում։

## Ստուգաթերթ՝ merge-ից առաջ

- [ ] Բոլոր 6 թեման բացվում են՝ `/<slug>?theme=<name>`
- [ ] **Refresh** (ոչ միայն HMR) — SSR-ը չի կոտրվում
- [ ] Լեզվի փոխարկում AM→RU→EN — loader չի ցատկում, բովանդակությունը թարգմանվում է
- [ ] Առանց նկարի ուտեստ, sold-out ուտեստ, դատարկ կատեգորիա
- [ ] Պիտակները երևում են (մինչև 2 քարտին)
- [ ] DevTools → Network → Img՝ հասցեներում `?width=` կա
- [ ] DevTools → Network → Font՝ ավելորդ ընտանիք չկա
- [ ] `npm run build` անցնում է
