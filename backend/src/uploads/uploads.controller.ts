import {
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Throttle } from '@nestjs/throttler'
import { UserRole } from '@prisma/client'
import { UploadsService } from './uploads.service'
import { RestaurantScopeGuard } from '../common/guards/restaurant-scope.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RestaurantId } from '../common/decorators/restaurant-id.decorator'

@UseGuards(RestaurantScopeGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  // Multipart: field name "file". Tenant id comes from the JWT (never the body).
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('image')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImage(
    @RestaurantId() rid: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; storageKey: string }> {
    return this.uploads.uploadImage(rid, file)
  }

  // Delete an object from storage by its public URL. Scoped: only files under
  // this restaurant's path are removable (never another tenant's, never foreign
  // URLs). Used by the admin to clean orphaned/unsaved uploads immediately.
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @Delete('image')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async deleteImage(
    @RestaurantId() rid: string,
    @Query('url') url: string,
  ): Promise<{ ok: true }> {
    await this.uploads.removeOwnByUrl(rid, url)
    return { ok: true }
  }
}
