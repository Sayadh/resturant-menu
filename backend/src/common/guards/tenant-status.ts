// ─────────────────────────────────────────────────────────────────────────
// Tenant usability rule (MED-5).
//
// Suspending a restaurant (isActive = false) or soft-deleting it only hid the
// PUBLIC menu — its owner kept full admin API access, so a suspended or
// non-paying tenant could carry on editing products, uploading images and
// spending AI quota.
//
// Pure + dependency-free so the rule is unit-testable and applied in exactly
// one place (RestaurantScopeGuard).
// ─────────────────────────────────────────────────────────────────────────

export interface TenantStatus {
  isActive: boolean
  deletedAt: Date | null
}

export type TenantBlockReason = 'missing' | 'deleted' | 'suspended'

/**
 * @param status the tenant row's status, or null/undefined when it no longer
 *               exists (a JWT can outlive the restaurant it points at)
 * @returns why the tenant may not be used, or null when it is usable
 */
export function tenantBlockReason(
  status: TenantStatus | null | undefined,
): TenantBlockReason | null {
  if (!status) return 'missing'
  if (status.deletedAt) return 'deleted'
  if (!status.isActive) return 'suspended'
  return null
}

/** Client-facing text. Deliberately identical for deleted/missing so a
 *  suspended tenant can be told something useful without revealing whether
 *  another restaurant exists. */
export function tenantBlockMessage(reason: TenantBlockReason): string {
  return reason === 'suspended'
    ? 'This restaurant is suspended. Please contact support.'
    : 'This restaurant is no longer available.'
}
