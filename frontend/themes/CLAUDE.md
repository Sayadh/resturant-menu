# frontend/themes/ — հրապարակային թեմաներ

Ամբողջական՝ [`../../docs/THEMES.md`](../../docs/THEMES.md)։

## Հիմնականը

- `themeId → component` կապը՝ **միայն** `registry.ts`-ում (switch չկա app-ում)։
- `ThemeRenderer.vue` (components/-ում) կապում է data → store → theme component։
- Theme component-ները **state չեն ստանում props-ով** — կարդում են shared
  store-երից (`useMenuStore`, `useRestaurantStore`, `useLanguage`, `useOrder`)։

## Կառուցվածք

```
themes/
├── registry.ts              # themeId → component (միակ միացման կետ)
├── atelier/  maison/        # ամբողջական թեմա (layouts + components + styles + config)
└── (aria, heritage)         # պարզ՝ components/DesignAria.vue, DesignHeritage.vue
```

Ընթացիկ registry՝ `aria → DesignAria`, `atelier → AtelierMenu`,
`maison → MaisonExperience`, `heritage → DesignHeritage`, fallback → DesignAria։

## Նոր թեմա ավելացնել

1. `themes/<name>/layouts/<Name>.vue` (root) — կարդա store-երից (նայիր `AtelierMenu.vue`)։
2. Գրանցիր `registry.ts`-ում։
3. Ավելացրու `data/themeCatalog.ts` (THEMES) + `models/types.ts` (`ThemeId`)։
4. Թեստ՝ `menus.am/<slug>?theme=<name>`։

Ուրիշ ֆայլ չես փոխում — registry-ն է միակ միացումը։
