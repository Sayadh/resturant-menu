import type { UserRole } from '@prisma/client'

/** Decoded JWT access-token payload, attached to the request as `req.user`. */
export interface AuthUser {
  sub: string // userId
  role: UserRole
  restaurantId: string | null
}
