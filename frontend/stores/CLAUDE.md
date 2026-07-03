# frontend/stores/ — Pinia state

Global application state։ Store-երը կանչում են `services/`, ոչ ուղիղ API։

| Store | Պահում է | Հիմնական actions |
|---|---|---|
| `auth.ts` | accessToken, refreshToken, user, `isAuthenticated` | `login`, `logout`, `refresh`, `init`, `fetchMe` |
| `restaurant.ts` | ընթացիկ ռեստորան, թեմաների catalog | `load`, `setCurrent`, `saveRestaurant` |
| `menu.ts` | levels, categories, items (public + admin preview) | `setTenant`, local CRUD helpers (`uid` ունի ներսում) |
| `order.ts` | պատվերի զամբյուղ + favorites (հաճախորդ) | add/remove/clear |

## Կանոններ

- API պետք լինելիս՝ կանչիր `services/`-ի մեթոդ, ոչ `$fetch`։
- `restaurant.ts`-ը fully API-backed է (localStorage settings հանված է)։
- `auth.ts`-ի token-ները՝ session-ի հիմքը. `http.ts`-ը կարդում է `accessToken`-ը։
- Auto-imported են (`useAuthStore()` ուղիղ, առանց import)։

## Օրինակ

```ts
// restaurant.ts load()
const [r, list] = await Promise.all([
  restaurantService.getRestaurant(),  // tenant JWT-ից
  themeService.getThemes(),
])
```
