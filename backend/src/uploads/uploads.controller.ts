import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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
  @Post('image')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImage(
    @RestaurantId() rid: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; storageKey: string }> {
    return this.uploads.uploadImage(rid, file)
  }
}
