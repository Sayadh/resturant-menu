# AI ուղեցույց — «Ինչպես փոխել X»

Այս ֆայլը recipe-ների հավաքածու է AI-ի (և մշակողի) համար՝ որ ամեն փոփոխություն
արվի ճիշտ շերտում, ճիշտ ձևանմուշով։ Նախ կարդա [ARCHITECTURE.md](./ARCHITECTURE.md)։

## Ոսկե կանոններ

1. **`restaurantId` միշտ JWT-ից** admin endpoint-ներում (`@RestaurantId()`), երբեք body/params-ից։
2. **API կանչ միայն `services/`-ից** — page/store-ը չի կանչում `$fetch` ուղիղ։
3. **Backend↔frontend փոխակերպումը միայն `_api-map.ts`-ում**։
4. **Թեմաներ՝ registry-ով**, switch-ներ չգրես։
5. **Translatable դաշտ = 3 լեզու** (hy/ru/en) ամենուր։
6. **Envelope** — backend-ը վերադարձնում է `{ success, data }`, frontend-ը unwrap է անում ինքնաշխատ։
7. Փոփոխությունը թեստի՛ր **staging**-ում նախքան prod (տես DEPLOY-STAGING.md)։

---

## Recipe 1 — Ապրանքին նոր դաշտ ավելացնել (օր. `calories`)

1. **DB**՝ `backend/prisma/schema.prisma` → `Product` model-ում ավելացրու `calories Int?` → `npm run prisma:migrate`։
2. **Backend DTO**՝ `products/dto/create-product.dto.ts` + `update-product.dto.ts` → ավելացրու `calories` (class-validator)։
3. **Service**՝ `products/products.service.ts` → include/map դաշտը create/update-ում։
4. **Frontend տիպ**՝ `models/types.ts` → `Product`-ում ավելացրու `calories`։
5. **Mapper**՝ `services/_api-map.ts` → `mapProduct`-ում կարդա դաշտը, patch-ում ուղարկիր։
6. **UI**՝ `pages/admin.vue` (product modal) input + թեմաներում ցուցադրում ըստ ցանկության։

## Recipe 2 — Նոր admin endpoint ավելացնել

1. Backend՝ համապատասխան module-ի `*.controller.ts`-ում ավելացրու method
   (`@Get/@Post`), `@RestaurantId()`-ով tenant, `@Roles()` եթե պետք է։
2. Service-ում գրիր business logic + Prisma query (ֆիլտրիր `restaurantId`-ով)։
3. DTO ստեղծիր `dto/`-ում (class-validator)։
4. Frontend՝ `services/<x>Service.ts`-ում ավելացրու մեթոդ (`useApiClient().post(...)`)։
5. Barrel-ում (`services/index.ts`) export արա եթե նոր service է։
6. Փաստաթուղթ՝ ավելացրու [API.md](./API.md)-ում։

## Recipe 3 — Նոր հրապարակային endpoint (token չպետք)

Նույնը՝ բայց controller-ում դիր `@Public()`, tenant-ը՝ `slug`-ից (ոչ JWT), և դիր
`public/` module-ում։

## Recipe 4 — Նոր թեմա

Տես [THEMES.md](./THEMES.md) → «Ինչպես ավելացնել ՆՈՐ թեմա»։ Համառոտ՝ ֆայլ
`themes/<name>/`, գրանցում `registry.ts`, catalog `data/themeCatalog.ts`, union
`models/types.ts`։

## Recipe 5 — Landing-ի բլոկ փոխել/ավելացնել

Բոլոր landing բլոկները՝ `components/landing/`։ Հավաքվում են `pages/index.vue`-ում։
Նոր բլոկ՝ ստեղծիր `components/landing/LandingX.vue` → ավելացրու `index.vue`-ում
`<LandingX />`։ Scroll-reveal-ի համար փաթաթիր `<LandingReveal>`-ով։ CSS-ը scoped
պահիր բլոկի ներսում (landing-ը scoped է `.landing` root-ով)։

## Recipe 6 — Admin UI-ի նոր բաժին (tab)

1. `pages/admin.vue` → nav array-ում ավելացրու `{ id, key, icon }`։
2. Ավելացրու `<section v-else-if="active === '<id>'">` template բլոկ։
3. `key`-ի translation-ը՝ `composables/useAdminI18n.ts`-ում։
4. Տվյալ պետք լինելու դեպքում՝ store + service (ոչ localStorage — API-ով)։

## Recipe 7 — Նոր լեզու ավելացնել (օր. `ka` — վրացերեն)

Զգույշ՝ ազդում է ամբողջ app-ի վրա։ Կարճ պլան՝
1. Backend՝ `Language` աղյուսակում նոր տող (seed) + `LangCode` frontend union
   (`models/types.ts`)։
2. Translation աղյուսակները ավտոմատ ընդունում են նոր `languageId` (schema չի փոխվում)։
3. UI-ի լեզվի փոխարկիչ (`useLanguage`, `LanguageSwitcher`) ընդունում է նորը։
4. Admin-ում ամեն translatable input-ի համար ավելացրու նոր լեզվի դաշտ։

## Recipe 8 — Կարգավորումներ backend-ով (եթե պետք լինեն նորից)

Նախկին localStorage-ի settings-ը (SEO/currency/subdomain) հանված է (fake էր)։
Իրական դարձնելու համար՝ ավելացրու `RestaurantSettings`-ին դաշտեր (schema) +
`admin/restaurant/settings` PATCH-ը (արդեն կա) + admin UI + public-ում կիրառում
(օր. SEO title-ը `[slug].vue`-ի `useHead`-ում)։

---

## Ընդհանուր աշխատանքային հոսք (փոփոխություն անելիս)

```
1. Կարդա համապատասխան docs/ ֆայլը + տվյալ թղթապանակի CLAUDE.md
2. Փոխիր ճիշտ շերտում (կանոններին համապատասխան)
3. Local թեստ (npm run dev:back + dev:front)
4. Push → staging → թեստ staging.menus.am-ում
5. Merge → prod deploy (DEPLOY-VPS.md)
```

## Ֆայլերի արագ քարտեզ

| Ուզում ես փոխել… | Նայիր… |
|---|---|
| Endpoint / business logic | `backend/src/<module>/` |
| Բազայի կառուցվածք | `backend/prisma/schema.prisma` |
| API կանչ frontend-ից | `frontend/services/` |
| Global state | `frontend/stores/` |
| Էջ / routing | `frontend/pages/` |
| Հրապարակային մենյուի տեսք | `frontend/themes/` + `registry.ts` |
| Landing | `frontend/components/landing/` |
| Թարգմանություններ (admin UI) | `frontend/composables/useAdminI18n.ts` |
| Domain տիպեր | `frontend/models/types.ts` |
| Deploy | `DEPLOY-VPS.md` / `DEPLOY-STAGING.md` |
