import type { MenuItem } from '~/data/menu'

export interface OrderLine {
  item: MenuItem
  qty: number
}

/**
 * Simple in-memory order list (no online payment).
 * Guests build an order and show it to the waiter.
 */
export const useOrder = () => {
  const lines = useState<OrderLine[]>('order', () => [])

  const add = (item: MenuItem) => {
    const existing = lines.value.find((l) => l.item.id === item.id)
    if (existing) existing.qty += 1
    else lines.value.push({ item, qty: 1 })
  }

  const decrement = (id: string) => {
    const existing = lines.value.find((l) => l.item.id === id)
    if (!existing) return
    existing.qty -= 1
    if (existing.qty <= 0) lines.value = lines.value.filter((l) => l.item.id !== id)
  }

  const remove = (id: string) => {
    lines.value = lines.value.filter((l) => l.item.id !== id)
  }

  const clear = () => {
    lines.value = []
  }

  const qtyOf = (id: string) => lines.value.find((l) => l.item.id === id)?.qty ?? 0

  const count = computed(() => lines.value.reduce((sum, l) => sum + l.qty, 0))

  const total = computed(() =>
    lines.value.reduce((sum, l) => sum + l.item.price * l.qty, 0),
  )

  return { lines, add, decrement, remove, clear, qtyOf, count, total }
}
