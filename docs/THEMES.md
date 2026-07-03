# Թեմաների համակարգ

Ամեն ռեստորան ունի `themeId` (aria/atelier/maison/heritage/noir)։ Հրապարակային
մենյուն render-վում է այդ թեմայի root component-ով։ **Ոչ մի switch statement** չկա
app-ում — ամեն ինչ անցնում է մեկ registry-ով։

## Registry (`frontend/themes/registry.ts`)

```ts
export const themeRegistry: Record<string, Component> = {
  aria:     DesignAria,               // components/DesignAria.vue
  atelier:  AtelierMenu,              // themes/atelier/layouts/AtelierMenu.vue
  maison:   MaisonExperience,         // themes/maison/layouts/MaisonExperience.vue
  heritage: DesignHeritage,           // components/DesignHeritage.vue
  // noir: դեռ չկա → fallback
}
export const FALLBACK_THEME = DesignAria
export const getThemeComponent = (themeId) => themeRegistry[themeId] ?? FALLBACK_THEME
```

## ThemeRenderer (`components/ThemeRenderer.vue`)

Միակ տեղն է, որ **data → presentation** կապում է՝

```
ThemeRenderer(props: restaurant, levels, categories)
  → rs.setCurrent(restaurant)        // Pinia restaurant store
  → menu.setTenant(id, { levels, categories })  // Pinia menu store
  → <component :is="getThemeComponent(restaurant.themeId)" />
```

Թեմա-component-ները **state չեն ստանում props-ով** — կարդում են shared store-երից
(`useMenuStore`, `useRestaurantStore`, `useLanguage`, `useOrder`)։ Այսպես ոչ մի
theme-specific logic դուրս չի հոսում։

## Թեմայի կառուցվածք (օր. `themes/atelier/`)

```
themes/atelier/
├── layouts/AtelierMenu.vue      # root (registry-ում սա է)
├── components/                  # Atelier*-component-ներ (Header, Hero, MenuRow …)
├── styles/atelier.css          # scoped styles
├── config.ts                   # թեմայի config (գույներ/տառատեսակ)
└── animations.ts               # motion helpers
```

`aria` և `heritage`-ը ավելի պարզ են — մեկ ֆայլ (`components/DesignAria.vue`,
`DesignHeritage.vue`)։ `data/themeCatalog.ts`-ի `THEMES`-ը admin Design-ի catalog-ն է
(անուն, նկարագրություն, accent գույն, `available`)։

## Թեմայի ընտրություն (persistence)

Admin Design tab → «Select» → `restaurantService.setTheme()` →
`PATCH /admin/restaurant/theme { themeKey }` → պահվում է **բազայում**
(`Restaurant.themeId`)։ Հրապարակային էջը հաջորդ բեռնմանը կարդում է այդ themeId-ն։

## Preview override (`?theme=`)

`pages/[slug].vue`-ն ընդունում է `?theme=atelier` query → render-only override
(բազան չի փոխվում)։ Օգտագործվում է landing-ի demo բլոկում՝ թեմաներ ցույց տալու։
Թույլատրված արժեքներ՝ `aria|atelier|maison|heritage`։

---

## Ինչպես ավելացնել ՆՈՐ թեմա (recipe)

1. Ստեղծիր `themes/<name>/layouts/<Name>.vue` (root) + components/styles ըստ ցանկության։
   Կարդա տվյալը shared store-երից (նայիր `AtelierMenu.vue`-ին որպես օրինակ)։
2. Գրանցիր `themes/registry.ts`-ում՝ `<name>: <NameComponent>`։
3. Ավելացրու `THEMES` catalog-ում (`data/themeCatalog.ts`)՝ `{ id, name, description, bestFor, accent, available: true }`։
4. Ավելացրու `ThemeId` union-ում (`models/types.ts`)։
5. (Ընտրովի) backend `Theme` աղյուսակում ավելացրու `key`-ը (seed), որ SUPER_ADMIN-ը կարողանա նշանակել։
6. Թեստ՝ `menus.am/<slug>?theme=<name>`։

Ուրիշ ոչ մի ֆայլ փոխելու կարիք չկա — registry-ն է միակ միացման կետը։
