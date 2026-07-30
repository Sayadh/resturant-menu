// Regression tests for HIGH-2 (remnant) — no shared default password.
//
// The old code fell back to a constant ('password123') for every
// auto-provisioned owner. Combined with the predictable `owner@<slug>.test`
// address and the public restaurant list, that made any new tenant
// takeover-able. These lock the properties of the replacement generator.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { generateInitialPassword, PASSWORD_ALPHABET } from '../src/common/utils/password.ts'

describe('generateInitialPassword', () => {
  it('is never a constant — 500 draws are all distinct', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) seen.add(generateInitialPassword())
    assert.equal(seen.size, 500, 'generated passwords must not repeat')
  })

  it('defaults to 20 characters and honours an explicit length', () => {
    assert.equal(generateInitialPassword().length, 20)
    assert.equal(generateInitialPassword(32).length, 32)
    assert.equal(generateInitialPassword(12).length, 12)
  })

  it('refuses lengths that would be trivially brute-forceable', () => {
    for (const bad of [0, 8, 11, -1, 1.5, Number.NaN]) {
      assert.throws(() => generateInitialPassword(bad as number), /at least 12/)
    }
  })

  it('uses only unambiguous characters (no 0/O/1/l/I, no symbols)', () => {
    for (const forbidden of ['0', 'O', '1', 'l', 'I']) {
      assert.ok(!PASSWORD_ALPHABET.includes(forbidden), `${forbidden} must not be in the alphabet`)
    }
    const allowed = new Set(PASSWORD_ALPHABET)
    for (let i = 0; i < 100; i++) {
      for (const ch of generateInitialPassword()) {
        assert.ok(allowed.has(ch), `unexpected character ${JSON.stringify(ch)}`)
      }
    }
  })

  it('is not biased toward the start of the alphabet (rejection sampling)', () => {
    // Over 20k characters every symbol should appear; a modulo-biased
    // generator would over-represent the head of the alphabet and starve the
    // tail (256 % alphabet-length != 0).
    const counts = new Map<string, number>()
    for (let i = 0; i < 1000; i++) {
      for (const ch of generateInitialPassword()) counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    assert.equal(counts.size, PASSWORD_ALPHABET.length, 'every alphabet character should occur')
    const freqs = [...counts.values()]
    const min = Math.min(...freqs)
    const max = Math.max(...freqs)
    // Allow generous slack for randomness but catch a systematic 2× bias.
    assert.ok(max / min < 2, `distribution too skewed: min=${min} max=${max}`)
  })

  it('has enough entropy to resist offline guessing', () => {
    // log2(57) ≈ 5.8 bits/char × 20 chars ≈ 117 bits.
    const bits = Math.log2(PASSWORD_ALPHABET.length) * generateInitialPassword().length
    assert.ok(bits > 100, `only ${bits.toFixed(0)} bits of entropy`)
  })
})
