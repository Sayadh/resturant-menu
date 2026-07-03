import { defineStore } from 'pinia'

const STORAGE_KEY = 'tunlahmajo-order-v1'

export interface OrderLine {
  id: string
  qty: number
}

export const useOrderStore = defineStore('order', () => {
  const lines = ref<OrderLine[]>([])
  const favorites = ref<string[]>([])

  const save = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lines: lines.value, favorites: favorites.value }),
      )
    } catch {
      /* non-fatal */
    }
  }

  const load = () => {
    if (!import.meta.client) return
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      if (Array.isArray(d.lines)) lines.value = d.lines
      if (Array.isArray(d.favorites)) favorites.value = d.favorites
    } catch {
      /* ignore */
    }
  }

  // ── order / cart ─────────────────────────────────────────────
  const qtyOf = (id: string) => lines.value.find((l) => l.id === id)?.qty ?? 0
  const add = (id: string) => {
    const line = lines.value.find((l) => l.id === id)
    if (line) line.qty++
    else lines.value.push({ id, qty: 1 })
    save()
  }
  const dec = (id: string) => {
    const line = lines.value.find((l) => l.id === id)
    if (!line) return
    line.qty--
    if (line.qty <= 0) lines.value = lines.value.filter((l) => l.id !== id)
    save()
  }
  const remove = (id: string) => {
    lines.value = lines.value.filter((l) => l.id !== id)
    save()
  }
  const clear = () => {
    lines.value = []
    save()
  }
  const count = computed(() => lines.value.reduce((s, l) => s + l.qty, 0))

  // ── favorites ────────────────────────────────────────────────
  const isFav = (id: string) => favorites.value.includes(id)
  const toggleFav = (id: string) => {
    favorites.value = isFav(id) ? favorites.value.filter((x) => x !== id) : [...favorites.value, id]
    save()
  }

  return {
    lines,
    favorites,
    load,
    save,
    qtyOf,
    add,
    dec,
    remove,
    clear,
    count,
    isFav,
    toggleFav,
  }
})
