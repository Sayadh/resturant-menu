# Authentication & Authorization

## Token մոդել (JWT)

- **Access token** — կարճատև (`JWT_ACCESS_EXPIRES_IN`, default 15m)։ Կցվում է
  ամեն admin request-ի՝ `Authorization: Bearer <token>`։
- **Refresh token** — երկարատև (`JWT_REFRESH_EXPIRES_IN`, default 30d)։ Պահվում է
  բազայում **hash-արված** (`RefreshToken` model), rotation-ով։

JWT payload՝ `{ sub: userId, role: UserRole, restaurantId: string | null }`։

## Login flow

```
POST /admin/auth/login { email, password }
  → AuthService: user գտնել → bcrypt.compare(password, passwordHash)
  → սարքել access + refresh, refresh-ը hash-ած պահել բազայում
  → { accessToken, refreshToken, user }
```

Frontend (`stores/auth.ts`)՝ պահում է token-ները, `user`-ը, `isAuthenticated`։
`init()` վերականգնում է session-ը (refresh-ով), `login/logout` կառավարում են։

## Refresh flow (ավտոմատ)

`services/http.ts`-ը authenticated call-ի **401**-ի դեպքում՝ մեկ անգամ կանչում է
`/admin/auth/refresh`, թարմացնում token-ը, կրկնում սկզբնական request-ը։ Ձախողվելու
դեպքում՝ logout gate։

## Guards (գլոբալ, `app.module.ts`)

Կիրառվում են ամեն route-ի վրա հերթականությամբ՝

1. **`JwtAuthGuard`** — default-ով **ամեն route պաշտպանված է**։ Token վավեր չլինելիս՝
   401։ Բացառություն՝ `@Public()` decorator-ով նշված route-երը (login, public/*)։
2. **`RolesGuard`** — ստուգում է route-ի `@Roles(...)` / `@SuperAdmin()`
   պահանջները payload-ի `role`-ի դեմ։ Չբավարարելիս՝ 403։

## Decorator-ներ (`common/decorators/`)

| Decorator | Դեր |
|---|---|
| `@Public()` | route-ը բացել առանց token-ի |
| `@Roles(UserRole.OWNER, ...)` | թույլատրված role-եր |
| `@SuperAdmin()` | միայն SUPER_ADMIN |
| `@RestaurantId()` | JWT-ից `restaurantId` (**tenant բանալի**) |
| `@CurrentUser()` | ամբողջ payload-ը |

## Multi-tenant անվտանգություն (ամենակարևոր կանոնը)

> **`restaurantId`-ն ՄԻՇՏ վերցվում է JWT-ից (`@RestaurantId()`), երբեք body/params-ից։**

Դա երաշխավորում է որ ռեստորան A-ն չի կարող կարդալ/փոխել ռեստորան B-ի տվյալը՝
նույնիսկ եթե ձեռքով ուղարկի ուրիշ id։ Ամեն admin service մեթոդ առաջին արգումենտով
ստանում է `restaurantId` և Prisma query-ն ֆիլտրում է դրանով։

```ts
// ✅ ճիշտ
@Get() list(@RestaurantId() restaurantId: string) {
  return this.products.list(restaurantId)
}

// ❌ ՍԽԱԼ — երբեք
@Get() list(@Query('restaurantId') restaurantId: string) { ... }
```

## Role-եր (`UserRole`)

| Role | Ի՞նչ կարող է |
|---|---|
| `SUPER_ADMIN` | platform — ռեստորաններ ստեղծել/ջնջել (tenant չունի) |
| `OWNER` | իր ռեստորանի ամեն ինչ |
| `MANAGER` | մենյու/ապրանք կառավարում |
| `EMPLOYEE` | սահմանափակ (ըստ route-ի `@Roles`) |

## Seed-ից օգտատերեր

- SUPER_ADMIN՝ `npm run add:superadmin` (email/password script-ում)
- Demo owner՝ `create:demo`-ն սարքում է `owner@demo.test / password123`

## Անվտանգության նշումներ

- `passwordHash`-ը երբեք չի վերադարձվում API-ից (`sanitize()`)։
- Refresh token-ները hash-ած են պահվում (բազայի leak-ի դեպքում չեն օգտագործվի)։
- Telegram bot token-ը միայն backend `.env`-ում է (frontend չի տեսնում)։
- `.env`-երը gitignored են։
