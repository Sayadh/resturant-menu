// ─────────────────────────────────────────────────────────────────────────
// Access-token freshness check (HIGH-3).
//
// Refresh tokens are revoked in the database when credentials change, but an
// already-issued ACCESS token is stateless and would stay valid until it
// expires. This compares the token's `iat` against the user's
// `passwordChangedAt` so tokens minted before the change are rejected too.
//
// Pure + dependency-free so it is unit-testable and reusable.
// ─────────────────────────────────────────────────────────────────────────

/**
 * JWT `iat` is expressed in WHOLE SECONDS (floored), while `passwordChangedAt`
 * is a millisecond-precision timestamp. Without a grace window a token minted
 * in the same second as the change (e.g. logging in immediately after an admin
 * reset) would be floored below it and wrongly rejected.
 *
 * One second of slack removes that false rejection; the attacker-relevant
 * window (a token issued BEFORE the change) is unaffected because such tokens
 * are at least a full second older in practice, and the refresh token backing
 * them has already been revoked in the same transaction.
 */
export const IAT_GRACE_MS = 1_000

/**
 * @returns true when the token was issued before the credential change and
 *          must therefore be rejected.
 */
export function isTokenStale(
  iatSeconds: number | undefined,
  passwordChangedAt: Date | null | undefined,
): boolean {
  if (!passwordChangedAt) return false // credentials never changed → nothing to invalidate
  if (typeof iatSeconds !== 'number' || !Number.isFinite(iatSeconds)) {
    // A token without a usable `iat` cannot be proven fresh → reject.
    return true
  }
  const issuedAtMs = iatSeconds * 1000
  return issuedAtMs + IAT_GRACE_MS < passwordChangedAt.getTime()
}
