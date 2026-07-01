// Barrel for the service layer. Import everything from `~/services`.
// Swap any of these modules for real `$fetch` API calls later — callers stay
// unchanged because the method signatures are the contract.
export { restaurantService } from './restaurantService'
export { themeService } from './themeService'
export { menuService, type MenuPayload } from './menuService'
export { sectionService, type SectionDraft } from './sectionService'
export { categoryService, type CategoryDraft } from './categoryService'
export { productService, type ProductDraft } from './productService'
export { uploadService } from './uploadService'
