# Բազա (Prisma schema)

Աղբյուր՝ `backend/prisma/schema.prisma`։ PostgreSQL (Supabase)։ Բոլոր id-ները
`uuid`։ Translatable տեքստերը պահվում են **առանձին translation աղյուսակներում**
(մեկ տող՝ ամեն լեզվի համար), ոչ թե JSON-ով։

## Enum-ներ

- `UserRole` — `SUPER_ADMIN | OWNER | MANAGER | EMPLOYEE`
- `SectionType` — `FOOD | DRINKS | ALCOHOL`
- `OrderDraftStatus` — `OPEN | SHOWN | CLOSED | EXPIRED`
- `DayOfWeek` — `MON … SUN`

## Model-ների խմբեր

### Platform (գլոբալ, tenant-ից անկախ)

| Model | Դեր |
|---|---|
| `Theme` | վիզուալ թեմա (`key`: aria/maison/atelier/heritage/noir), գլոբալ |
| `Plan` | բաժանորդագրության փաթեթ (`free`/`pro`/`business`, limits/գին) |
| `Language` | հարթակի լեզուներ (`hy`/`en`/`ru`), ռեստորանը միացնում է ենթաբազմություն |

### Tenant root

**`Restaurant`** — կենտրոնական tenant աղյուսակը։ Դաշտեր՝ `slug` (unique, URL),
`name`, `email`, `logoUrl`, `coverImageUrl`, `address`, `workingHoursText`,
`rating`, `currency` (default AMD), `timezone` (default Asia/Yerevan), `isActive`,
`deletedAt` (soft-delete), `themeId` (→ Theme), `defaultLanguageId`, `planId`։

Կապեր՝ ունի բազմաթիվ `Section`, `Category`, `Product`, `User`, `RestaurantLanguage`,
`RestaurantTranslation`, `RestaurantSettings`, `RestaurantWorkingHour`, `Domain`,
`Badge`, `OrderDraft`, analytics-ներ։

### Tenant-ի ենթա-model-ներ

| Model | Դեր |
|---|---|
| `RestaurantTranslation` | ռեստորանի tagline/նկարագրություն ըստ լեզվի |
| `RestaurantSettings` | լրացուցիչ կարգավորումներ (backend-ում մոդելավորված) |
| `RestaurantWorkingHour` | կառուցվածքային աշխատաժամեր ըստ `DayOfWeek` |
| `RestaurantLanguage` | ռեստորանի միացրած լեզուները (sortOrder, isDefault) |
| `Domain` | custom/subdomain mapping ռեստորանին |
| `User` | admin օգտատեր (`role: UserRole`, `restaurantId`, `passwordHash`) |
| `RefreshToken` | hash-արված refresh token-ներ (rotation, session) |

### Մենյուի կառուցվածք (հիերարխիա)

```
Section (FOOD/DRINKS/ALCOHOL) → Category → Product → ProductImage
                                              └→ ProductBadge → Badge
```

| Model | Դաշտեր (հիմնական) | Translation աղյուսակ |
|---|---|---|
| `Section` | `icon`, `sortOrder`, `isActive`, `type` | `SectionTranslation` (name) |
| `Category` | `sectionId`, `parentId`, `icon`, `imageUrl`, `sortOrder`, `isActive` | `CategoryTranslation` (name, description) |
| `Product` | `categoryId`, `price`, `oldPrice`, `isAvailable`, `isActive`, `isPopular`, `isNew`, `isRecommended`, `sortOrder` | `ProductTranslation` (name, description) |
| `ProductImage` | `url`, `storageKey`, `altText`, `isMain`, `sortOrder` | — |
| `Badge` | `key`, `restaurantId?` (null = գլոբալ badge) | `BadgeTranslation` |
| `ProductBadge` | join՝ Product ↔ Badge | — |

### Հաճախորդի կողմ

| Model | Դեր |
|---|---|
| `OrderDraft` + `OrderDraftItem` | պատվերի սևագիր (`OrderDraftStatus`) |
| `Favorite` | հաճախորդի ընտրյալ ապրանքներ |

### Analytics / audit

`AuditLog`, `MenuView`, `ProductView`, `QRCodeScan` — վիճակագրություն և գործողությունների պատմություն։

## Translation ձևանմուշ (կարևոր)

Ամեն translatable entity ունի `*Translation` զուգընկեր՝ `(entityId, languageId, ...text)`
կապով։ Այսինքն նոր լեզվի/տեքստի ավելացումը = նոր տող translation աղյուսակում, ոչ
schema փոփոխություն։ Frontend-ը սա ստանում է որպես `{ hy, en, ru }` object
(փոխակերպումը՝ backend service + `_api-map.ts`)։

## Soft-delete

Շատ model-ներ ունեն `deletedAt` — query-ները ֆիլտրում են `deletedAt: null`։
`Restaurant`-ը soft-delete է admin-ից, բայց SUPER_ADMIN-ի delete-ը hard cascade է։

## Migration-ներ / scripts

- Schema փոխելուց հետո՝ `npm run prisma:migrate` (dev) → migration ֆայլ
- `npm run prisma:generate` — Prisma client թարմացնել
- `raw-indexes.sql` — լրացուցիչ index-ներ (ձեռքով)
- Seed/demo/super-admin scripts՝ տես [BACKEND.md](./BACKEND.md)

> Schema-ն ամբողջությամբ կարդալու համար՝ `backend/prisma/schema.prisma`։
