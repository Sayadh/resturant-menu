import { SetMetadata, CustomDecorator } from '@nestjs/common'
import { UserRole } from '@prisma/client'

export const ROLES_KEY = 'roles'

/** Restricts a route to the given roles (SUPER_ADMIN always allowed). */
export const Roles = (...roles: UserRole[]): CustomDecorator => SetMetadata(ROLES_KEY, roles)

/** Convenience: restrict a route (or controller) to SUPER_ADMIN only. */
export const SuperAdmin = (): CustomDecorator => SetMetadata(ROLES_KEY, [UserRole.SUPER_ADMIN])
