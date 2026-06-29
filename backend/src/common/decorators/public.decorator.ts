import { SetMetadata, CustomDecorator } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'

/** Marks a route (or controller) as public — bypasses JwtAuthGuard. */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true)
