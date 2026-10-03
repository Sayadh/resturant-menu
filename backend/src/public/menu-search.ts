// ─────────────────────────────────────────────────────────────────────────
// Menu search — the pure part (no Nest, no Prisma), so it can be unit tested
// with Node's runner (test/menu-search.test.ts).
//
// The database narrows the dishes down (every term must appear in a dish's
// name or description, in ANY of its languages — a guest reading the Armenian
// menu can still type "cola"). This file decides the order: an exact name
// beats a name that starts with the query, which beats a word inside the
// name, which beats a match found only in the description.
// ─────────────────────────────────────────────────────────────────────────

/** Shorter queries return nothing — one letter matches half the menu. */
export const MIN_QUERY = 2
/** A guest types a dish name, not a paragraph. */
export const MAX_TERMS = 5
/** Results a guest can sensibly scan; the rest is noise. */
export const MAX_RESULTS = 30

export const normalize = (s: string): string => s.toLocaleLowerCase().replace(/\s+/g, ' ').trim()

/**
 * Distinct search terms. LIKE wildcards are dropped, so "%" cannot turn the
 * query into "match everything". Hyphenated words stay whole ("coca-cola").
 */
export function searchTerms(query: string): string[] {
  const terms = normalize(query)
    .replace(/[%_\\]/g, '')
    .split(' ')
    .filter(Boolean)
  return [...new Set(terms)].slice(0, MAX_TERMS)
}

export interface SearchText {
  languageId: string
  name: string
  description: string | null
}

export interface SearchCandidate {
  id: string
  sortOrder: number
  texts: SearchText[]
}

const WORD_SPLIT = /[\s\-–—,.()/«»"'&+]+/

const wordStarts = (text: string, q: string) => text.split(WORD_SPLIT).some((w) => w.startsWith(q))

/** How well one translation of a dish matches. 0 = not at all. */
export function scoreText(t: SearchText, query: string, terms: string[]): number {
  const q = normalize(query)
  const name = normalize(t.name)
  const desc = normalize(t.description ?? '')

  // Among name matches, the query covering more of the name wins: "cola" is a
  // better answer in "Coca-Cola" than in "Salad with cola dressing".
  const cover = name ? Math.min(q.length / name.length, 1) * 5 : 0

  if (name === q) return 100 + cover
  if (name.startsWith(q)) return 80 + cover
  if (wordStarts(name, q)) return 60 + cover
  if (name.includes(q)) return 45 + cover
  if (terms.length > 1 && terms.every((x) => name.includes(x))) return 35 + cover
  if (desc.includes(q)) return 15
  if (terms.every((x) => name.includes(x) || desc.includes(x))) return 10
  return 0
}

/**
 * Rank the dishes the database found. A dish scores by its best-matching
 * language; the guest's own language wins a tie. A dish whose terms were only
 * found spread over different languages still ranks, just last.
 */
export function rankProducts(
  candidates: SearchCandidate[],
  query: string,
  preferredLanguageId?: string,
): { id: string; score: number }[] {
  const terms = searchTerms(query)
  if (normalize(query).length < MIN_QUERY || !terms.length) return []

  const ranked = candidates.map((c) => {
    let best = 0
    for (const t of c.texts) {
      const s = scoreText(t, query, terms)
      if (s === 0) continue
      best = Math.max(best, s + (t.languageId === preferredLanguageId ? 0.5 : 0))
    }
    if (best === 0) {
      const all = normalize(c.texts.map((t) => `${t.name} ${t.description ?? ''}`).join(' '))
      if (terms.every((x) => all.includes(x))) best = 5
    }
    return { id: c.id, score: best, sortOrder: c.sortOrder }
  })

  return ranked
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
    .map(({ id, score }) => ({ id, score }))
}
