import { defineStore } from 'pinia'
import {
  menu as seedMenu,
  levels as seedLevels,
  type MenuCategory,
  type MenuItem,
  type MenuLevel,
  type DrinkGroup,
  type LocalizedText,
  type BadgeKey,
} from '~/data/menu'

// Per-tenant persistence key (admin edits are scoped to one restaurant).
const keyFor = (restaurantId: string) => `qrmenu:menu:${restaurantId || 'default'}`

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export interface CategoryInput {
  level: string
  group?: DrinkGroup
  icon: string
  title: LocalizedText
  image?: string
  description?: LocalizedText
  active?: boolean
  sortOrder?: number
}

export interface ProductInput {
  name: LocalizedText
  description: LocalizedText
  price: number
  image: string
  badge?: BadgeKey
  badges?: string[]
  available?: boolean
  active?: boolean
  sortOrder?: number
}

export const useMenuStore = defineStore('menu', () => {
  const currentRestaurantId = ref('tun-lahmajo')
  const levels = ref<MenuLevel[]>(clone(seedLevels))
  const categories = ref<MenuCategory[]>(clone(seedMenu))
  // Baseline (server/mock) data for the current tenant — used by reset().
  const seedLevelsForTenant = ref<MenuLevel[]>(clone(seedLevels))
  const seedCategoriesForTenant = ref<MenuCategory[]>(clone(seedMenu))

  // ── persistence (scoped per restaurant) ──────────────────────
  const save = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(
        keyFor(currentRestaurantId.value),
        JSON.stringify({ levels: levels.value, categories: categories.value }),
      )
    } catch {
      /* quota / serialization errors are non-fatal for the demo */
    }
  }

  /**
   * Load a tenant's menu into the store. `payload` is the server/mock baseline;
   * any locally-saved admin edits for that restaurant override it.
   */
  const setTenant = (
    restaurantId: string,
    payload: { levels: MenuLevel[]; categories: MenuCategory[] },
  ) => {
    currentRestaurantId.value = restaurantId
    seedLevelsForTenant.value = clone(payload.levels)
    seedCategoriesForTenant.value = clone(payload.categories)
    levels.value = clone(payload.levels)
    categories.value = clone(payload.categories)
    if (import.meta.client) {
      const raw = localStorage.getItem(keyFor(restaurantId))
      if (raw) {
        try {
          const data = JSON.parse(raw)
          if (Array.isArray(data.levels)) levels.value = data.levels
          if (Array.isArray(data.categories)) categories.value = data.categories
        } catch {
          /* ignore corrupt state */
        }
      }
    }
  }

  const reset = () => {
    levels.value = clone(seedLevelsForTenant.value)
    categories.value = clone(seedCategoriesForTenant.value)
    save()
  }

  // ── getters ──────────────────────────────────────────────────
  const categoriesOf = (levelId: string, group?: DrinkGroup) =>
    categories.value.filter(
      (c) => c.level === levelId && (levelId !== 'drinks' || c.group === group),
    )

  const categoryById = (id: string) => categories.value.find((c) => c.id === id)

  // Find a product (and its category) anywhere in the menu — used by the order/cart.
  const findItem = (itemId: string) => {
    for (const c of categories.value) {
      const item = c.items.find((i) => i.id === itemId)
      if (item) return { item, category: c }
    }
    return undefined
  }

  // ── section (level) CRUD ─────────────────────────────────────
  const addLevel = (input: { icon: string; title: LocalizedText }) => {
    levels.value.push({ id: uid('lvl'), icon: input.icon, title: { ...input.title } })
    save()
  }
  const updateLevel = (id: string, patch: Partial<Omit<MenuLevel, 'id'>>) => {
    const lvl = levels.value.find((l) => l.id === id)
    if (lvl) Object.assign(lvl, patch)
    save()
  }
  const removeLevel = (id: string) => {
    levels.value = levels.value.filter((l) => l.id !== id)
    categories.value = categories.value.filter((c) => c.level !== id)
    save()
  }

  // ── category CRUD ────────────────────────────────────────────
  const addCategory = (input: CategoryInput) => {
    const category: MenuCategory = {
      id: uid('cat'),
      level: input.level as MenuCategory['level'],
      group: input.level === 'drinks' ? input.group : undefined,
      icon: input.icon,
      title: { ...input.title },
      items: [],
      image: input.image,
      description: input.description ? { ...input.description } : undefined,
      active: input.active ?? true,
      sortOrder: input.sortOrder,
    }
    categories.value.push(category)
    save()
    return category.id
  }
  const updateCategory = (id: string, input: CategoryInput) => {
    const cat = categoryById(id)
    if (!cat) return
    cat.level = input.level as MenuCategory['level']
    cat.group = input.level === 'drinks' ? input.group : undefined
    cat.icon = input.icon
    cat.title = { ...input.title }
    if (input.image !== undefined) cat.image = input.image
    if (input.description) cat.description = { ...input.description }
    if (input.active !== undefined) cat.active = input.active
    if (input.sortOrder !== undefined) cat.sortOrder = input.sortOrder
    save()
  }
  const removeCategory = (id: string) => {
    categories.value = categories.value.filter((c) => c.id !== id)
    save()
  }

  // ── product CRUD ─────────────────────────────────────────────
  const addProduct = (categoryId: string, input: ProductInput) => {
    const cat = categoryById(categoryId)
    if (!cat) return
    const item: MenuItem = {
      id: uid('item'),
      name: { ...input.name },
      description: { ...input.description },
      price: input.price,
      image: input.image,
      badge: input.badge,
      badges: input.badges ? [...input.badges] : undefined,
      available: input.available ?? true,
      active: input.active ?? true,
      sortOrder: input.sortOrder,
    }
    cat.items.push(item)
    save()
  }
  const updateProduct = (categoryId: string, itemId: string, input: ProductInput) => {
    const item = categoryById(categoryId)?.items.find((i) => i.id === itemId)
    if (!item) return
    item.name = { ...input.name }
    item.description = { ...input.description }
    item.price = input.price
    item.image = input.image
    item.badge = input.badge
    item.badges = input.badges ? [...input.badges] : undefined
    item.available = input.available ?? true
    if (input.active !== undefined) item.active = input.active
    if (input.sortOrder !== undefined) item.sortOrder = input.sortOrder
    save()
  }
  const removeProduct = (categoryId: string, itemId: string) => {
    const cat = categoryById(categoryId)
    if (cat) cat.items = cat.items.filter((i) => i.id !== itemId)
    save()
  }
  // Quick toggle for "in stock / sold out".
  const toggleAvailable = (categoryId: string, itemId: string) => {
    const item = categoryById(categoryId)?.items.find((i) => i.id === itemId)
    if (!item) return
    item.available = item.available === false ? true : false
    save()
  }

  return {
    levels,
    categories,
    categoriesOf,
    categoryById,
    findItem,
    addLevel,
    updateLevel,
    removeLevel,
    addCategory,
    updateCategory,
    removeCategory,
    addProduct,
    updateProduct,
    removeProduct,
    toggleAvailable,
    currentRestaurantId,
    setTenant,
    save,
    reset,
  }
})
