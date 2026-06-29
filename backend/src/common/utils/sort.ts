export type SortDir = 'asc' | 'desc'

/** Parse "field:dir" into a Prisma orderBy object, whitelisting fields. */
export function parseSort(
  sort: string | undefined,
  allowed: string[],
  fallback: Record<string, SortDir>,
): Record<string, SortDir> {
  if (!sort) return fallback
  const [field, dir] = sort.split(':')
  if (!allowed.includes(field)) return fallback
  return { [field]: dir === 'desc' ? 'desc' : 'asc' }
}
