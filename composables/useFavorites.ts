/**
 * Favorite (❤️) dishes, kept in shared client state.
 */
export const useFavorites = () => {
  const ids = useState<string[]>('favorites', () => [])

  const isFavorite = (id: string) => ids.value.includes(id)

  const toggle = (id: string) => {
    if (ids.value.includes(id)) ids.value = ids.value.filter((x) => x !== id)
    else ids.value = [...ids.value, id]
  }

  const count = computed(() => ids.value.length)

  return { ids, isFavorite, toggle, count }
}
