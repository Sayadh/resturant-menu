// Menu search ranking — what a guest sees first when they type a dish name.
//
// Run: npm test   (Node's built-in runner + type stripping — no extra deps)
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { rankProducts, searchTerms, type SearchCandidate } from '../src/public/menu-search.ts'

const HY = 'lang-hy'
const EN = 'lang-en'

const dish = (id: string, sortOrder: number, texts: [string, string, string | null][]): SearchCandidate => ({
  id,
  sortOrder,
  texts: texts.map(([languageId, name, description]) => ({ languageId, name, description })),
})

describe('searchTerms', () => {
  it('lower-cases, trims and de-duplicates', () => {
    assert.deepEqual(searchTerms('  Cola  cola PEPSI '), ['cola', 'pepsi'])
  })

  it('keeps hyphenated words whole', () => {
    assert.deepEqual(searchTerms('Coca-Cola'), ['coca-cola'])
  })

  it('drops LIKE wildcards so "%" cannot match everything', () => {
    assert.deepEqual(searchTerms('%'), [])
    assert.deepEqual(searchTerms('co%la_'), ['cola'])
  })

  it('caps the number of terms', () => {
    assert.equal(searchTerms('a b c d e f g').length, 5)
  })
})

describe('rankProducts', () => {
  const menu = [
    dish('salad', 1, [[EN, 'Salad with cola dressing', null]]),
    dish('cola', 5, [[HY, 'Կոկա-Կոլա', null], [EN, 'Coca-Cola', 'Classic soft drink']]),
    dish('cola-zero', 6, [[EN, 'Cola Zero', null]]),
    dish('lemonade', 2, [[EN, 'Lemonade', 'Tastes better than cola']]),
    dish('pepsi', 3, [[EN, 'Pepsi', null]]),
  ]

  it('returns nothing for a one-letter query', () => {
    assert.deepEqual(rankProducts(menu, 'c'), [])
  })

  it('ranks a name that starts with the query above a word inside a name', () => {
    const ids = rankProducts(menu, 'cola').map((r) => r.id)
    assert.deepEqual(ids, ['cola-zero', 'cola', 'salad', 'lemonade'])
  })

  it('matches across languages — Latin query, Armenian menu', () => {
    const ids = rankProducts([menu[1]], 'coca', HY).map((r) => r.id)
    assert.deepEqual(ids, ['cola'])
  })

  it('finds a dish by its Armenian name', () => {
    assert.deepEqual(
      rankProducts(menu, 'կոլա').map((r) => r.id),
      ['cola'],
    )
  })

  it('an exact name wins over everything', () => {
    assert.equal(rankProducts(menu, 'pepsi')[0].id, 'pepsi')
  })

  it('every term must match — "cola zero" is not "cola"', () => {
    assert.deepEqual(
      rankProducts(menu, 'cola zero').map((r) => r.id),
      ['cola-zero'],
    )
  })

  it("prefers the guest's language when scores tie", () => {
    const twin = [
      dish('a', 1, [[EN, 'Tea', null]]),
      dish('b', 2, [[HY, 'Tea', null]]),
    ]
    assert.equal(rankProducts(twin, 'tea', HY)[0].id, 'b')
  })
})
