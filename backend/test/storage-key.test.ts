// Regression tests for HIGH-1 — cross-tenant Supabase Storage deletion.
//
// Run: npm test   (Node's built-in runner + type stripping — no extra deps)
//
// These lock the tenant-ownership rules that every storage delete goes through
// (UploadsService.removeOwnByUrl → resolveOwnedKey). If any of these fail, a
// tenant can delete another tenant's images.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { keyFromPublicUrl, resolveOwnedKey } from '../src/uploads/storage-key.ts'

const BASE = 'https://proj.supabase.co'
const BUCKET = 'menu-images'
const A = '11111111-1111-4111-8111-111111111111' // tenant A (the caller)
const B = '22222222-2222-4222-8222-222222222222' // tenant B (the victim)

const publicUrl = (key: string) => `${BASE}/storage/v1/object/public/${BUCKET}/${key}`
const ownKey = `restaurants/${A}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`
const victimKey = `restaurants/${B}/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.jpg`

describe('keyFromPublicUrl', () => {
  it('extracts the key from one of our public URLs', () => {
    assert.equal(keyFromPublicUrl(BASE, BUCKET, publicUrl(ownKey)), ownKey)
  })

  it('ignores query strings and fragments', () => {
    assert.equal(keyFromPublicUrl(BASE, BUCKET, `${publicUrl(ownKey)}?v=2#x`), ownKey)
  })

  it('returns null for a foreign origin', () => {
    assert.equal(
      keyFromPublicUrl(BASE, BUCKET, `https://evil.example.com/storage/v1/object/public/${BUCKET}/${ownKey}`),
      null,
    )
  })

  it('returns null for a different bucket', () => {
    assert.equal(
      keyFromPublicUrl(BASE, BUCKET, `${BASE}/storage/v1/object/public/other-bucket/${ownKey}`),
      null,
    )
  })

  it('returns null for a non-public storage route', () => {
    assert.equal(
      keyFromPublicUrl(BASE, BUCKET, `${BASE}/storage/v1/object/${BUCKET}/${ownKey}`),
      null,
    )
  })

  it('returns null for malformed URLs', () => {
    for (const bad of ['not a url', 'javascript:alert(1)', '', '///', 'http://']) {
      assert.equal(keyFromPublicUrl(BASE, BUCKET, bad), null, `expected null for ${JSON.stringify(bad)}`)
    }
  })

  it('returns null for invalid percent-encoding', () => {
    assert.equal(keyFromPublicUrl(BASE, BUCKET, publicUrl('restaurants/%E0%A4%A/x.jpg')), null)
  })
})

describe('resolveOwnedKey — allowed', () => {
  it('lets a tenant delete its OWN file', () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(ownKey))
    assert.equal(r.ok, true)
    assert.equal(r.ok && r.key, ownKey)
  })

  it('allows nested paths inside the tenant prefix', () => {
    const nested = `restaurants/${A}/sub/dir/file.webp`
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(nested))
    assert.equal(r.ok, true)
    assert.equal(r.ok && r.key, nested)
  })

  it("resolves a tenant's own key even if the object no longer exists (caller handles 404)", () => {
    const gone = `restaurants/${A}/deleted-already.png`
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(gone))
    assert.equal(r.ok, true, 'authorization must succeed; existence is checked by the storage API')
  })
})

describe('resolveOwnedKey — denied (cross-tenant)', () => {
  it("BLOCKS tenant A deleting tenant B's file", () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(victimKey))
    assert.equal(r.ok, false)
    assert.equal(r.ok === false && r.reason, 'foreign-tenant')
  })

  it('BLOCKS percent-encoded tenant-prefix bypass', () => {
    // "restaurants%2F<B>%2Ffile.jpg" — decodes to B's key after the prefix.
    const encoded = `${BASE}/storage/v1/object/public/${BUCKET}/restaurants%2F${B}%2Fx.jpg`
    const r = resolveOwnedKey(BASE, BUCKET, A, encoded)
    assert.equal(r.ok, false)
    assert.equal(r.ok === false && r.reason, 'foreign-tenant')
  })

  // NOTE: the URL API normalises "..", "%2e%2e" and "\" while parsing, so these
  // arrive at the ownership check already collapsed to the victim's key. They
  // are therefore rejected as 'foreign-tenant' rather than 'unsafe-path'. What
  // matters — and what these tests lock — is that they are REJECTED.
  it('BLOCKS path traversal out of the tenant prefix', () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(`restaurants/${A}/../${B}/x.jpg`))
    assert.equal(r.ok, false, 'traversal to another tenant must be denied')
    assert.equal(r.ok === false && r.reason, 'foreign-tenant')
  })

  it('BLOCKS encoded path traversal (%2e%2e)', () => {
    const enc = `${BASE}/storage/v1/object/public/${BUCKET}/restaurants/${A}/%2e%2e/${B}/x.jpg`
    const r = resolveOwnedKey(BASE, BUCKET, A, enc)
    assert.equal(r.ok, false, 'encoded traversal must be denied')
    assert.equal(r.ok === false && r.reason, 'foreign-tenant')
  })

  it('BLOCKS traversal that escapes the bucket prefix entirely', () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(`restaurants/${A}/../../../etc/passwd`))
    assert.equal(r.ok, false, 'escaping the public-object route must be denied')
  })

  it('BLOCKS prefix confusion (id is a prefix of another id)', () => {
    const confusing = `restaurants/${A}-evil/x.jpg`
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(confusing))
    assert.equal(r.ok, false)
    assert.equal(r.ok === false && r.reason, 'foreign-tenant')
  })

  it('BLOCKS keys outside the tenant prefix (shared/global assets)', () => {
    for (const key of ['public/logo.png', 'x.jpg', 'restaurants']) {
      const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(key))
      assert.equal(r.ok, false, `expected denial for ${key}`)
      assert.equal(r.ok === false && r.reason, 'not-tenant-scoped')
    }
  })

  it('BLOCKS empty / double-slash segments', () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(`restaurants//${A}/x.jpg`))
    assert.equal(r.ok, false)
    assert.equal(r.ok === false && r.reason, 'unsafe-path')
  })

  it('BLOCKS backslash separator confusion', () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, publicUrl(`restaurants/${A}\\..\\${B}\\x.jpg`))
    assert.equal(r.ok, false, 'backslash-separated traversal must be denied')
    assert.equal(r.ok === false && r.reason, 'foreign-tenant')
  })

  it('BLOCKS raw control characters / NUL in the key', () => {
    // Bypasses URL normalisation by encoding, so isSafeKey() is what rejects it.
    const enc = `${BASE}/storage/v1/object/public/${BUCKET}/restaurants/${A}%00/x.jpg`
    const r = resolveOwnedKey(BASE, BUCKET, A, enc)
    assert.equal(r.ok, false, 'NUL byte in key must be denied')
    assert.equal(r.ok === false && r.reason, 'unsafe-path')
  })

  it('BLOCKS foreign URLs entirely (nothing to delete)', () => {
    const r = resolveOwnedKey(BASE, BUCKET, A, 'https://cdn.example.com/whatever.jpg')
    assert.equal(r.ok, false)
    assert.equal(r.ok === false && r.reason, 'not-our-storage')
  })

  it('BLOCKS deletion when there is no tenant context', () => {
    for (const rid of [null, undefined, '']) {
      const r = resolveOwnedKey(BASE, BUCKET, rid, publicUrl(ownKey))
      assert.equal(r.ok, false, `expected denial for rid=${String(rid)}`)
      assert.equal(r.ok === false && r.reason, 'not-tenant-scoped')
    }
  })
})
