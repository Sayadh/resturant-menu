# frontend/themes/ — հրապարակային թեմաներ

Ամբողջական՝ [`../../docs/THEMES.md`](../../docs/THEMES.md) (նոր թեմա ավելացնելուց
առաջ կարդա այն — այնտեղ է ստուգաթերթը)։

## Հիմնականը

- `themeId → component` կապը՝ **միայն** `registry.ts`-ում (switch չկա app-ում)։
- Բոլոր թեմաները **lazy** են՝ `defineAsyncComponent(() => import(...))`։ Ստատիկ
  import-ը վեց թեմայի կոդն էլ սոսնձում է ընդհանուր փաթեթին — մի՛ արա։
- `ThemeRenderer.vue` (components/-ում) կապում է data → store → theme component։
- Theme component-ները **state չեն ստանում props-ով** և **fetch չեն անում** —
  կարդում են shared store-երից (`useMenuStore`, `useRestaurantStore`,
  `useLanguage`, `useOrderStore`, `useBrand`)։

## Կառուցվածք

```
themes/
├── registry.ts              # themeId → component + themeFontsHref (միակ միացումը)
├── atelier/ maison/ noir/ opaline/   # լրիվ թեմա (layouts + components + styles + config)
└── (aria, heritage)         # պարզ՝ components/DesignAria.vue, DesignHeritage.vue
```

`opaline`-ը միակ թեման է, որ մենյուն ցույց է տալիս մակարդակներով
(գլխավոր → բաժին → կատեգորիա)։ Մակարդակը պահվում է **նույն** `/<slug>` route-ի
query-ում (`?s=<sectionId>&c=<categoryId>`) — նոր route չկա։

## Երեք կանոն, որոնք ամենից հաճախ են խախտվում

1. **Նկարներ**․ ամեն `<img>` → `imgUrl(src, width)` (`~/utils/image`), բացահայտ
   import-ով, `loading="lazy" decoding="async"` (բացի լոգոյից/hero-ից)։
   Չափերի աղյուսակը՝ THEMES.md-ում։
2. **Պիտակներ**․ `visibleBadges(item)` `~/data/badges`-ից — երբեք սեփական ցուցակ։
3. **Ֆոնտեր**․ կա՛մ ընդհանուր `font-serif`/`font-display`-ը, կա՛մ սեփականը
   (`themeFontsHref` → `null`) — ոչ երկուսը միասին։
