import type { UserRole } from '@prisma/client'

/** Decoded JWT access-token payload, attached to the request as `req.user`. */
export interface AuthUser {
  sub: string // userId
  role: UserRole
  restaurantId: string | null
  /** Issued-at (seconds, set by the JWT library). Used for staleness checks. */
  iat?: number
  exp?: number
}
