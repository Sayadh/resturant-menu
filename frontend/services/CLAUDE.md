# frontend/services/ — API շերտ

Միակ շերտն է, որ գիտի HTTP/backend-ի մասին։ Store/page/component-ը կանչում է
service-ի մեթոդ, ոչ երբեք ուղիղ `$fetch`։

## Ֆայլեր

| Ֆայլ | Դեր |
|---|---|
| `http.ts` | `useApiClient()` — envelope unwrap, Bearer token, 401→refresh→retry |
| `_api-map.ts` | **backend DTO ↔ frontend տիպ** mapper-ներ (`mapRestaurant`, `mapProduct`, `...PatchToDto`) |
| `index.ts` | barrel՝ `import { productService } from '~/services'` |
| `restaurantService.ts` | public restaurants/slug, admin restaurant, `setTheme` |
| `menuService.ts` | menu հավաքում (public + admin) |
| `sectionService.ts` `categoryService.ts` `productService.ts` | admin CRUD + reorder |
| `superAdminService.ts` | `/super-admin/restaurants` CRUD |
| `leadService.ts` | `POST /public/lead` |
| `uploadService.ts` | նկար → data URL, link → og:image |
| `themeService.ts` | թեմաների catalog (`~/data/themeCatalog`-ից) |

## Կանոններ

- Նոր endpoint → նոր մեթոդ համապատասխան service-ում + (նոր service-ի դեպքում) export `index.ts`-ում։
- Backend-ի ֆորմատը frontend-ի տիպի հետ չհամընկնելիս՝ ձևափոխումը գրիր **միայն** `_api-map.ts`-ում։
- Method-ը վերադարձնում է domain տիպ (`models/types.ts`), ոչ raw API ֆորմատ։
- `http.ts`-ը ինքը unwrap է անում envelope-ը — service-ում `.data`-ի հետ չաշխատես, ուղիղ արդյունքն է գալիս։

Օրինակ՝
```ts
async createProduct(draft: ProductDraft): Promise<Product> {
  const dto = productDraftToDto(draft)              // _api-map.ts
  const data = await useApiClient().post<ApiProduct>('/admin/products', dto)
  return mapProduct(data)                           // _api-map.ts
}
```
