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

const STORAGE_KEY = 'tunlahmajo-menu-v1'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export interface CategoryInput {
  level: string
  group?: DrinkGroup
  icon: string
  title: LocalizedText
}

export interface ProductInput {
  name: LocalizedText
  description: LocalizedText
  price: number
  image: string
  badge?: BadgeKey
  available?: boolean
}

export const useMenuStore = defineStore('menu', () => {
  const levels = ref<MenuLevel[]>(clone(seedLevels))
  const categories = ref<MenuCategory[]>(clone(seedMenu))

  // ── persistence ──────────────────────────────────────────────
  const save = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ levels: levels.value, categories: categories.value }),
      )
    } catch {
      /* quota / serialization errors are non-fatal for the demo */
    }
  }

  const load = () => {
    if (!import.meta.client) return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (Array.isArray(data.levels)) levels.value = data.levels
      if (Array.isArray(data.categories)) categories.value = data.categories
    } catch {
      /* ignore corrupt state */
    }
  }

  const reset = () => {
    levels.value = clone(seedLevels)
    categories.value = clone(seedMenu)
    save()
  }

  // ── getters ──────────────────────────────────────────────────
  const categoriesOf = (levelId: string, group?: DrinkGroup) =>
    categories.value.filter(
      (c) => c.level === levelId && (levelId !== 'drinks' || c.group === group),
    )

  const categoryById = (id: string) => categories.value.find((c) => c.id === id)

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
      available: input.available ?? true,
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
    item.available = input.available ?? true
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
    load,
    save,
    reset,
  }
})
