import { randomBytes } from 'node:crypto'

/**
 * Alphabet for generated credentials. Deliberately excludes look-alike glyphs
 * (0/O, 1/l/I) because these passwords are read aloud / copied by hand when a
 * super-admin hands a new restaurant over to its owner.
 */
export const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
const ALPHABET = PASSWORD_ALPHABET
const DEFAULT_LENGTH = 20

/**
 * Cryptographically random initial password for a newly provisioned owner.
 *
 * Replaces the previous hard-coded 'password123' fallback: combined with the
 * predictable `owner@<slug>.test` address and the public restaurant list, that
 * constant made every auto-provisioned tenant trivially takeover-able.
 *
 * Uses rejection sampling so every character is uniformly distributed —
 * `byte % ALPHABET.length` would bias the first few letters.
 */
export function generateInitialPassword(length: number = DEFAULT_LENGTH): string {
  if (!Number.isInteger(length) || length < 12) {
    throw new Error('Generated passwords must be at least 12 characters')
  }
  const max = Math.floor(256 / ALPHABET.length) * ALPHABET.length // largest unbiased bound
  let out = ''
  while (out.length < length) {
    for (const byte of randomBytes(length)) {
      if (byte >= max) continue // reject → keeps the distribution uniform
      out += ALPHABET[byte % ALPHABET.length]
      if (out.length === length) break
    }
  }
  return out
}
